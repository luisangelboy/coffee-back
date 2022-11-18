const ProductoMovimiento = require("../models/ProductoMovimiento");
const mongoose = require("mongoose");
const moment = require("moment");

async function obtenerProductoMovimientos(
  empresa,
  sucursal,
  input,
  limit = 20,
  offset = 0
) {
  try {
    let page = Math.max(0, offset);
    const {
      fecha_inicio,
      fecha_fin,
      proveedor,
      metodo_pago,
      forma_pago,
      producto,
      vencidas,
      vigentes, 
      liquidadas
    } = input;

    const fechaInicio = moment(fecha_inicio).locale("es-mx").format();
    const fechaFinal = moment(fecha_fin)
      .add(1, "days")
      .locale("es-mx")
      .format();
    const compra_credito = metodo_pago === "CREDITO" ? true : false;

    let filtro_and = [
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
      { concepto: "compras" },
    ];

    if (fecha_inicio !== "" && fecha_fin !== "") {
      filtro_and.push({
        fecha_registro: {
          $gte: fechaInicio,
          $lte: fechaFinal,
        },
      });
    }
    if (proveedor !== "") {
      let filtro_base_or = [];
      filtro_base_or.push({
        "proveedor.nombre_cliente": {
          $regex: ".*" + proveedor + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "proveedor.numero_cliente": {
          $regex: ".*" + proveedor + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "proveedor.clave_cliente": {
          $regex: ".*" + proveedor + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_base_or,
      });
    }
    if (metodo_pago !== "") {
      filtro_and.push({
        compra_credito,
      });
    }
    if (forma_pago !== "") {
      filtro_and.push({
        forma_pago,
      });
    }
    //vigentes/vencidas
    const todayDate = moment().format("YYYY-MM-DD");
    if (vigentes) {
      filtro_and.push({
        "compra.compra_credito": true,
        "compra.credito_pagado": false,
        "compra.fecha_vencimiento_credito": {$gt: todayDate}
      });
    }
    if (vencidas) {
      filtro_and.push({
        "compra.compra_credito": true,
        "compra.credito_pagado": false,
        "compra.fecha_vencimiento_credito": {$lte: todayDate}
      });
    }
    if (liquidadas) {
      filtro_and.push({
        "compra.compra_credito": true,
        "compra.credito_pagado": true,
      });
    }

    if (producto !== "") {
      let filtro_base_or = [];
      filtro_base_or.push({
        "producto.datos_generales.nombre_comercial": {
          $regex: ".*" + producto + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "producto.datos_generales.nombre_generico": {
          $regex: ".*" + producto + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "producto.datos_generales.codigo_barras": {
          $regex: ".*" + producto + ".*",
          $options: "i",
        },
      }); 
      filtro_base_or.push({
        "producto.datos_generales.clave_alterna": {
          $regex: ".*" + producto + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_base_or,
      });
    }

    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }

    const compras = await ProductoMovimiento.aggregate([
      {
        $sort: {
          fecha_registro: -1,
        },
      },
      {
        $lookup: {
          from: "compras",
          localField: "id_compra",
          foreignField: "_id",
          as: "compra",
        },
      },
      { $unwind: { path: "$compra" } },
      {
        $match: {
          $and: filtro_and,
        },
      },
      {
        $facet: {
          docs: paginate_conf,
          totalDocs: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);
    return compras[0].docs.length
      ? { docs: compras[0].docs, totalDocs: compras[0].totalDocs[0].count }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = {
  obtenerProductoMovimientos,
};
