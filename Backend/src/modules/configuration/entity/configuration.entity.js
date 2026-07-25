// src/modules/configuration/entity/configuration.model.js
// RF-058: parámetros globales configurables sin desplegar código.
// auth.repository la usa para leer max_intentos_login_fallidos,
// segundos_reenvio_codigo y expiracion_sesion_horas en vez de hardcodearlos.
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../../config/database/database.config');

class ConfiguracionSistema extends Model {}

ConfiguracionSistema.init(
  {
    clave: { type: DataTypes.STRING(100), primaryKey: true },
    valor: { type: DataTypes.STRING(500), allowNull: false },
    descripcion: { type: DataTypes.STRING(300), allowNull: true },
    actualizado_por: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    fecha_actualizacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'ConfiguracionSistema',
    tableName: 'configuracion_sistema',
    timestamps: false,
  }
);

module.exports = ConfiguracionSistema;
