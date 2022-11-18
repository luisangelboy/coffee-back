const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const CajasSchema = new Schema({
    numero_caja: Number,
    activa: Boolean,
    usuario_creador: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Usuarios",
        trim: true,
    }, 
    numero_usuario_creador:{
		type: Number,
		require: true
	},
    nombre_usuario_creador:{
		type: String,
		require: true
	},
    cantidad_efectivo_actual: Float,
    dinero_en_banco:Float,
    usuario_en_caja: {
        type: Schema.Types.ObjectId,
        ref: "Usuarios",
        trim: true,
    },
    principal: Boolean,
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

module.exports = model("Cajas",CajasSchema);