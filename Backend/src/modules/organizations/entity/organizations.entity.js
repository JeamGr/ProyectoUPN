// src/modules/organizations/entity/organizations.model.js
// RF-010: perfil institucional de la organización. Queda en
// estado_validacion='pendiente_validacion' hasta que un Administrador la
// apruebe (RN-01: no puede publicar oportunidades hasta estar 'aprobado').
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');
const Usuario = require('../../users/entity/users.entity');

class Organizacion extends Model {}

Organizacion.init(
  {
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
    nombre_ong: { type: DataTypes.STRING(200), allowNull: false },
    descripcion_actividad: { type: DataTypes.TEXT, allowNull: true },
    linea_intervencion_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    pais: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Perú' },
    direccion: { type: DataTypes.STRING(255), allowNull: false },
    persona_contacto: { type: DataTypes.STRING(200), allowNull: false },
    tipo_documento_contacto: { type: DataTypes.ENUM('DNI', 'CE', 'PASAPORTE'), allowNull: false },
    numero_documento_contacto: { type: DataTypes.STRING(20), allowNull: false },
    celular_contacto: { type: DataTypes.STRING(20), allowNull: false },
    link_web: { type: DataTypes.STRING(255), allowNull: true },
    link_redes_sociales: { type: DataTypes.STRING(255), allowNull: false },
    constituida_legalmente: { type: DataTypes.ENUM('SI', 'NO', 'EN_PROCESO'), allowNull: false },
    ruc: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    razon_social: { type: DataTypes.STRING(200), allowNull: false },
    numero_beneficiarios_anual: { type: DataTypes.STRING(50), allowNull: true },
    tiene_certificado_donacion: { type: DataTypes.ENUM('SI', 'NO', 'EN_PROCESO'), allowNull: false },
    tiene_programa_voluntariado_corporativo: { type: DataTypes.ENUM('SI', 'NO', 'EN_PROCESO'), allowNull: true },
    estado_validacion: {
      type: DataTypes.ENUM('pendiente_validacion', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente_validacion',
    },
  },
  {
    sequelize,
    modelName: 'Organizacion',
    tableName: 'organizaciones',
    timestamps: false,
  }
);

Usuario.hasOne(Organizacion, { foreignKey: 'usuario_id' });
Organizacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Organizacion;
