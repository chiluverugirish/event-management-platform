/**
 * Payment Processing Module
 * Simulates Stripe/PayPal payment gateway with ACID-compliant operations
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status: 'completed' | 'failed' | 'pending';
  message: string;
  amount?: number;
  currency?: string;
}

// In-memory store for payment verification (in production, use Redis or database)
const paymentStore = new Map<string, PaymentResult>();

export const processPayment = async (
  amount: number, 
  type: string,
  customerEmail: string,
  metadata?: any
): Promise<PaymentResult> => {
  try {
    // Input validation
    if (amount < 0) {
      return {
        success: false,
        status: 'failed',
        message: 'Invalid payment amount'
      };
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      return {
        success: false,
        status: 'failed',
        message: 'Invalid customer email'
      };
    }

    // Generate unique payment ID for idempotency
    const paymentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    console.log(`🔄 Processing payment: ${paymentId}`);
    console.log(`   Amount: $${amount}`);
    console.log(`   Customer: ${customerEmail}`);
    console.log(`   Type: ${type}`);

    // Simulate payment processing delay (realistic API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 97% success rate (more realistic for production)
    const isSuccessful = Math.random() > 0.03;

    if (isSuccessful) {
      const result: PaymentResult = {
        success: true,
        status: 'completed',
        paymentId,
        transactionId,
        amount,
        currency: 'USD',
        message: 'Payment processed successfully'
      };

      // Store payment for verification (idempotency)
      paymentStore.set(paymentId, result);
      
      console.log(`✅ Payment successful: ${paymentId}`);
      return result;
    } else {
      const failureReasons = [
        'Payment declined by card issuer',
        'Insufficient funds',
        'Card expired',
        'Invalid card number',
        'Payment gateway timeout'
      ];
      const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      
      console.log(`❌ Payment failed: ${reason}`);
      
      return {
        success: false,
        status: 'failed',
        message: reason,
        paymentId,
        transactionId
      };
    }
  } catch (error: any) {
    console.error('❌ Payment processing error:', error);
    return {
      success: false,
      status: 'failed',
      message: error.message || 'Payment processing error - please try again'
    };
  }
};

export const refundPayment = async (paymentId: string): Promise<PaymentResult> => {
  try {
    if (!paymentId) {
      return {
        success: false,
        status: 'failed',
        message: 'Payment ID is required for refund'
      };
    }

    console.log(`🔄 Processing refund for payment: ${paymentId}`);

    // Verify payment exists and was completed
    const originalPayment = paymentStore.get(paymentId);
    if (!originalPayment) {
      console.log(`⚠️ Payment not found in store: ${paymentId}`);
      // Still process refund (payment may be from older session)
    } else if (originalPayment.status !== 'completed') {
      return {
        success: false,
        status: 'failed',
        message: 'Cannot refund a payment that was not completed'
      };
    }

    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate 98% refund success rate
    const isSuccessful = Math.random() > 0.02;

    if (isSuccessful) {
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      console.log(`✅ Refund successful: ${refundId}`);
      
      return {
        success: true,
        status: 'completed',
        paymentId,
        transactionId: refundId,
        amount: originalPayment?.amount,
        currency: 'USD',
        message: 'Refund processed successfully'
      };
    } else {
      console.log(`❌ Refund failed for: ${paymentId}`);
      return {
        success: false,
        status: 'failed',
        paymentId,
        message: 'Refund failed - payment gateway error'
      };
    }
  } catch (error: any) {
    console.error('❌ Refund processing error:', error);
    return {
      success: false,
      status: 'failed',
      message: error.message || 'Refund processing error'
    };
  }
};

export const verifyPayment = async (paymentId: string): Promise<boolean> => {
  try {
    if (!paymentId || !paymentId.startsWith('pi_')) {
      console.log(`❌ Invalid payment ID format: ${paymentId}`);
      return false;
    }

    // Check if payment exists in store
    const payment = paymentStore.get(paymentId);
    if (payment) {
      console.log(`✅ Payment verified from store: ${paymentId}`);
      return payment.status === 'completed';
    }

    // Simulate external verification API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // For demo: accept all valid-format payment IDs
    console.log(`✅ Payment verified (external): ${paymentId}`);
    return true;
  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    return false;
  }
};

// Helper function to check payment idempotency
export const checkDuplicatePayment = (userId: number, eventId: number): boolean => {
  // In production, query database for recent payments
  // For demo, we'll allow all payments
  return false;
};

// Clean up old payment records (call periodically)
export const cleanupPaymentStore = (maxAge: number = 24 * 60 * 60 * 1000): void => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, value] of paymentStore.entries()) {
    // Extract timestamp from payment ID
    const timestamp = parseInt(key.split('_')[1]);
    if (now - timestamp > maxAge) {
      paymentStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned up ${cleaned} old payment records`);
  }
};
