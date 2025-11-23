import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./User";
import Event from "./Event";

class Ticket extends Model {
  public id!: number;
  public eventId!: number;
  public userId!: number;
  public type!: string; // VIP, General, Early Bird, etc.
  public price!: number;
  public qrCode!: string;
  public paymentStatus!: string; // pending, completed, failed, refunded
  public paymentId?: string;
  public status!: string; // active, cancelled, used
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'used'),
      defaultValue: 'active',
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Ticket",
    tableName: "tickets",
    timestamps: true,
  }
);

// Associations
Ticket.belongsTo(User, { foreignKey: "userId" });
Ticket.belongsTo(Event, { foreignKey: "eventId" });

export default Ticket;
