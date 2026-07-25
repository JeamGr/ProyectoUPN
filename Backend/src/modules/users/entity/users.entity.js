// src/modules/users/entity/users.model.js
// Mapea la tabla `usuarios` — es la base común de CUALQUIER tipo de cuenta
// (voluntario u organización). auth y volunteers/organizations la comparten.
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');

class Usuario extends Model {}

Usuario.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: true },
    rol_id: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    estado: {
      type: DataTypes.ENUM('pendiente_verificacion', 'activo', 'bloqueado', 'eliminado'),
      allowNull: false,
      defaultValue: 'pendiente_verificacion',
    },
    intentos_fallidos: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
    fecha_bloqueo: { type: DataTypes.DATE, allowNull: true },
    fecha_registro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_verificacion: { type: DataTypes.DATE, allowNull: true },
    fecha_baja: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false,
  }
);

module.exports = Usuario;
