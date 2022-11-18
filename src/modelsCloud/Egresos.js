const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const Schema = mongoose.Schema;

const Egresos = Schema({
    folio_egreso: String,
    folio_factura: String,
    empresa_distribuidora: String,
    provedor: String,
    productos: [{
        cantidad_productos: Float,
        precio_unitario: Float,
        producto: String,
        total: Float
    }],
    categoria: String,
    subCategoria: String,
    metodo_pago: String,
    fecha_compra: String,
    fecha_registro: String,
    fecha_vencimiento: String,
    observaciones: String,
    compra_credito: Boolean,
    credito_pagado: Boolean,
    saldo_credito_pendiente: Float,
    saldo_total: Float,
    numero_usuario_creador: String,
    nombre_usuario_creador:{
		type: String,
		require: true
	},
    id_user: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Usuarios",
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
	}
});

module.exports =  Egresos;



