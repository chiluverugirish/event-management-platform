// src/controllers/ticketController.ts
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import Ticket from "../models/Ticket";
import Event from "../models/Event";
import User from "../models/User";
import Attendee from "../models/Attendee";
import { transporter } from "../config/mailer";
import { processPayment, verifyPayment } from "../config/payment";
import sequelize from "../config/db";
import { Transaction } from "sequelize";

// 🟢 Book Ticket (Protected) - Enhanced with ACID-compliant payment processing
export const bookTicket = async (req: any, res: any) => {
  // Initialize transaction variable outside try block for finally clause access
  let transaction: Transaction | null = null;
  
  try {
    const { eventId, type, paymentMethod } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!eventId || !type) {
      return res.status(400).json({ 
        message: "Missing required fields: eventId and type are required" 
      });
    }

    // Start database transaction for ACID compliance
    transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });

    // Check if event exists with row-level locking to prevent race conditions
    const event = await Event.findByPk(eventId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if event is not cancelled
    if (event.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ message: "Event has been cancelled" });
    }

    // Check capacity with locked row to ensure atomicity
    if (event.ticketsSold >= event.capacity) {
      await transaction.rollback();
      return res.status(400).json({ message: "Event is sold out" });
    }

    // Get ticket price from event ticketTypes
    let ticketTypes: any = {};
    
    // Parse ticketTypes if it's a string (from database)
    if (typeof event.ticketTypes === 'string') {
      try {
        ticketTypes = JSON.parse(event.ticketTypes);
      } catch (e) {
        await transaction.rollback();
        return res.status(500).json({ 
          message: "Invalid ticket types configuration for this event" 
        });
      }
    } else if (typeof event.ticketTypes === 'object' && event.ticketTypes !== null) {
      ticketTypes = event.ticketTypes;
    } else {
      ticketTypes = { General: { price: 0, available: 100 } };
    }
    
    // Get the specific ticket type
    const ticketType = ticketTypes[type];
    
    if (!ticketType) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: `Ticket type "${type}" not found for this event`,
        availableTypes: Object.keys(ticketTypes)
      });
    }
    
    const price = ticketType.price || 0;

    // Validate price
    if (price < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: "Invalid ticket price" });
    }

    // Get user info
    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // CRITICAL: Process payment BEFORE any database changes
    // This ensures payment is confirmed before ticket creation
    let paymentResult;
    try {
      paymentResult = await processPayment(
        price,
        type,
        user.email,
        { eventId, userId, eventTitle: event.title, paymentMethod }
      );
    } catch (paymentError: any) {
      await transaction.rollback();
      console.error("❌ Payment processing error:", paymentError);
      return res.status(500).json({ 
        message: "Payment processing failed", 
        error: paymentError.message 
      });
    }

    // CRITICAL: Check payment success before proceeding
    if (!paymentResult.success || paymentResult.status !== 'completed') {
      await transaction.rollback();
      console.error("❌ Payment failed:", paymentResult.message);
      return res.status(400).json({ 
        message: "Payment failed. No ticket created.", 
        error: paymentResult.message,
        paymentStatus: paymentResult.status
      });
    }

    // Verify payment was actually processed
    const isPaymentValid = await verifyPayment(paymentResult.paymentId!);
    if (!isPaymentValid) {
      await transaction.rollback();
      console.error("❌ Payment verification failed for:", paymentResult.paymentId);
      return res.status(400).json({ 
        message: "Payment verification failed. Please contact support.", 
        paymentId: paymentResult.paymentId
      });
    }

    console.log("✅ Payment verified successfully:", paymentResult.paymentId);

    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${userId}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate QR code with comprehensive event and ticket details
    const qrData = JSON.stringify({
      ticketId: ticketId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      ticketType: type,
      price: price,
      paymentId: paymentResult.paymentId,
      issuedAt: new Date().toISOString(),
      status: 'active'
    });
    
    let qrCode: string;
    try {
      qrCode = await QRCode.toDataURL(qrData);
    } catch (qrError: any) {
      await transaction.rollback();
      console.error("❌ QR code generation failed:", qrError);
      return res.status(500).json({ 
        message: "Failed to generate ticket QR code", 
        error: qrError.message 
      });
    }

    // Create ticket in DB within transaction
    let ticket;
    try {
      ticket = await Ticket.create({ 
        eventId, 
        userId, 
        type, 
        price,
        qrCode,
        paymentStatus: paymentResult.status,
        paymentId: paymentResult.paymentId,
        status: 'active'
      }, { transaction });
      
      console.log("✅ Ticket created in database:", ticket.id);
    } catch (ticketError: any) {
      await transaction.rollback();
      console.error("❌ Ticket creation failed:", ticketError);
      return res.status(500).json({ 
        message: "Failed to create ticket record", 
        error: ticketError.message 
      });
    }

    // Update event tickets sold within transaction
    try {
      event.ticketsSold = event.ticketsSold + 1;
      await event.save({ transaction });
      console.log("✅ Event tickets sold updated:", event.ticketsSold);
    } catch (updateError: any) {
      await transaction.rollback();
      console.error("❌ Failed to update event tickets sold:", updateError);
      return res.status(500).json({ 
        message: "Failed to update event capacity", 
        error: updateError.message 
      });
    }

    // Create attendee record within transaction
    try {
      await Attendee.create({
        ticketId: ticket.id,
        name: user.name,
        email: user.email,
        checkedIn: false
      }, { transaction });
      
      console.log("✅ Attendee record created");
    } catch (attendeeError: any) {
      await transaction.rollback();
      console.error("❌ Attendee creation failed:", attendeeError);
      return res.status(500).json({ 
        message: "Failed to create attendee record", 
        error: attendeeError.message 
      });
    }

    // COMMIT TRANSACTION - All database operations successful
    await transaction.commit();
    console.log("✅ Transaction committed successfully");

    // 🔹 Save QR code as PNG locally (after successful transaction)
    try {
      const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
      const filename = `ticket-${ticket.id}.png`;
      const folderPath = path.join(__dirname, "../../tickets");
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(path.join(folderPath, filename), base64Data, "base64");
      console.log(`✅ QR code saved as tickets/${filename}`);
    } catch (fileError: any) {
      // Non-critical error - log but don't fail the request
      console.error("⚠️ Failed to save QR code file:", fileError.message);
    }

    // 🔹 CRITICAL: Send confirmation email ONLY after payment and ticket creation success
    // Email should only be sent when payment is completed and ticket is in database
    if (user.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `🎟️ Payment Confirmed - Your Ticket for ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #0284c7; border-radius: 10px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Payment Successful!</h1>
                <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Your ticket is confirmed</p>
              </div>
              
              <div style="padding: 30px;">
                <h2 style="color: #0284c7; margin-top: 0;">Hi ${user.name},</h2>
                <p style="font-size: 16px; color: #334155;">Your payment has been processed successfully and your ticket has been issued!</p>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0284c7;">
                  <h3 style="margin-top: 0; color: #0369a1;">📅 Event Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Event:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${event.title}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Ticket Type:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${type}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Location:</td>
                      <td style="padding: 8px 0; color: #1e293b;">${event.location}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Ticket ID:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${ticketId}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                  <h3 style="margin-top: 0; color: #059669;">💳 Payment Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Amount Paid:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">$${price.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Payment ID:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${paymentResult.paymentId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Transaction ID:</td>
                      <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${paymentResult.transactionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Status:</td>
                      <td style="padding: 8px 0; color: #059669; font-weight: bold;">✓ COMPLETED</td>
                    </tr>
                  </table>
                </div>

                <div style="text-align: center; margin: 30px 0; padding: 25px; background: white; border: 2px dashed #0284c7; border-radius: 8px;">
                  <h3 style="color: #0284c7; margin-top: 0;">🎫 Your Entry Pass</h3>
                  <p style="color: #64748b; margin-bottom: 15px;">Scan this QR code at the event entrance</p>
                  <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 250px; border: 4px solid #0284c7; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                  <p style="font-size: 11px; color: #94a3b8; margin-top: 15px;">QR Code contains: Event details, Ticket ID, and verification data</p>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ Important:</strong> Please save this email or take a screenshot of the QR code. 
                    You'll need to present it at the event entrance for check-in. No physical ticket is required.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                  <p style="color: #64748b; margin: 5px 0;">Looking forward to seeing you at the event! 🎊</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">EventHub Team</p>
                  <p style="color: #cbd5e1; font-size: 11px; margin: 5px 0 0 0;">This is an automated confirmation email for your ticket purchase.</p>
                </div>
              </div>
            </div>
          `,
        });
        console.log(`✅ Confirmation email sent to ${user.email}`);
      } catch (emailError: any) {
        // Non-critical error - ticket is already created, just log the email failure
        console.error("⚠️ Failed to send confirmation email:", emailError.message);
        // Don't fail the request - ticket is valid even without email
      }
    }

    // Return success response with complete information
    res.status(201).json({ 
      message: "Ticket booked and payment completed successfully", 
      ticket: {
        id: ticket.id,
        ticketId: ticketId,
        eventId: ticket.eventId,
        type: ticket.type,
        price: ticket.price,
        status: ticket.status,
        qrCode: ticket.qrCode
      },
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location
      },
      payment: {
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.paymentId,
        amount: price,
        status: paymentResult.status,
        currency: paymentResult.currency
      }
    });
    
  } catch (err: any) {
    // CRITICAL: Rollback transaction on any error
    if (transaction) {
      try {
        await transaction.rollback();
        console.log("🔄 Transaction rolled back due to error");
      } catch (rollbackError: any) {
        console.error("❌ Failed to rollback transaction:", rollbackError.message);
      }
    }
    
    console.error("❌ Error booking ticket:", err);
    res.status(500).json({ 
      message: "Error booking ticket. No charges were made.", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// 🔵 Get all tickets for logged-in user (Protected)
export const getMyTickets = async (req: any, res: any) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Event },
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ 
      message: "Error fetching tickets", 
      error: err.message 
    });
  }
};

