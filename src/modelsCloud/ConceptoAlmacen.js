const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const conceptoAlmacenSchema = new Schema({
    nombre_concepto: String,
    origen: String,
    destino: String,
    editable: Boolean,
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

module.exports =  conceptoAlmacenSchema;