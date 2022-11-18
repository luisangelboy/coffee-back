const MarcaCtrl = {};
const MarcaModel = require("../models/Marcas");
const ProductoModel = require("../models/Producto");
const ProductosAlmancen = require("../models/Productos_almacen");
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");

MarcaCtrl.crearMarcas = async (input, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Marcas']);
    const { nombre_marca } = input;
    const marca_existente = await MarcaModel.find({
      empresa,
      nombre_marca: nombre_marca.toUpperCase(),
    });

    if (marca_existente.length ) {
      throw new Error("Esta marca ya existe");
    } else {
      const newMarca = new Models.Marcas({
        nombre_marca: nombre_marca.toUpperCase(),
        empresa,
        sucursal,
      });
      const marcaCreada = await newMarca.save();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Marcas',   moment(newMarca.updatedAt).locale("es-mx").format());  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return {
        message: marcaCreada._id,
      };
    }
  } catch (error) {
    return error;
  }
};

MarcaCtrl.actualzarMarcas = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Marcas','Productos','ProductoAlmacen']);
    const marca_existente = await Models.Marcas.find({
      _id: id,
      nombre_marca: input.nombre_marca.toUpperCase(),
    });
    if (marca_existente.length ) {
      throw new Error("Esta marca ya existe");
    } else {
      await Models.Marcas.findByIdAndUpdate({ _id: id }, {nombre_marca:  input.nombre_marca.toUpperCase()});
      await Models.Productos.updateMany(
        { "datos_generales.id_marca": id },
        { "datos_generales.marca": input.nombre_marca.toUpperCase() }
      );
      await Models.ProductoAlmacen.updateMany(
        { "producto.datos_generales.id_marca": id },
        { "producto.datos_generales.marca": input.nombre_marca.toUpperCase() }
      );
    }
    const marcaUpdated = Models.Marcas.findById(id);
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Marcas',   moment(marcaUpdated.updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(marcaUpdated.updatedAt).locale("es-mx").format());  
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(marcaUpdated.updatedAt).locale("es-mx").format());   
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: "Marca actualizada",
    };
  } catch (error) {
     return error;
  }
};

MarcaCtrl.eliminarMarca = async (id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Marcas','Productos']);
    const filterMarcas = {
      "datos_generales.id_marca": id,
      sucursal: sucursal,
      empresa: empresa,
      eliminado: false,
    };
    const marcaElegida = await Models.Productos.find().where(filterMarcas);
    if (marcaElegida.length > 0) {
      return {
        message: `No es posible eliminar esta marca, productos existentes: ${marcaElegida.length}`,
      };
    } else {
      await MarcaModel.findByIdAndDelete({ _id: id });
      await Models.Marcas.findByIdAndDelete({ _id: id });
      const fechaModificacion = moment().locale("es-mx").format();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Marcas',  fechaModificacion); 
      
      return { message: false };
    }
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error",
    };
  }
};

MarcaCtrl.obtenerMarcas = async (empresa, sucursal) => {
  try {
    const marcas = await MarcaModel.find({ empresa }).sort({nombre_marca:1});
    return marcas;
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error",
    };
  }
};

module.exports = MarcaCtrl;
