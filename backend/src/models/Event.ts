import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Event extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public date!: Date;
  public endDate?: Date;
  public location!: string;
  public capacity!: number;
  public ticketsSold!: number;
  public status!: string; // upcoming, ongoing, completed, cancelled
  public organizerId!: number;
  public ticketTypes?: any; // JSON field for different ticket types with prices
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    ticketsSold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'upcoming',
      allowNull: false
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ticketTypes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        General: { price: 0, available: 100 },
        VIP: { price: 0, available: 0 },
        EarlyBird: { price: 0, available: 0 }
      }
    }
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    timestamps: true,
  }
);

// Import User for association (will be set up after all models are loaded)
// Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });

export default Event;
