const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var Float = require("mongoose-float").loadType(mongoose, 4);

const TraspasosSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      require: true, 
      trim: true,
    },
    concepto_traspaso: {
      id_concepto: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Concepto",
        trim: true,
      },
      nombre_concepto: String,
      origen:String,
      destino:String
    },
    almacen_origen: {
      _id:{
        type: Schema.Types.ObjectId,
        ref: "Almacen",
        trim: true
      },
      nombre_almacen: String,
      default_almacen: Boolean
    
    },
     almacen_destino: {
      _id:{
        type: Schema.Types.ObjectId,
        ref: "Almacen",
        trim: true
      },
      nombre_almacen: String,
      default_almacen: Boolean
        
     
    },
    datos_transporte:{
       transporte: String,
       placas: String,
       nombre_encargado: String  
    },
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

module.exports = TraspasosSchema;