// 🔹 Cancel ticket (Protected) - With ACID-compliant transaction handling
export const cancelTicket = async (req: any, res: any) => {
  let transaction: Transaction | null = null;
  
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Input validation
    if (!id) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    // Start transaction for ACID compliance
    transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
    });

    // Find ticket with lock to prevent race conditions
    const ticket = await Ticket.findOne({
      where: { id, userId },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ message: "Ticket not found or you don't have permission" });
    }

    // Validate ticket can be cancelled
    if (ticket.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }

    if (ticket.status === 'used') {
      await transaction.rollback();
      return res.status(400).json({ 
        message: "Cannot cancel a used ticket" 
      });
    }

    // Get event details
    const event = await Event.findByPk(ticket.eventId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    // Process refund if payment was completed
    let refundResult = null;
    if (ticket.paymentStatus === 'completed' && ticket.paymentId) {
      try {
        const { refundPayment } = require('../config/payment');
        refundResult = await refundPayment(ticket.paymentId);
        
        if (!refundResult.success) {
          await transaction.rollback();
          console.error("❌ Refund failed:", refundResult.message);
          return res.status(400).json({ 
            message: "Refund processing failed", 
            error: refundResult.message 
          });
        }
        console.log("✅ Refund processed:", refundResult.transactionId);
      } catch (refundError: any) {
        await transaction.rollback();
        console.error("❌ Refund error:", refundError);
        return res.status(500).json({ 
          message: "Error processing refund", 
          error: refundError.message 
        });
      }
    }

    // Update ticket status within transaction
    ticket.status = 'cancelled';
    ticket.paymentStatus = ticket.paymentStatus === 'completed' ? 'refunded' : ticket.paymentStatus;
    await ticket.save({ transaction });
    console.log("✅ Ticket status updated to cancelled");

    // Update event tickets sold within transaction
    if (event.ticketsSold > 0) {
      event.ticketsSold = event.ticketsSold - 1;
      await event.save({ transaction });
      console.log("✅ Event tickets sold decremented");
    }

    // Commit transaction
    await transaction.commit();
    console.log("✅ Cancellation transaction committed");

    // Send cancellation email (non-critical, after transaction)
    try {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Ticket Cancelled - ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Ticket Cancelled</h2>
              <p>Hi ${user.name},</p>
              <p>Your ticket has been cancelled successfully.</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Cancellation Details</h3>
                <p><strong>Event:</strong> ${event.title}</p>
                <p><strong>Ticket Type:</strong> ${ticket.type}</p>
                <p><strong>Original Price:</strong> $${ticket.price}</p>
                ${refundResult ? `
                  <p><strong>Refund Status:</strong> ${refundResult.status}</p>
                  <p><strong>Refund Transaction ID:</strong> ${refundResult.transactionId}</p>
                  <p style="color: #059669;"><strong>✓ Refund processed successfully</strong></p>
                ` : ''}
              </div>

              <p style="color: #666; font-size: 14px;">
                ${refundResult ? 'Your refund will be processed within 5-7 business days.' : 'No refund applicable for this ticket.'}
              </p>

              <p style="color: #999; font-size: 12px;">EventHub Team</p>
            </div>
          `,
        });
        console.log(`✅ Cancellation email sent to ${user.email}`);
      }
    } catch (emailError: any) {
      // Non-critical - log but don't fail
      console.error("⚠️ Failed to send cancellation email:", emailError.message);
    }

    res.status(200).json({ 
      message: "Ticket cancelled successfully", 
      ticket: {
        id: ticket.id,
        status: ticket.status,
        paymentStatus: ticket.paymentStatus
      },
      refund: refundResult ? {
        transactionId: refundResult.transactionId,
        status: refundResult.status,
        amount: ticket.price
      } : null
    });
    
  } catch (err: any) {
    // Rollback transaction on error
    if (transaction) {
      try {
        await transaction.rollback();
        console.log("🔄 Transaction rolled back due to error");
      } catch (rollbackError: any) {
        console.error("❌ Failed to rollback transaction:", rollbackError.message);
      }
    }
    
    console.error("❌ Error cancelling ticket:", err);
    res.status(500).json({ 
      message: "Error cancelling ticket", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
