const DescuentosCtrl = {};
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");
const moment = require("moment");

// Para poder crear un descuento nuevo en un porducto
DescuentosCtrl.crearDescuentoUnidad = async (input, empresa, sucursal) => {
    try {
        const Models =  await CloudFunctions.getModels(['Unidadesventa']);
        // Los descuentos se agregan en los porductos que estan dentro del modelo de datos de 
        // unidades de venta
        for (let i = 0; i < input.descuentos.length; i++) {
            const datos = {
                descuento_activo: input.descuentos[i].descuento_activo,
                descuento: input.descuentos[i].descuento
            }
            await Models.Unidadesventa.findByIdAndUpdate({_id: input.descuentos[i]._id}, datos );
        }
        const fechaModificacion = moment().locale("es-mx").format();
        await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   fechaModificacion); 
        await UsuariosController.actualizarBDLocal(empresa, sucursal);
        return { message: "Listo."};
    } catch (error) {
        console.log(error);
		return { message: "Algo salio mal."};
    }
}

DescuentosCtrl.actualizarDescuentoUnidad = async () => {
      try {
        
    } catch (error) {
        console.log(error);
		return error;
    }  
}

// Poder cambiar el estado del descuento del producto seleccionado
DescuentosCtrl.desactivarDescuentoUnidad = async (input, id, empresa, sucursal) => {
    try {
        // Una simple busqueda dentro del modelo de datos de las unidades venta para poder editar el estado
        const Models =  await CloudFunctions.getModels(['Unidadesventa']);
        await  Models.Unidadesventa.findByIdAndUpdate({_id: id}, input);
        const fechaModificacion = moment().locale("es-mx").format();
        await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   fechaModificacion); 
        await UsuariosController.actualizarBDLocal(empresa, sucursal);
        return { message: "Estado de descuento actualizado."};
    } catch (error) {
        console.log(error);
		return error;
    }
}

// Eliminar el descuento del producto
DescuentosCtrl.eliminarDescuentoUnidad = async (id, empresa, sucursal) => {
    try {
        // Lo unico que vamos a relizr sera sustuir todos los campos dentro del descuento
        // para inicializar todos en cero y en estados false, con respoecto del id del producto seleccionado a cambiar
        const Models =  await CloudFunctions.getModels(['Unidadesventa']);
        const eliminar = {
            descuento_activo: false,
            descuento:{
                cantidad_unidad: 0,
                numero_precio: 0,
                unidad_maxima: false,
                precio_general: 0,
                precio_neto: 0,
                precio_venta: 0,
                iva_precio: 0,
                ieps_precio: 0,
                utilidad: 0,
                porciento: 0,
                dinero_descontado: 0,
            }
        }
        await Models.Unidadesventa.findByIdAndUpdate({_id: id}, eliminar);
        const fechaModificacion = moment().locale("es-mx").format();
        await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   fechaModificacion); 
        await UsuariosController.actualizarBDLocal(empresa, sucursal);
        return { message: "Descuento eliminado"};
    } catch (error) {
        console.log(error);
		return error;
    }
}

module.exports = DescuentosCtrl;