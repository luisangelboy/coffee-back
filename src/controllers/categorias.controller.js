const CategoriaCtrl = {};
const Categorias = require("../models/Categorias");
const Productos = require("../models/Producto");
const ProductosAlmacens = require("../models/Productos_almacen");
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");
// const mongoose = require('mongoose');

CategoriaCtrl.crearCategoria = async (input) => {
  try {
    const Models =  await CloudFunctions.getModels(['Categorias']);
    const { categoria, empresa, sucursal } = input;
    const categoria_existente = await Models.Categorias.findOne({
      categoria: categoria.toUpperCase(),
    });

    if (categoria_existente) {
      throw new Error("Esta categoria ya existe");
    } else {
      const nueva_categoria = new Models.Categorias({
        categoria: categoria.toUpperCase(),
        empresa,
        sucursal,
      });
      const result = await nueva_categoria.save();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',   moment(result.updatedAt).locale("es-mx").format());  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return result._id;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

CategoriaCtrl.crearSubcategoria = async (input, idCategoria, empresa, sucursal) => {
  try {
    //Verificar que no exista una subcategoria con el mismo nombre
    const Models =  await CloudFunctions.getModels(['Categorias']);
    const { subcategoria } = input;
    const categoriaObj = await Models.Categorias.findById(idCategoria);
    const sub_existente = categoriaObj.subcategorias.filter(
      (res) => res.subcategoria === subcategoria.toUpperCase()
    );
    
    if (sub_existente.length > 0) {
      throw new Error("Esta subcategoria ya existe");
    } else {
      await Models.Categorias.updateOne(
        { _id: idCategoria },
        {
          $addToSet: {
            subcategorias: {
              subcategoria: subcategoria.toUpperCase(),
            },
          },
        }
      );
      const categoriaUpdated = Models.Categorias.findById(idCategoria);
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return {
        message: "false",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

CategoriaCtrl.actualizarCategoria = async (input, idCategoria, empresa, sucursal) => {
  try {
    const { categoria } = input;
    const Models =  await CloudFunctions.getModels(['Categorias', 'ProductoAlmacen','Productos']);
    await Models.Categorias.findByIdAndUpdate(
      { _id: idCategoria },
      { categoria: categoria.toUpperCase() }
    );
    await Models.ProductoAlmacen.updateMany(
      { "producto.datos_generales.id_categoria": idCategoria },
      { "producto.datos_generales.categoria": categoria.toUpperCase() }
    );
    await Models.Productos.updateMany(
      { "datos_generales.id_categoria": idCategoria },
      { "datos_generales.categoria": categoria.toUpperCase() }
    );
    const categoriaUpdated = Models.Categorias.findById(idCategoria);
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());  
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());    
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: "Categoria actualizado",
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error al actualizar la categoria",
    };
  }
};

//La subcategorìa está amarrada a la categoría
CategoriaCtrl.actualizarSubcategoria = async (
  input,
  idCategoria,
  idSubcategoria,
  empresa,
  sucursal
) => {
  try {
    //Veriricar que no exista una subcategoria con el mismo nombre
    const Models =  await CloudFunctions.getModels(['Categorias', 'ProductoAlmacen','Productos']);
    const { subcategoria } = input;
    const categoriaObj = await Models.Categorias.findById(idCategoria);
    /* const sub_existente = categoriaObj.subcategorias.filter(
      (res) => res.subcategoria === subcategoria.toUpperCase()
    ); */
    await Models.Categorias.updateOne(
      {
        "subcategorias._id": idSubcategoria,
      },
      {
        $set: {
          "subcategorias.$": {
            subcategoria: subcategoria.toUpperCase(),
          },
        },
      }
    );
    await Models.ProductoAlmacen.updateMany(
      { "producto.datos_generales.id_categoria": idCategoria },
      { "producto.datos_generales.subcategoria": subcategoria.toUpperCase() }
    );
    await Models.Productos.updateMany(
      { "datos_generales.id_categoria": idCategoria },
      { "datos_generales.subcategoria": subcategoria.toUpperCase() }
    );
    const categoriaUpdated = Models.Categorias.findById(idCategoria);
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());  
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(categoriaUpdated.updatedAt).locale("es-mx").format());    
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: "false",
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error al actualizar la subcategoria",
    };
  }
};

CategoriaCtrl.eliminarCategoria = async (id,empresa,sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Categorias', 'Productos']);
    const inputFilter = {
      "datos_generales.id_categoria": id,
    };
    const filtroCategorias = await Models.Productos.find().where(inputFilter);
    if (filtroCategorias.length > 0) {
      return {
        message: `No se puede eliminar esta categoria, productos existentes:  ${filtroCategorias.length}.`,
      };
    } else {
      await Categorias.findByIdAndDelete({ _id: id });
      await Models.Categorias.findByIdAndDelete({ _id: id });
      const fechaModificacion = moment().locale("es-mx").format();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',  fechaModificacion);
  
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return { message: "false" };
    }
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error",
    };
  }
};

CategoriaCtrl.eliminarSubcategoria = async (idCategoria, idSubcategoria, empresa,sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Categorias', 'Productos']);
    const categoriaObj = await Models.Categorias.findById(idCategoria);
    let subCatDes = "";
    categoriaObj.subcategorias.forEach((element) => {
      if (element._id == idSubcategoria) {
        subCatDes = element.subcategoria;
      }
    });
    const inputFilter = {
      "datos_generales.id_categoria": idCategoria,
      "datos_generales.subcategoria": subCatDes,
    };
    const filtroCategorias = await Models.Productos.find().where(inputFilter);
    if (filtroCategorias.length > 0) {
      return {
        message: `No se puede eliminar esta subcategoria, productos existentes:  ${filtroCategorias.length}.`,
      };
    } else {
      await Models.Categorias.updateOne(
        {
          _id: idCategoria,
        },
        {
          $pull: {
            subcategorias: {
              _id: idSubcategoria,
            },
          },
        }
      );
      const fechaModificacion = moment().locale("es-mx").format();
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Categorias',  fechaModificacion);
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   fechaModificacion);    
      await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return { message: false };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

CategoriaCtrl.obtenerCategorias = async (empresa, sucursal) => {
  try {
  
    const categorias = await Categorias.find({ empresa }).populate(
      "empresa sucursal"
    ).sort({categoria:1});
  

    return categorias;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = CategoriaCtrl;