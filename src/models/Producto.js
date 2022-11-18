const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const Productos = new Schema(
	{
		datos_generales: {
			codigo_barras: String,
			clave_alterna: {
				type: String,
				trim: true
			},
			tipo_producto: String,
			nombre_comercial: String,
			nombre_generico: String,
			descripcion: String,
			id_categoria: {
				type: Schema.ObjectId,
				ref: 'Categorias'
			},
			categoria: String,
			subcategoria: String,
			id_subcategoria: String,
			id_departamento: {
				type: Schema.ObjectId,
				ref: 'Departamentos'
			},
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
			inventario: {
				inventario_minimo: Number,
				inventario_maximo: Number,
				unidad_de_inventario: String,
				codigo_unidad: String
			},
			iva: Float,
			iva_activo: Boolean,
			monedero: Boolean,
			monedero_electronico: Number,
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
		imagenes: [
			{
				url_imagen: String,
				location_imagen: String,
				key_imagen: String,
				extencion_imagen: String
			}
		],
		centro_de_costos: {
			cuenta: String,
			id_cuenta: {
				type: Schema.Types.ObjectId,
				ref: "Costos"
			},
			id_subcuenta: String,
			subcuenta: String
		},
		precio_plazos: {
			precio_piezas: [
				{
					plazo: String,
					unidad: String,
					codigo_unidad: String,
					precio: Float	
					//Aqui se tiene que agregar el objeto de precios/impuestos(iva-ieps)
				}
			],
			precio_cajas: [
				{
					plazo: String,
					unidad: String,
					codigo_unidad: String,
					precio: Float	
				}
			],
			precio_tarimas: [
				{
					plazo: String,
					unidad: String,
					codigo_unidad: String,
					precio: Float	
				}
			],
			precio_costales: [
				{
					plazo: String,
					unidad: String,
					codigo_unidad: String,
					precio: Float	
				}
			]
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
		usuario: {
            type: Schema.Types.ObjectId,
            ref: "Usuarios",
            trim: true,
        },
		eliminado: Boolean,
		medidas_registradas: Boolean,
		year_registro: String,
		numero_semana_year: String,
		fecha_registro: String
	},
	{
		timestamps: true
	}
);

module.exports = model('Productos', Productos);
