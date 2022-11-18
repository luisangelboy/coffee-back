const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const ProductosAlmacenSchema = new Schema({
    producto: {
        _id: {
            type: Schema.Types.ObjectId,
            require: true,
            ref: "Productos",
            trim: true,
        },
        datos_generales: {
            codigo_barras: String,
            clave_alterna: String,
            tipo_producto: String,
            nombre_comercial: String,
			nombre_generico: String,
            id_categoria: {
				type: Schema.ObjectId,
				ref: 'Categorias'
			},
			categoria: String,
			subcategoria: String,
			id_subcategoria: String,
			departamento: String,
			id_marca: {
				type: Schema.ObjectId,
				ref: 'Marcas'
			},
			marca: String,
			clave_producto_sat: {
				Name: String,
				Value: String,
			},
			receta_farmacia: Boolean,
        },
        precios: {
			ieps: Float,
			ieps_activo: Boolean,
			iva: Float,
			iva_activo: Boolean,
			precio_de_compra: {
				precio_con_impuesto: Float,
				precio_sin_impuesto: Float,
				iva: Float,
				ieps: Float
			},
			precios_producto: [
				{
					numero_precio: Number,
					precio_neto: Float,
					precio_venta: Float,
					unidad_mayoreo: Number,
					iva_precio: Float,
                	ieps_precio: Float,
					utilidad: Float
				}
			],
			unidad_de_compra: {
				cantidad: Number,
				precio_unitario_con_impuesto: Float,
        		precio_unitario_sin_impuesto: Float,
				unidad: String,
				codigo_unidad: String,
			},
			granel: Boolean,
			litros: Boolean
		},
    },
    cantidad_existente: Float,
	unidad_inventario: String,
	codigo_unidad: String,
	cantidad_existente_minima: Float,
	unidad_minima: String,
	cantidad_existente_maxima: Float,
	unidad_maxima: String,
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
    id_almacen: {
        type: Schema.Types.ObjectId,
        ref: "Almacen",
        trim: true, 
    },
	almacen:{
		_id:{
			type: Schema.Types.ObjectId,
			ref: "Almacen",
			trim: true
		},
		nombre_almacen: String,
		default_almacen: Boolean
			
	},
    id_compra: {
        type: Schema.Types.ObjectId,
        ref: "Compras",
        trim: true, 
    },
	eliminado: Boolean,
	year_registro: String,
	numero_semana_year: String,
	fecha_registro: String
},{
    timestamps: true
});

module.exports = ProductosAlmacenSchema;