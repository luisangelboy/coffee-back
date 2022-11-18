const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var Float = require("mongoose-float").loadType(mongoose, 4);

const ComprasSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      require: true,
      trim: true,
    },
    almacen: {
      id_almacen: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Almacen",
        trim: true,
      },
      nombre_almacen: String,
      default_almacen: Boolean,
    },
    proveedor: {
      id_proveedor: {
        type: Schema.ObjectId,
        ref: "Clientes",
        require: true,
        trim: true,
      }, 
      clave_cliente: Number,
      numero_cliente: Number,
      nombre_cliente: String,
    },
    folio: String,
    status: String,
    en_espera: Boolean,
    compra_credito: Boolean,
    fecha_vencimiento_credito: String,
    credito_pagado: Boolean,
    saldo_credito_pendiente: Float,
    forma_pago: String,
    descuento_aplicado: Boolean,
    descuento: {
      porcentaje: Float,
      cantidad_descontada: Float,
      precio_con_descuento: Float
    },
    impuestos: {
      type: Float,
      require: true,
    },
    subtotal: {
      type: Float,
      require: true,
    },
    total: {
      type: Float,
      require: true,
    },
    status: String,
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
    year_registro: String,
    numero_semana_year: String,
    numero_mes_year: String,
    fecha_registro: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Compras", ComprasSchema);
