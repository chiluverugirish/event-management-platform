import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Ticket from "./Ticket";

class Attendee extends Model {
  public id!: number;
  public ticketId!: number;
  public name!: string;
  public email!: string;
  public phone?: string;
  public checkedIn!: boolean;
  public checkInTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendee.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    ticketId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    checkedIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  { 
    sequelize, 
    modelName: "Attendee", 
    tableName: "attendees", 
    timestamps: true 
  }
);

Attendee.belongsTo(Ticket, { foreignKey: "ticketId" });

export default Attendee;
