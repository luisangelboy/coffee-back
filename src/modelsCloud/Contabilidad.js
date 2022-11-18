const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const contabilidadSchema = new Schema({
    nombre_servicio: String,
    empresa: {
        type: Schema.Types.ObjectId,
        ref: "Empresa"
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: "Sucursal"
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuarios"
    }
},{ 
    timestamps:  true
});

module.exports =  contabilidadSchema;