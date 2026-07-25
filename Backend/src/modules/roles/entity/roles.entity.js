// src/modules/roles/entity/roles.model.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');

class Rol extends Model {}

Rol.init(
  {
    id: { type: DataTypes.TINYINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    modelName: 'Rol',
    tableName: 'roles',
    timestamps: false,
  }
);

module.exports = Rol;
