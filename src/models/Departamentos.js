const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Departamentos = Schema({
    nombre_departamentos: {
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
},
{
timestamps: true
})

module.exports = mongoose.model("Departamentos", Departamentos);