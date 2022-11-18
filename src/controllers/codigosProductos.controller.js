const CodigosProductoCtrl = {};
const CodigosProducto = require('../models/CodigosProductosSat');

/* const mongoose = require('mongoose') */

CodigosProductoCtrl.crearCodigoProducto = async (input) => {
	try {
		const nuevo_codigo_Producto = input;
		const codigos_bd = await CodigosProducto.find().where({ empresa: nuevo_codigo_Producto.empresa, Value: nuevo_codigo_Producto.Value }); 
		if(codigos_bd.length){
			return ({
				message: '¡Listo!'
			});
		}
		const nuevo_codigo = CodigosProducto(nuevo_codigo_Producto);
		await nuevo_codigo.save();
		return ({
			message: '¡Listo, Código guardado!'
		});
	} catch (error) {
		console.log(error);
		return error;
	}
}

CodigosProductoCtrl.obtenerCodigosProducto = async (empresa, sucursal) => {
	try {
		const codigos_bd = await CodigosProducto.find().where({ empresa }); 
		return codigos_bd;
	} catch (error) {
		console.log(error);
		return error;
	}
}

CodigosProductoCtrl.eliminarCodigoProducto = async (id) => {
	try {
		const codigos_bd = await CodigosProducto.find().where({ _id: id }); 
		if(!codigos_bd.length){
			throw new Error('Este código ya no existe');
		}else{
			await CodigosProducto.findByIdAndDelete({_id: id});
			return ({
				message: '¡Código eliminado!.'
			});
		}
	} catch (error) {
		console.log(error);
		return error;
	}
}

module.exports = CodigosProductoCtrl;
