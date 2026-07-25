// src/modules/volunteers/entity/volunteers.model.js
// RF-009: perfil extendido del voluntario. SIEMPRE estudiante UPN
// (codigo_estudiante, carrera y ciclo son obligatorios por decisión de
// alcance del proyecto — ver confirmación de scope UPN).
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');
const Usuario = require('../../users/entity/users.entity');

class PerfilVoluntario extends Model {}

PerfilVoluntario.init(
  {
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
    codigo_estudiante: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    carrera: { type: DataTypes.STRING(100), allowNull: false },
    ciclo: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    telefono: { type: DataTypes.STRING(20), allowNull: true },
    ubicacion: { type: DataTypes.STRING(150), allowNull: true },
    habilidades: { type: DataTypes.TEXT, allowNull: true },
    disponibilidad: { type: DataTypes.STRING(255), allowNull: true },
    foto_url: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    sequelize,
    modelName: 'PerfilVoluntario',
    tableName: 'perfiles_voluntario',
    timestamps: false,
  }
);

// Relación 1:1 con Usuario (Sección 14.2 del SRS)
Usuario.hasOne(PerfilVoluntario, { foreignKey: 'usuario_id' });
PerfilVoluntario.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = PerfilVoluntario;
