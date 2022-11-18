const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const unidad_de_venta = new Schema(
    {
        unidad: String,
        codigo_unidad: String,
        default: Boolean,
        precio: Float,
        precio_unidad: {
            numero_precio: Number,
            precio_neto: Float,
            precio_venta: Float,
            unidad_mayoreo: Number,
            iva_precio: Float,
            ieps_precio: Float,
            utilidad: Float,
            precio_general: Float,
            cantidad_unidad: Number,
            unidad_maxima:Boolean
        },
        cantidad: Number,
        unidad_principal: Boolean,
        codigo_barras: String,
        color: {
            hex: String,
            nombre: String,
            _id: { 
                type: Schema.ObjectId, 
                ref: 'Colores'
            },
        },
        existencia: Boolean,
		medida: {
            talla: String,
            tipo: String,
            _id: {
                type: Schema.ObjectId,
                ref: 'Tallas'
            }
        },
        nombre_comercial: String,
        default: Boolean,
        concepto: String,
        eliminado: Boolean,
        descuento:{
            cantidad_unidad: Float,
            numero_precio: Float,
            unidad_maxima: Boolean,
            precio_general: Float,
            precio_neto: Float,
            precio_venta: Float,
            iva_precio: Float,
            ieps_precio: Float,
            utilidad: Float,
            porciento: Float,
            dinero_descontado: Float,
        },
        descuento_activo: Boolean,
        unidad_activa: Boolean,
        id_producto: {
            type: Schema.ObjectId,
            ref: 'Productos'
        },
        almacen: {
            type: Schema.Types.ObjectId,
            require: true,
            ref: "Almacen",
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
            require: true,
            ref: "Sucursal",
            trim: true,
        },
        year_registro: String,
		numero_semana_mes: String,
		fecha_registro: String
    },
    {
        timestamps: true
    }
)

module.exports = unidad_de_venta;