const ContabilidadCtrl = {};
const contabilidadModel = require("../models/Contabilidad");

ContabilidadCtrl.crearContabilidad = async (
  input,
  empresa,
  sucursal,
  usuario
) => {
  try {
    const { nombre_servicio } = input;
    const contabilidad_existente = await contabilidadModel.findOne({
      empresa,
      nombre_servicio: nombre_servicio.toUpperCase(),
    });
    if (contabilidad_existente) {
      throw new Error("Este servicio ya está registrado");
    } else {
      const newServicioContabilidad = new contabilidadModel({
        nombre_servicio: nombre_servicio.toUpperCase(),
        empresa,
        sucursal,
        usuario,
      });
      await newServicioContabilidad.save();
      return {
        message: "Concepto agregado.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

ContabilidadCtrl.actualzarContabilidad = async (input, id) => {
  try {
    const { nombre_servicio } = input;
    await contabilidadModel.findByIdAndUpdate(id, {
      nombre_servicio: nombre_servicio.toUpperCase(),
    });
    return {
      message: "Concepto editado.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

ContabilidadCtrl.eliminarContabilidad = async (id) => {
  try {
    const servicioBase = await contabilidadModel.findById(id);
    if (servicioBase) {
      await contabilidadModel.findByIdAndDelete(id);
      return {
        message: "Concepto eliminado.",
      };
    } else {
      return {
        message: "Este concepto no existe.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

ContabilidadCtrl.obtenerContabilidad = async (empresa, sucursal) => {
  try {
    const conceptos = await contabilidadModel
      .find({ empresa })
      .populate("empresa sucursal usuario");
    // console.log(conceptos);
    return conceptos;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = ContabilidadCtrl;
