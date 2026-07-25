// src/modules/auth/entity/auth.model.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');

class CodigoVerificacion extends Model {}
CodigoVerificacion.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    codigo_hash: { type: DataTypes.STRING(255), allowNull: false },
    intentos: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expira_en: { type: DataTypes.DATE, allowNull: false },
    usado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'CodigoVerificacion', tableName: 'codigos_verificacion', timestamps: false }
);

class TokenRecuperacionPassword extends Model {}
TokenRecuperacionPassword.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    token_hash: { type: DataTypes.STRING(255), allowNull: false },
    expira_en: { type: DataTypes.DATE, allowNull: false },
    usado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'TokenRecuperacionPassword',
    tableName: 'tokens_recuperacion_password',
    timestamps: false,
  }
);

class IdentidadOAuth extends Model {}
IdentidadOAuth.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    proveedor: { type: DataTypes.ENUM('google', 'microsoft'), allowNull: false },
    proveedor_uid: { type: DataTypes.STRING(255), allowNull: false },
    correo_proveedor: { type: DataTypes.STRING(150), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'IdentidadOAuth', tableName: 'identidades_oauth', timestamps: false }
);

module.exports = { CodigoVerificacion, TokenRecuperacionPassword, IdentidadOAuth };