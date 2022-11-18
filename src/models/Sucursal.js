const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const sucursalSchema = new Schema({
    nombre_sucursal: String,
    descripcion: {
        type: String
    },
    usuario_sucursal: {
        type: String,
        trim: true
    },
    password_sucursal: String,
    direccion: {
        calle: String,
        no_ext: String,
        no_int: String,
        codigo_postal: Number,
        colonia: String,
        municipio: String,
        localidad: String,
        estado: String,
        pais: String
    },
    cuenta_sucursal: {
        efectivo: Float,
    },
    id_empresa: {
        type: Schema.Types.ObjectId,
        ref: "Empresa",
        require: true
    },
    codigo_licencia: String,
    fecha_inicio_licencia: String,
    fecha_vencimiento_licencia: String,
    licencia_activa: Boolean,
    fecha_updated_bd_local: String
},
{
timestamps: true
})

module.exports = model("Sucursal", sucursalSchema);