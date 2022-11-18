const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Almacen = Schema({
        nombre_almacen: {
            type: String,
            require: true
        },
        id_usuario_encargado: {
            type: Schema.Types.ObjectId,
            ref: "Usuarios"
        },
        id_sucursal: {
            type: Schema.Types.ObjectId,
            ref: "Sucursal",
            require: true
        },
        empresa: {
            type: Schema.Types.ObjectId,
            ref: "Empresa",
            require: true
        },
        direccion: {
            calle: String,
            no_ext: String, 
            no_int: String,
            codigo_postal: String,
            colonia: String,
            municipio: String,
            localidad: String,
            estado: String,
            pais: String
        },
        default_almacen: Boolean
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Almacen", Almacen);