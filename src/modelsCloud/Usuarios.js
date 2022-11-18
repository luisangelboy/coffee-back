const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuarios = Schema({
	numero_usuario: {
		type: Number,
		require: true,
		trim: true,
		unique: true
	},
	nombre: {
		type: String,
		require: true
	},
	username_login: {
		type: String,
		trim: true
	},
    password: {
        type: String,
		require: true,
		trim: true
    },
	telefono: {
		type: String,
		require: true,
		trim: true
	},
	email: {
		type: String,
		require: true,
		trim: true,
		unique: true
	},
	turno_en_caja_activo: Boolean,
	direccion: {
		calle: {
			type: String
		},
		no_ext: {
			type: String
		},
		no_int: {
			type: String
		},
		codigo_postal: {
			type: String
		},
		colonia: {
			type: String
		},
		municipio: {
			type: String
		},
        localidad: {
            type: String
        },
		estado: {
			type: String
		},
		pais: {
			type: String
		}
	},
	imagen: {
		type: String
	},
	estado_usuario: {
		type: Boolean,
		require: true
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
	accesos:{
		compras:{
			abrir_compra:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			compras_realizadas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			compras_espera:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		tesoreria:{
			cuentas_empresa:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			egresos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			abonos_proveedores:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			abonos_clientes:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			caja_principal: {
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		reportes:{
			reporte_historial_cajas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			reporte_turnos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			reporte_compras:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			reporte_ventas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			rerporte_almacen:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			reporte_corte_caja:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			reporte_tesoreria:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		ventas:{
			cancelar_venta:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			precios_productos: {
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			pre_corte:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			cotizaciones:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			administrador:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			eliminar_ventas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			producto_rapido:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		almacenes:{
			almacen:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			traspasos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			inventario_almacen:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		mi_empresa:{
			datos_empresa: {
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			informacion_fiscal: {
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		catalogos:{
			clientes:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			productos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			tallas_numeros:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			contabilidad:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			provedores:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			cajas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			usuarios:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			departamentos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			categorias:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			colores:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			marcas:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			centro_costos:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			conceptos_almacen:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		},
		facturacion:{
			generar_cdfi:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			cdfi_realizados:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			},
			registro_series_cdfi:{
				ver: Boolean,
				agregar: Boolean,
				editar: Boolean,
				eliminar: Boolean
			}
		}
	},
	eliminado: Boolean,
},
{
timestamps: true
});


module.exports =  Usuarios;
