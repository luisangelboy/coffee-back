const ColoresCtrl = {};
const Colores = require("../models/Colores");
const UnidadesDeVenta = require("../models/Unidad_venta_producto");
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");
/* const mongoose = require('mongoose') */

ColoresCtrl.crearColor = async (input) => {
  try {
    const Models =  await CloudFunctions.getModels(['Colores']);
    const { nombre, hex, empresa, sucursal } = input;
    const color_existente = await Models.Colores.findOne({
      empresa,
      nombre: nombre.toUpperCase(),
    });
    if (color_existente) {
      throw new Error("Este color ya existe");
    } else {
      const new_color = new Models.Colores({
        nombre: nombre.toUpperCase(),
        hex,
        empresa,
        sucursal,
      });
      await new_color.save();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Colores',   moment(new_color.updatedAt).locale("es-mx").format());  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return new_color;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

ColoresCtrl.obtenerColores = async (empresa) => {
  try {
    const color = await Colores.find({ empresa }).populate("empresa sucursal").sort({nombre:1});
    return color;
  } catch (error) {
    console.log(error);
    return error;
  }
};

ColoresCtrl.actualizarColor = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Colores', 'Unidadesventa']);
    const { nombre, hex } = input;
    await Models.Unidadesventa.updateMany(
      { "color._id": id },
      { "color.nombre": nombre.toUpperCase(), "color.hex": hex }
    );
     await Models.Colores.findByIdAndUpdate(
      { _id: id },
      { nombre: nombre.toUpperCase(), hex }
    );
    const colorUpdated = Models.Colores.findById(id);
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Colores',   moment(colorUpdated.updatedAt).locale("es-mx").format());  
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: "Color actualizado correctamente.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

ColoresCtrl.eliminarColor = async (id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Colores', 'Unidadesventa']);
    const unidadesConColor = await UnidadesDeVenta.find().where({
      "color._id": id,
      eliminado: false,
    });
    if (unidadesConColor.length > 0) {
      throw new Error(
        "¡Este color no puede ser eliminado! Hay productos con este color asignado."
      );
    } else {
      await Models.Colores.findByIdAndDelete({ _id: id });
      await Colores.findByIdAndDelete({ _id: id });
      const fechaModificacion = moment().locale("es-mx").format();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Colores',   fechaModificacion);  
      

      return {
        message: "¡Listo, color eliminado!.",
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

module.exports = ColoresCtrl;
