const CotizacionesCtrl = {};
const Productos = require('../models/Producto');
const Cotizacion = require('../models/Cotizacion');
const ProductoAlmacenModel = require("../models/Productos_almacen");
const AlmacenesModel = require("../models/Almacen");
const UnidadesProductoModel = require("../models/Unidad_venta_producto");
const moment = require("moment");

CotizacionesCtrl.crearCotizacion = async (input, empresa, sucursal, usuario, caja) => {
	try {
 
		let values =  input;
		//console.log(input.productos[0]);
		values = {
			...input, 
			id_caja:caja,
			empresa: empresa,
			sucursal: sucursal,
			usuario: usuario,
			year_registro: moment().year(),
			numero_semana_year: moment().week(),
			numero_mes_year: moment().month(),
			fecha_registro: moment().locale("es-mx").format("YYYY-MM-DD")
		};
		const new_cotizacion = new Cotizacion(values);
		//console.log(new_cotizacion);
		new_cotizacion.save();
		return {message: "La cotización se ha registrado correctamente."};
	} catch (error) {
		console.log(error);
		return error;
	}
};

CotizacionesCtrl.obtenerCotizaciones = async (empresa, sucursal) => {
	try {
		
		let cotizaciones = await Cotizacion.find({ sucursal, empresa }).populate('usuario id_caja').sort({createdAt: -1});
		const ModelUnidades = await UnidadesProductoModel.find({ sucursal, empresa });
		
		const almacenPrincipal = await AlmacenesModel.findOne().where({
			id_sucursal: sucursal,
			default_almacen: true,
		  });
		const ProductosAlmacen = await ProductoAlmacenModel.find({ sucursal, empresa, id_almacen: almacenPrincipal._id });
		let responseCotizacion = [];
		
		//VERIFICAR SI LOS PRODUCTOS TIENEN EXISTENCIA
		cotizaciones.forEach(cotizacion => {
			//console.log("INTO COTIZACIONES",cotizacion);
			cotizacion.productos.forEach(producto => {
				//console.log("INTO PRODUCTOS",producto);
				let codigo_barras = producto.codigo_barras;
			
				if(producto.concepto === "medidas"){
					ModelUnidades.forEach(medida => {
						
					
						if(medida.codigo_barras === codigo_barras){
							producto.cantidad = medida.cantidad;
						}
					});
				}else{
					ProductosAlmacen.forEach(productoAlmacen => {
						//console.log("INTO ProductosAlmacen",productoAlmacen);
							
						if(productoAlmacen.producto.datos_generales.codigo_barras === codigo_barras){
							
							producto.inventario_general[0].cantidad_existente = productoAlmacen.cantidad_existente;
						}
					});
				}
				
			});
		});
		
       /*  cotizaciones.forEach(element => {
			
			element.productos.forEach(prod => {
				console.log(prod)
			});
		}); */
		return cotizaciones;
	} catch (error) {
		console.log(error);
		return error;
	}
};

CotizacionesCtrl.verificarCotizacion = async (input) => {
	try {
		return 0;
	} catch (error) {
		console.log(error);
		return error;
	}
};

CotizacionesCtrl.editarCotizacion = async (input) => {
	try {
		return 0;
	} catch (error) {
		console.log(error);
		return error;
	}
};

CotizacionesCtrl.eliminarCotizacion = async (input) => {
	try {
		return 0;
	} catch (error) {
		console.log(error);
		return error;
	}
};


module.exports = CotizacionesCtrl;