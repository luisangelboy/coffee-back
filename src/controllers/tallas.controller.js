const TallasCtrl = {};
const Tallas = require("../models/Tallas");
const UnidadesDeVenta = require("../models/Unidad_venta_producto");
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");
/* const mongoose = require('mongoose') */

TallasCtrl.crearTalla = async (input) => {
  const { talla, tipo, empresa, sucursal } = input;
  try {
    const Models =  await CloudFunctions.getModels(['Tallas']);
    const talla_existente = await Models.Tallas.findOne({
      empresa,
      talla: talla.toUpperCase(),
    });
    if (talla_existente) {
      throw new Error(
        tipo === "ROPA" ? "Esta talla ya existe" : "Este numero ya existe"
      );
    } else {
      const nueva_talla = new Models.Tallas({
        talla: talla.toUpperCase(),
        tipo,
        empresa,
        sucursal,
      });
      await nueva_talla.save();
      const message =
        tipo === "ROPA"
          ? "Se creó la talla correctamente."
          : "Se creó el número correctamente.";

      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Tallas',   moment(nueva_talla.updatedAt).locale("es-mx").format());  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return {
        message: message,
      };
    } 
  } catch (error) {
    console.log(error);
    return error;
  }
};

TallasCtrl.obtenerTallas = async (empresa, tipo) => {
  try {
    const tallas = await Tallas.find({ empresa, tipo }).populate(
      "empresa sucursal"
    );
   
    return tallas;
  } catch (error) {
    console.log(error);
    return error;
  }
};

TallasCtrl.actualizarTalla = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Tallas']);  
    const { talla, tipo } = input;
    await UnidadesDeVenta.updateMany(
      { "medida._id": id },
      { "medida.talla": talla.toUpperCase() }
    );

    await Models.Tallas.findByIdAndUpdate({ _id: id }, { talla, tipo });
    
    const tallaModificada =  await Models.Tallas.findById(id);
    const message =
      tipo == "ROPA"
        ? "Talla actualizada correctamente."
        : "Número actualizado correctamente.";

    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Tallas',   moment(tallaModificada.updatedAt).locale("es-mx").format());  
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: message,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

TallasCtrl.eliminarTalla = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Tallas','Unidadesventa']);  
    const unidadesConTalla = await UnidadesDeVenta.find().where({
      "medida._id": id,
      concepto: "medidas",
      eliminado: false,
    });
    const tipo = input.tipo;
    if (unidadesConTalla.length > 0) {
      throw new Error(
        tipo == "ROPA"
          ? "¡Esta talla no puede ser eliminada! Hay productos con esta talla asignada."
          : "¡Este número no puede ser eliminado! Hay productos con este número asignado."
      );
    } else {
      await Tallas.findByIdAndDelete({ _id: id });
      await Models.Tallas.findByIdAndDelete({ _id: id });
      //const tallaModificada =  await Models.Tallas.findById(id);
      let message =
        tipo == "ROPA"
          ? "¡Listo, talla eliminada!."
          : "¡Listo, número eliminado!."
      ;
      

      const fechaModificacion = moment().locale("es-mx").format();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Tallas',   fechaModificacion);  
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   fechaModificacion);  
      
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return {
        message: message,
        success: true,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: error,
    };
  }
};

module.exports = TallasCtrl;
