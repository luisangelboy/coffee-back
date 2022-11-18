const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CodigosProductos = Schema({
    Name: {
        type: String,
        require: true,
        trim: true,
    },
    Value: {
        type: String,
        require: true,
        trim: true,
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
})

module.exports =  CodigosProductos;