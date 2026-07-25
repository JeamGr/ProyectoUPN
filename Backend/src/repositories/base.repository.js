// src/repositories/base.repository.js
// Cada repositorio de módulo puede extender esto para no repetir CRUD básico.
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async crear(datos, opciones = {}) {
    return this.model.create(datos, opciones);
  }

  async buscarPorId(id, opciones = {}) {
    return this.model.findByPk(id, opciones);
  }

  async buscarUno(where, opciones = {}) {
    return this.model.findOne({ where, ...opciones });
  }

  async actualizar(instancia, datos) {
    return instancia.update(datos);
  }
}

module.exports = BaseRepository;
