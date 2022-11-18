const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const movimientosSchema = new Schema(
    {
    concepto: String,
    empresa: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Empresa",
      trim: true,
    },
    sucursal: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
      trim: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      trim: true,
    },
    year_registro: String,
    numero_semana_year: String,
    numero_mes_year: String,
    fecha_registro: String,
  },
  {
    timestamps: true,
  }
);

module.exports = movimientosSchema;