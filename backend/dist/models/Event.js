"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Event extends sequelize_1.Model {
}
Event.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    capacity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    ticketsSold: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
        defaultValue: 'upcoming',
        allowNull: false
    },
    organizerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    ticketTypes: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            General: { price: 0, available: 100 },
            VIP: { price: 0, available: 0 },
            EarlyBird: { price: 0, available: 0 }
        }
    }
}, {
    sequelize: db_1.default,
    modelName: "Event",
    tableName: "events",
    timestamps: true,
});
// Import User for association (will be set up after all models are loaded)
// Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });
exports.default = Event;
