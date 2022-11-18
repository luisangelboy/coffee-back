const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const MarcasSchema = new Schema({
    nombre_marca: String,
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
    }
},{
    timestamps: true
});


module.exports = MarcasSchema;
