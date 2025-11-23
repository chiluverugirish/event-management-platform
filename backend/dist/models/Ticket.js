"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const User_1 = __importDefault(require("./User"));
const Event_1 = __importDefault(require("./Event"));
class Ticket extends sequelize_1.Model {
}
Ticket.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    eventId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'events',
            key: 'id'
        }
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'General'
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    qrCode: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    paymentStatus: {
        type: sequelize_1.DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
    },
    paymentId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'cancelled', 'used'),
        defaultValue: 'active',
        allowNull: false
    }
}, {
    sequelize: db_1.default,
    modelName: "Ticket",
    tableName: "tickets",
    timestamps: true,
});
// Associations
Ticket.belongsTo(User_1.default, { foreignKey: "userId" });
Ticket.belongsTo(Event_1.default, { foreignKey: "eventId" });
exports.default = Ticket;
