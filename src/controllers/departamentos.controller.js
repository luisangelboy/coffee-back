const DepartamentosCtrl = {};
const departamentosModel = require("../models/Departamentos");
const ProductoModel = require("../models/Producto");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");
const moment = require("moment");

DepartamentosCtrl.crearDepartamentos = async (input, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Departamentos']);
 
    const { nombre_departamentos } = input;
    const departamento_existente = await Models.Departamentos.findOne({
      nombre_departamentos: nombre_departamentos.toUpperCase(),
    });
    if (departamento_existente) {
      throw new Error("Este departamento ya existe");
    } else {
      const newDepartament = new Models.Departamentos({
        nombre_departamentos: nombre_departamentos.toUpperCase(),
        empresa,
        sucursal,
      });
      const departamentoCreado = await newDepartament.save();
        await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Departamentos',   moment(newDepartament.updatedAt).locale("es-mx").format());  
        await UsuariosController.actualizarBDLocal(empresa, sucursal); 
      return {
        message: departamentoCreado._id,
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

DepartamentosCtrl.obtenerDepartamentos = async (empresa, sucursal) => {
  try {
 
    const departamentosSucursal = await departamentosModel
      .find({ empresa })
      .populate("empresa")
      .sort({nombre_departamentos:1});
    
    return departamentosSucursal;
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error",
    };
  }
};

DepartamentosCtrl.actualzarDepartamentos = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Departamentos']);
    const { nombre_departamentos } = input;
    await Models.Departamentos.findByIdAndUpdate(id, {
      nombre_departamentos: nombre_departamentos.toUpperCase(),
    });
    await ProductoModel.updateMany(
      { "datos_generales.id_departamento": id },
      { "datos_generales.departamento": nombre_departamentos.toUpperCase() }
    );
    const newDepartament = Models.Departamentos.findById(id);
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Departamentos',   moment(newDepartament.updatedAt).locale("es-mx").format());  
    await UsuariosController.actualizarBDLocal(empresa, sucursal); 
    return {
      message: "Actualizacion exitosa.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

DepartamentosCtrl.eliminarDepartamento = async (id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['Departamentos']);
    const filterMarcas = {
      "datos_generales.id_departamento": id,
      eliminado: false,
    };
    const departamentoElegido = await ProductoModel.find().where(filterMarcas);
    
    if (departamentoElegido.length > 0) {
      return {
        message: `No es posible eliminar este departamento, productos existentes: ${departamentoElegido.length}`,
      };
    } else {
       await Models.Departamentos.findByIdAndDelete({ _id: id });
      const newDepartament = Models.Departamentos.findById(id);
      await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Departamentos',   moment(newDepartament.updatedAt).locale("es-mx").format());  
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

module.exports = DepartamentosCtrl;
