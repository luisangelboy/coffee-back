const ventasCtrl = {};
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UnidadesProductoModel = require("../models/Unidad_venta_producto");
const AlmacenesModel = require("../models/Almacen");
const mongoose = require("mongoose");
const ProductoModel = require("../models/Producto");
const EmpresaModel = require("../models/Empresa");
const ClienteModel = require("../models/Clientes");
const VentasModel = require("../models/Ventas");
const ProductoMovimientoModel = require("../models/ProductoMovimiento");
const moment = require("moment");
const {
  restarCantidadAlmacen,
} = require("../controllers/traspasos.controller");
const {
  crearHistorialCaja,
} = require("../controllers/historialCajas.controller");
const UsuarioModel = require("../models/Usuarios");
const HistorialCajaModel = require("../models/HistorialCajas");
const ProductoAlmacenModel = require("../models/Productos_almacen");
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const AbonosModel = require("../models/Abonos");

const CajaModel = require("../models/Cajas");

ventasCtrl.obtenerConsultaGeneralVentas = async (empresa, sucursal) => {
  try {
    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: sucursal,
      default_almacen: true,
    });
    if (!almacenPrincipal) throw new Error("Error de registro");
    //Hacer la consulta a almacenes y traerte toda la informacion del producto (Crear sus Lookup)
    const productosUnidades = await UnidadesProductoModel.aggregate([
      {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          sucursal: mongoose.Types.ObjectId(sucursal),
        },
      },
      {
        $lookup: {
          from: "productoalmacens",
          let: {
            id: "$id_producto",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            almacen: `${almacenPrincipal._id}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$id_almacen", { $toObjectId: "$$almacen" }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$producto._id",
                cantidad_existente: { $first: "$cantidad_existente" },
                unidad_inventario: { $first: "$unidad_inventario" },
                cantidad_existente_maxima: {
                  $first: "$cantidad_existente_maxima",
                },
                unidad_maxima: { $first: "$unidad_maxima" },
              },
            },
          ],
          as: "inventario_general",
        },
      },
    ]);
    const datosPopulate = await ProductoModel.populate(productosUnidades, {
      path: "id_producto",
    });
    return datosPopulate;
  } catch (error) {
    console.log(error);
    return error;
  }
};

ventasCtrl.obtenerUnProductoVentas = async (
  empresa,
  sucursal,
  datosProductos
) => {
  try {
    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: sucursal,
      default_almacen: true,
    });
    if (!almacenPrincipal) throw new Error("Error de registro");
    const productosUnidades = await UnidadesProductoModel.aggregate([
      {
        $lookup: {
          from: "productoalmacens",
          let: {
            id: "$id_producto",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            //tipo_producto: `${OTROS}`,
            unidad_principal: "$unidad_principal",
            almacen: `${almacenPrincipal._id}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$almacen._id", { $toObjectId: "$$almacen" }] },
                    //{ $eq: ["$producto.datos_generales.tipo_producto", { $toString: "$$tipo_producto" }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$producto._id",
                cantidad_existente: { $first: "$cantidad_existente" },
                unidad_inventario: { $first: "$unidad_inventario" },
                cantidad_existente_maxima: {
                  $first: "$cantidad_existente_maxima",
                },
                unidad_maxima: { $first: "$unidad_maxima" },
                id_almacen_general: { $first: "$id_almacen" },
              },
            },
          ],
          as: "inventario_general",
        },
      },
      { $unwind: { path: "$inventario_general" } },
      {
        $lookup: {
          from: "productos",
          localField: "id_producto",
          foreignField: "_id",
          as: "id_producto",
        },
      },
      { $unwind: { path: "$id_producto" } },
      {
        $match: {
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            //{ sucursal: mongoose.Types.ObjectId(sucursal) },
            {
              $or: [
                {
                  $and: [
                    { concepto: "unidades" },
                    { "id_producto.datos_generales.tipo_producto": "OTROS" },
                    {
                      $or: [
                        { unidad: { $ne: "Kg" } },
                        { unidad: { $ne: "Lt" } },
                        { unidad: { $ne: "Pz" } },
                      ],
                    },
                    { "inventario_general.unidad_maxima": { $ne: null } },
                  ],
                },
                {
                  $and: [
                    { concepto: "unidades" },
                    { "id_producto.datos_generales.tipo_producto": "OTROS" },
                    {
                      $or: [
                        { unidad: "Kg" },
                        { unidad: "Lt" },
                        { unidad: "Pz" },
                      ],
                    },
                  ],
                },
                {
                  $and: [
                    { concepto: "medidas" },
                    { "id_producto.datos_generales.tipo_producto": "ROPA" },
                  ],
                },
                {
                  $and: [
                    { concepto: "medidas" },
                    { "id_producto.datos_generales.tipo_producto": "CALZADO" },
                  ],
                },
              ],
            },
            {
              $or: [
                {
                  $and: [
                    {"id_producto.datos_generales.codigo_barras": datosProductos},
                    {"unidad_principal": true},
                  ]
                },
                {
                  $and: [
                    {"id_producto.datos_generales.clave_alterna": datosProductos},
                    {"unidad_principal": true},
                  ]
                },
                {
                  $and: [
                    {"id_producto.datos_generales.clave_alterna": datosProductos},
                    {"concepto": "medidas"},
                  ]
                },
              ]
            }
          ],
        },
      },
    ]);

    let OnlyFromAlmacenPrincipal = [];

    for (let index = 0; index < productosUnidades.length; index++) {
      const element = productosUnidades[index];
      element.inventario_general = [element.inventario_general];
      OnlyFromAlmacenPrincipal.push(element);
    }


    // const datosPopulate = await ProductoModel.populate(productosUnidades, {
    //   path: "id_producto",
    // });

    // let OnlyFromAlmacenPrincipal = [];
    // for (let index = 0; index < datosPopulate.length; index++) {
    //   let element = datosPopulate[index];
    //   let object = null;
    //   let concepto = element.concepto;
    //   let tipo_producto = element.id_producto.datos_generales.tipo_producto;

    //   console.log(element)

    //   let almacen_principal_id = almacenPrincipal._id.toString();
    //   let is_unidad_minima =
    //     element.unidad.trim() === "Lt" ||
    //     element.unidad.trim() === "Kg" ||
    //     element.unidad.trim() === "Pz"
    //       ? true
    //       : false;
    //   if (
    //     (concepto === "unidades" &&
    //       tipo_producto === "OTROS" &&
    //       !is_unidad_minima &&
    //       element.inventario_general[0].unidad_maxima !== null) ||
    //     (concepto === "unidades" &&
    //       tipo_producto === "OTROS" &&
    //       is_unidad_minima) ||
    //     (concepto === "medidas" && tipo_producto === "ROPA") ||
    //     (concepto === "medidas" && tipo_producto === "CALZADO")
    //   ) {
    //     OnlyFromAlmacenPrincipal.push(element);
    //   }
    // }
    // const empresa_base = await EmpresaModel.findById(empresa);

    // const filterProducto = await OnlyFromAlmacenPrincipal.filter(
    //   (producto, index) => {
    //     if (typeof producto.codigo_barras !== "undefined") {
    //       if (producto.codigo_barras === datosProductos) {
    //         return producto;
    //       } else if (
    //         producto.id_producto.datos_generales.clave_alterna ===
    //           datosProductos &&
    //         producto.unidad_principal === true
    //       ) {
    //         return producto;
    //       } else if (
    //         producto.id_producto.datos_generales.clave_alterna ===
    //           datosProductos &&
    //         producto.concepto === "medidas"
    //       ) {
    //         return producto;
    //       }
    //     } else {
    //       if (
    //         producto.id_producto.datos_generales.clave_alterna ===
    //           datosProductos &&
    //         producto.unidad_principal === true
    //       ) {
    //         return producto;
    //       } else if (
    //         producto.id_producto.datos_generales.clave_alterna ===
    //           datosProductos &&
    //         producto.concepto === "medidas"
    //       ) {
    //         return producto;
    //       }
    //     }
    //   }
    // );
    /* const filterProducto = await datosPopulate.filter((producto, index) => {
      if (typeof producto.codigo_barras !== "undefined") {
        if (
          producto.codigo_barras === datosProductos ||
          producto.id_producto.datos_generales.clave_alterna === datosProductos
        ) {
          if (producto.cantidad === 0 && !empresa_base.vender_sin_inventario) {
            throw new Error("Este producto no tiene existencias");
          } else {
            return producto;
          }
        }
      } else {
        if (
          producto.id_producto.datos_generales.clave_alterna === datosProductos
        ) {
          if (producto.cantidad === 0 && !empresa_base.vender_sin_inventario) {
            throw new Error("Este producto no tiene existencias");
          } else {
            return producto;
          }
        }
      }
    }); */

    /* return filterProducto.length > 0 ? filterProducto[0] : {}; */
    return OnlyFromAlmacenPrincipal;
  } catch (error) {
    console.log(error);
    return error;
  }
};

ventasCtrl.obtenerClientesVentas = async (
  empresa,
  sucursal,
  limit = 0,
  offset = 0,
  filtro,
) => {
  try {
    let page = Math.max(0, offset);

    let filter = {
      tipo_cliente: "CLIENTE",
      empresa: empresa,
      //sucursal: sucursal,
      estado_cliente: true,
      eliminado: false,
    };
    if(filtro){
      filter.nombre_cliente = { $regex: ".*" + filtro + ".*", $options: "i" }
    }
    const clientesBase = await ClienteModel.find()
      .where(filter)
      .limit(limit)
      .skip(limit * page);
    const totalDocs = await ClienteModel.find().where(filter).countDocuments();

    return clientesBase.length
      ? { docs: clientesBase, totalDocs: totalDocs }
      : { docs: [], totalDocs: 0 };

    //return clientesBase;
  } catch (error) {
    console.log(error);
  }
};

ventasCtrl.obtenerProductosVentas = async (
  empresa,
  sucursal,
  input,
  limit = 0,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    const { producto } = input;
    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: sucursal,
      default_almacen: true,
    });
    if (!almacenPrincipal) throw new Error("Error de registro");

    const paginate_conf = [{ $skip: limit * page }];
    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const productosUnidades = await UnidadesProductoModel.aggregate([
      {
        $lookup: {
          from: "productoalmacens",
          let: {
            id: "$id_producto",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            //tipo_producto: `${OTROS}`,
            unidad_principal: "$unidad_principal",
            almacen: `${almacenPrincipal._id}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$almacen._id", { $toObjectId: "$$almacen" }] },
                    //{ $eq: ["$producto.datos_generales.tipo_producto", { $toString: "$$tipo_producto" }] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$producto._id",
                cantidad_existente: { $first: "$cantidad_existente" },
                unidad_inventario: { $first: "$unidad_inventario" },
                cantidad_existente_maxima: {
                  $first: "$cantidad_existente_maxima",
                },
                unidad_maxima: { $first: "$unidad_maxima" },
                id_almacen_general: { $first: "$id_almacen" },
              },
            },
          ],
          as: "inventario_general",
        },
      },
      { $unwind: { path: "$inventario_general" } },
      {
        $lookup: {
          from: "productos",
          localField: "id_producto",
          foreignField: "_id",
          as: "id_producto",
        },
      },
      { $unwind: { path: "$id_producto" } },
      {
        $match: {
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            //{ sucursal: mongoose.Types.ObjectId(sucursal) },
            {
              $or: [
                {
                  $and: [
                    { concepto: "unidades" },
                    { "id_producto.datos_generales.tipo_producto": "OTROS" },
                    {
                      $or: [
                        { unidad: { $ne: "Kg" } },
                        { unidad: { $ne: "Lt" } },
                        { unidad: { $ne: "Pz" } },
                      ],
                    },
                    { "inventario_general.unidad_maxima": { $ne: null } },
                  ],
                },
                {
                  $and: [
                    { concepto: "unidades" },
                    { "id_producto.datos_generales.tipo_producto": "OTROS" },
                    {
                      $or: [
                        { unidad: "Kg" },
                        { unidad: "Lt" },
                        { unidad: "Pz" },
                      ],
                    },
                  ],
                },
                {
                  $and: [
                    { concepto: "medidas" },
                    { "id_producto.datos_generales.tipo_producto": "ROPA" },
                  ],
                },
                {
                  $and: [
                    { concepto: "medidas" },
                    { "id_producto.datos_generales.tipo_producto": "CALZADO" },
                  ],
                },
              ],
            },
          ],
          $or: [
            {
              "id_producto.datos_generales.clave_alterna": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.nombre_comercial": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.nombre_generico": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.categoria": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.categoria": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.codigo_barras": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
            {
              "id_producto.datos_generales.tipo_producto": {
                $regex: ".*" + producto + ".*",
                $options: "i",
              },
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
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

    let OnlyFromAlmacenPrincipal = [];

    for (let index = 0; index < productosUnidades[0].docs.length; index++) {
      const element = productosUnidades[0].docs[index];
      element.inventario_general = [element.inventario_general];
      OnlyFromAlmacenPrincipal.push(element);
    }
    /* for (let index = 0; index < productosUnidades[0].docs.length; index++) {
      let element = productosUnidades[0].docs[index];
      let object = null;
      let concepto = element.concepto;
      let tipo_producto = element.id_producto.datos_generales.tipo_producto;

      let almacen_principal_id = almacenPrincipal._id.toString();

      let is_unidad_minima =
        element.unidad.trim() === "Lt" ||
        element.unidad.trim() === "Kg" ||
        element.unidad.trim() === "Pz"
          ? true
          : false;

      if (
        (concepto === "unidades" &&
          tipo_producto === "OTROS" &&
          !is_unidad_minima &&
          element.inventario_general[0].unidad_maxima !== null) ||
        (concepto === "unidades" &&
          tipo_producto === "OTROS" &&
          is_unidad_minima) ||
        (concepto === "medidas" && tipo_producto === "ROPA") ||
        (concepto === "medidas" && tipo_producto === "CALZADO")
      ) {
        OnlyFromAlmacenPrincipal.push(element);
      }
    } */

    /* let filterTotalDocs = 0;
    let filterProducto = [];
    if (producto) {
      filterProducto = await productosUnidades.filter((productoFiltro) => {
        const filtrado = productoFiltro.id_producto.datos_generales;
        if (
          filtrado.clave_alterna.toLowerCase().indexOf(producto.toLowerCase()) >
            -1 ||
          filtrado.nombre_comercial
            .toLowerCase()
            .indexOf(producto.toLowerCase()) > -1 ||
          filtrado.nombre_generico
            .toLowerCase()
            .indexOf(producto.toLowerCase()) > -1 ||
          (filtrado.categoria
            ? filtrado.categoria.toLowerCase().indexOf(producto.toLowerCase()) >
              -1
            : null) ||
          (filtrado.subcategoria
            ? filtrado.subcategoria
                .toLowerCase()
                .indexOf(producto.toLowerCase()) > -1
            : null) ||
          (filtrado.marca
            ? filtrado.marca.toLowerCase().indexOf(producto.toLowerCase()) > -1
            : null) ||
          filtrado.codigo_barras.toLowerCase().indexOf(producto.toLowerCase()) >
            -1 ||
          filtrado.tipo_producto.toLowerCase().indexOf(producto.toLowerCase()) >
            -1
        ) {
          filterTotalDocs += 1;
          return productoFiltro;
        }
      });
    }
 */

    return {
      docs: OnlyFromAlmacenPrincipal,
      totalDocs: productosUnidades[0].totalDocs.length
        ? productosUnidades[0].totalDocs[0].count
        : 0,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};
ventasCtrl.subirVentasCloud = async(arrayVentasCloud) =>{
  try {
    console.log(arrayVentasCloud)

    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: arrayVentasCloud[0].sucursal,
      default_almacen: true,
    });
    const caja = arrayVentasCloud[0].historialCajaInstance.id_Caja;
    const cajaActual = await CajaModel.findById(caja);
    
    const tipo_venta = (arrayVentasCloud[0].new_venta.tipo_venta) ? arrayVentasCloud[0].new_venta.tipo_venta : '';
    if (!almacenPrincipal) throw new Error("Error de registro");
    const userCaja = await UsuarioModel.findById( arrayVentasCloud[0].usuario);
    if (!userCaja) throw new Error("Usuario inexistente");
    //Crear intancia de ventas model
    const momentDate = moment();
    const ventas_fail = [];
    let done = false;
    
   for (let i = 0; i < arrayVentasCloud.length; i++) {
    const doCloud = await realizarVentaCloud(
      arrayVentasCloud[i].empresa, 
      arrayVentasCloud[i].sucursal, 
      arrayVentasCloud[i].cliente, 
      arrayVentasCloud[i].new_venta, 
      arrayVentasCloud[i].historialCajaInstance, 
      arrayVentasCloud[i].productos, 
      arrayVentasCloud[i].puntos_totales_venta,
      userCaja,
      almacenPrincipal, 
      cajaActual,
      momentDate,
      arrayVentasCloud[i].credito, 
      arrayVentasCloud[i].forma_pago, 
      tipo_venta, 
      arrayVentasCloud[i].productos_base,
      arrayVentasCloud[i].montos_en_caja,
      false
    )

    if(!doCloud.done) {
      ventas_fail.push(arrayVentasCloud[i])
 
    }
   }
      

    return {
      message:  (ventas_fail.length !== 0) ? 'Las ventas no se pudieron registrar.' : 'Las ventas se registraron con éxito.', 
      done: ( ventas_fail.length !== 0) ? false : true,
      ventas_fail: ( ventas_fail.length !== 0) ? ventas_fail : []
    };
   
    
  } catch (error) {
    console.log(error)
    return {message:  error.message , done:false}
  }
};


ventasCtrl.addModelsUpdated = async(empresa) => {
  try {
    let respuesta = 'addModelsUpdated';
    //Realizar inserción en model updated de la nube con los modelos que se especifica en el documento
    
     await CloudFunctions.MakeStaticModels(empresa);
    return {message:respuesta};
  } catch (error) {
    console.log(error)
  }
}

ventasCtrl.createVenta = async (input, empresa, sucursal, usuario, caja, isOnline) => {
  try {
    const {
      folio,
      descuento,
      ieps,
      impuestos,
      iva,
      monedero,
      subTotal,
      total,
      venta_cliente,
      montos_en_caja,
      credito,
      descuento_general_activo,
      descuento_general,
      tipo_venta,
      dias_de_credito_venta,
      fecha_de_vencimiento_credito,
      tipo_emision,
      forma_pago,
      metodo_pago,
      cliente,
      productos,
      cambio,
      fecha_venta,
      editar_cliente,
      puntos_totales_venta,
      abono_minimo,
      turno,
    } = input;

    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: sucursal,
      default_almacen: true,
    });

    const cajaActual = await CajaModel.findById(caja);

    if (!almacenPrincipal) throw new Error("Error de registro");
    //Crear intancia de ventas model
    const momentDate = fecha_venta ? moment(fecha_venta) : moment();
    const new_venta_to = {
      folio,
      descuento,
      cambio,
      tipo_emision,
      forma_pago,
      metodo_pago,
      ieps,
      impuestos,
      iva,
      monedero,
      subTotal,
      total,
      venta_cliente,
      status: "REALIZADO",
      montos_en_caja,
      credito,
      abono_minimo,
      saldo_credito_pendiente: total,
      credito_pagado: false,
      descuento_general_activo,
      descuento_general,
      id_caja: caja,
      fecha_de_vencimiento_credito,
      dias_de_credito_venta,
      empresa,
      sucursal,
      usuario,
      cliente,
      year_registro: momentDate.year(),
      numero_semana_year: momentDate.week(),
      numero_mes_year: momentDate.month(),
      fecha_registro: momentDate.locale("es-mx").format(),
    };
    const new_venta = new VentasModel(new_venta_to);
    new_venta_to._id = new_venta._id;
    //Buscar el usuario en turno de la caja
    const userCaja = await UsuarioModel.findById(usuario);
    if (!userCaja) throw new Error("Usuario inexistente");
    //Crear instancia de historial caja model
    const historialCajaInstanceTo = {
      id_movimiento: new_venta._id,
      tipo_movimiento: "VENTA",
      concepto: "",
      rol_movimiento: "CAJA",
      id_Caja: caja,
      numero_caja: cajaActual.numero_caja,
      horario_turno: turno,
      hora_moviento: {
        hora: momentDate.locale("es-mx").format("hh"),
        minutos: momentDate.locale("es-mx").format("mm"),
        segundos: momentDate.locale("es-mx").format("ss"),
        completa: momentDate.locale("es-mx").format("HH:mm:ss"),
      },
      fecha_movimiento: {
        year: momentDate.locale("es-mx").format("YYYY"),
        mes: momentDate.locale("es-mx").format("DD"),
        dia: momentDate.locale("es-mx").format("MM"),
        no_semana_year: momentDate.locale("es-mx").week().toString(),
        no_dia_year: momentDate.locale("es-mx").dayOfYear().toString(),
        completa: momentDate.locale("es-mx").locale("es-mx").format(),
      },
      id_User: userCaja._id,
      numero_usuario_creador: userCaja.numero_usuario,
      nombre_usuario_creador: userCaja.nombre,
      montos_en_caja: montos_en_caja,
      empresa: empresa,
      sucursal: sucursal,
    };
    const historialCajaInstance = new HistorialCajaModel(historialCajaInstanceTo);
    historialCajaInstanceTo._id = historialCajaInstance._id;
    let productos_base = [];
    //Recorrer productos y guardarlos en modelo de producto movimiento
    for (let i = 0; i < productos.length; i++) {
      const producto_venta = productos[i];
      let unidadVentaProducto = {};
      let cantidadARestarGranel = 0;
      //Obtener el producto de producto almacen
      const productoAlmacen = await ProductoAlmacenModel.findOne({
        empresa,
        sucursal,
        id_almacen: almacenPrincipal._id,
        "producto._id": producto_venta.id_producto._id,
      });
      if (!productoAlmacen) throw new Error("Error de registro");
      //Si el producto es a granel sacamos la cantidad en gramos
      if (
        (producto_venta.granel_producto.granel === true &&
          producto_venta.unidad === "Kg") ||
        (producto_venta.granel_producto.granel === true &&
          producto_venta.unidad === "Costal") ||
        (producto_venta.granel_producto.granel === true &&
          producto_venta.unidad === "Lt")
      ) {
        let cantidadGramos = producto_venta.cantidad_venta;
        if (producto_venta.unidad === "Costal")
          cantidadGramos =
            producto_venta.cantidad_venta * producto_venta.cantidad;

        const valorVentaGramos = parseFloat(cantidadGramos) * 1000;
        cantidadARestarGranel = valorVentaGramos; /* * parseFloat(producto_venta.granel_producto.valor); */
      } else {
        cantidadARestarGranel =
          parseFloat(producto_venta.cantidad_venta) * 1000;
      }
      //Verificar que la cantidad en almacen sea mayor a la de compra
      const verificationUnidad = await verificationUnidades({
        unidadProducto: producto_venta.unidad,
        productoAlmacen: productoAlmacen,
        cantidadARestarGranel: cantidadARestarGranel,
        productoVenta: producto_venta,
      });
      if (verificationUnidad === false)
        throw new Error("No hay cantidad suficinte en almacen.");
      if (producto_venta.medida !== null) {
        //Verificar si tiene presentaciones (Obtener la presentacion de unidad de venta)
        unidadVentaProducto = await UnidadesProductoModel.findById(
          producto_venta._id
        );
        if (!unidadVentaProducto) throw new Error("Error de registro");
        //Verificar que en presentaciones haya la cantidad correcta
        if (unidadVentaProducto.cantidad < producto_venta.cantidad_venta)
          throw new Error("No hay cantidad suficinte en almacen.");
      }
      /* const cantidadARestarProductoAlmacen =
        (producto_venta.granel_producto.granel === true &&
          producto_venta.unidad === "Kg") ||
        (producto_venta.granel_producto.granel === true &&
          producto_venta.unidad === "lt")
          ? cantidadARestarGranel / 1000
          : producto_venta.cantidad_venta; */

      const cantidadARestarProductoAlmacen = producto_venta.cantidad_venta;
      //Restar medidas
      if (producto_venta.medida !== null) {
        /* console.log("Es medida"); */
        const medidaProductoAlmacen = await UnidadesProductoModel.findById(
          producto_venta._id
        );
        if (!medidaProductoAlmacen)
          throw new Error("No hay cantidad suficinte en almacen.");
        /* console.log("medida base >>>> ", medidaProductoAlmacen);
        console.log("Cantidad venta >>> ", producto_venta.cantidad_venta); */
        await ProductoAlmacenModel.findByIdAndUpdate(
          {
            _id: productoAlmacen._id,
          },
          {
            cantidad_existente:
              parseFloat(productoAlmacen.cantidad_existente) -
              parseFloat(producto_venta.cantidad_venta),
          }
        );
        const newMedida = await UnidadesProductoModel.findByIdAndUpdate(
          { _id: medidaProductoAlmacen._id },
          {
            cantidad:
              parseInt(medidaProductoAlmacen.cantidad) -
              parseInt(producto_venta.cantidad_venta),
          }
        );
        /* console.log("Medida update >>> ", newMedida); */
        if (!newMedida) throw new Error("Ups algo salio mal.");
      } else {
        //Restar de presentaciones si tiene medida y almacenes del producto
        const objectModifi = await restarCantidadAlmacen({
          is_unidad_maxima:
            producto_venta.unidad === "Caja" ||
            producto_venta.unidad === "Costal"
              ? true
              : false,
          cantidad_a_restar: cantidadARestarProductoAlmacen,
          factor_producto:
            producto_venta.unidad === "Caja" ||
            producto_venta.unidad === "Costal"
              ? parseInt(producto_venta.cantidad)
              : 1,
          almacen_origen_datos: productoAlmacen,
          unidad_de_compra: producto_venta.unidad,
          unidad_maxima_producto_almacen: productoAlmacen.unidad_maxima
            ? productoAlmacen.unidad_maxima
            : null,
        });
        if (!objectModifi) throw new Error("Ups algo salió mal.");
      }

      //Crear intancia de producto movimiento
      const new_producto_movimiento = new ProductoMovimientoModel({
        id_venta: new_venta._id,
        id_producto: producto_venta.id_producto._id,
        id_almacen: almacenPrincipal._id,
        producto: {
          datos_generales: producto_venta.id_producto.datos_generales,
          precios: producto_venta.id_producto.precios,
        },
        concepto: "ventas",
        precio_unidad: producto_venta.precio_unidad,
        subtotal_antes_de_impuestos:
          producto_venta.precio_unidad.precio_venta *
          producto_venta.cantidad_venta,
        precio_actual_object: producto_venta.precio_actual_object,
        cantidad: producto_venta.cantidad,
        iva_total: producto_venta.iva_total_producto,
        ieps_total: producto_venta.ieps_total_producto,
        impuestos: producto_venta.impuestos_total_producto,
        subtotal: producto_venta.subtotal_total_producto,
        total: producto_venta.total_total_producto,
        venta_credito: credito,
        forma_pago,
        medida: {
          id_medida:
            producto_venta.medida !== null ? producto_venta.medida._id : null,
          medida:
            producto_venta.medida !== null ? producto_venta.medida.talla : null,
          tipo:
            producto_venta.medida !== null ? producto_venta.medida.tipo : null,
        },
        color: {
          id_color:
            producto_venta.color !== null ? producto_venta.color._id : null,
          color:
            producto_venta.color !== null ? producto_venta.color.nombre : null,
          hex: producto_venta.color !== null ? producto_venta.color.hex : null,
        },
        cantidad_venta: producto_venta.cantidad_venta,
        tipo_venta: tipo_venta,
        granel_producto: producto_venta.granel_producto,
        precio: producto_venta.precio,
        precio_a_vender: producto_venta.precio_a_vender,
        precio_actual_producto: producto_venta.precio_actual_producto,
        descuento_producto: producto_venta.descuento,
        descuento_activo: producto_venta.descuento_activo,
        default: producto_venta.default,
        unidad: producto_venta.unidad,
        id_unidad_venta: producto_venta._id,
        codigo_unidad: producto_venta.codigo_unidad,
        empresa: empresa,
        sucursal: sucursal,
        usuario: usuario,
        year_registro: momentDate.year(),
        numero_semana_year: momentDate.week(),
        numero_mes_year: momentDate.month(),
        fecha_registro: momentDate.locale("es-mx").format(),
      });
      //Guardar la intancia en el arreglo
      productos_base.push(new_producto_movimiento);
    }
    //Editar cliente
    if (credito) {
      await ClienteModel.findByIdAndUpdate(cliente._id, {
        dias_credito: cliente.dias_credito,
        limite_credito: cliente.limite_credito,
        credito_disponible: cliente.credito_disponible - new_venta.total,
      });
    }
    /*  console.log("Puntos totales >>> ", puntos_totales_venta);
    console.log(
      "Puntos pagados >> ",
      parseFloat(montos_en_caja.monto_monedero.monto)
    ); */
    const puntosRestaVentas =
      parseFloat(puntos_totales_venta) -
      parseFloat(montos_en_caja.monto_monedero.monto);
    /* console.log("Puntos restantes >>>> ", puntosRestaVentas); */
    await ClienteModel.findByIdAndUpdate(cliente._id, {
      monedero_electronico: puntosRestaVentas,
    });
    //TODO:Cobrar el dinero de la venta (En dado caso de que sea a tarjeta)
    //Guardar registro en historial caj
    await historialCajaInstance.save();
    //TOD:Guardar cambio de valores en almacen producto (En un actualizacion se tiene que modificar aqui y no en el for del producto_venta)
    //Guardar todo venta
    await new_venta.save();
    //Guardar productos en producto movimiento
    productos_base.map(async (p) => await p.save());
    
    if(isOnline){
      let doCloud = await realizarVentaCloud(empresa, sucursal, cliente, new_venta_to, historialCajaInstanceTo, productos, puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,momentDate, credito, forma_pago, tipo_venta, productos_base, montos_en_caja, true);
      
      if(!doCloud.done) {
        return { message: doCloud.mensaje, done:false, datos_to_save_storage: { new_venta: new_venta_to, historialCajaInstance: historialCajaInstanceTo, productos_base }};
      }
      
    }else{
      return { message: "Venta completa.", done:true, datos_to_save_storage: {  new_venta: new_venta, historialCajaInstance:historialCajaInstance , productos_base } };
    }
    return { message: "Venta completa.", done:true };
  } catch (error) {
    return { message: "Ocurrió un problema al realizar la venta.", done:false };
    console.log(error);
  }
};

const realizarVentaCloud = async (empresa, sucursal, cliente, new_venta, historialCajaInstance, productos, puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,fecha_venta, credito, forma_pago, tipo_venta, productos_base, montos_en_caja, isOnline) => {
  //Consulta MODELOSBASE en la BD Cloud 
 
  return await CloudFunctions.DoVenta(empresa, sucursal, cliente, new_venta, historialCajaInstance, productos, puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,fecha_venta, credito, forma_pago, tipo_venta, productos_base, montos_en_caja, isOnline);
};
async function verificationUnidades({
  unidadProducto,
  productoAlmacen,
  productoVenta,
  cantidadARestarGranel,
}) {
  try {
    switch (unidadProducto) {
      case "Pz":
        if (productoAlmacen.cantidad_existente < productoVenta.cantidad_venta)
          return false;
        return true;

      case "Caja":
        if (
          productoAlmacen.cantidad_existente_maxima <
          productoVenta.cantidad_venta
        )
          return false;
        return true;

      case "kg":
        if (productoAlmacen.cantidad_existente_minima < cantidadARestarGranel)
          return false;
        return true;

      case "Costal":
        if (
          productoAlmacen.cantidad_existente_maxima <
          productoVenta.cantidad_venta
        )
          return false;
        return true;
      default:
        if (productoAlmacen.cantidad_existente_minima < cantidadARestarGranel)
          return false;
        return true;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

ventasCtrl.obtenerVentasSucursal = async (
  empresa,
  sucursal,
  filtros,
  limit = 0,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    const { busqueda, filtro, vista, turno, admin, isDate } = filtros;

    const fechaActual = moment().locale("es-mx").format();
    const fechaInicial = turno ? moment(turno.fecha_entrada).format() : "";

    const almacenPrincipal = await AlmacenesModel.findOne().where({
      id_sucursal: sucursal,
      default_almacen: true,
    });
    const and_match = [
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
    ];
    const or_match = [
      {
        folio: {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      },
      {
        "usuario.nombre": {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      },
      {
        "cliente.nombre_cliente": {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      },
      {
        "id_caja.numero_caja": {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      },
    ];

    if (vista === "FACTURACION") {
      and_match.push({ status: "REALIZADO" });
    } else {
      if (admin) {
        if (filtro === "HOY") {
          and_match.push({
            fecha_registro: moment().locale("es-mx").format("YYYY-MM-DD"),
          });
        } else if (filtro === "REALIZADAS") {
          and_match.push({ status: "REALIZADO" });
        } else if (filtro === "CANCELADAS") {
          and_match.push({ status: "CANCELADO" });
        }
      } else {
        and_match.push({
          fecha_registro: {
            $gte: fechaInicial,
            $lte: fechaActual,
          },
          id_caja: mongoose.Types.ObjectId(turno.id_caja),
        });
        if (filtro === "REALIZADAS") {
          and_match.push({ status: "REALIZADO" });
        } else if (filtro === "CANCELADAS") {
          and_match.push({ status: "CANCELADO" });
        }
      }
    }

    let startDay = "";
    let endOfday = "";
    const fecha_valida = moment(busqueda, "YYYY/MM/DD", false).isValid();
    if (fecha_valida && isDate) {
      const date = moment(busqueda).format();
      const dates = date.split("T");
      startDay = date;
      endOfday = `${dates[0]}T23:59:59-05:00`;
      or_match.push({
        fecha_registro: {
          $gte: startDay,
          $lte: endOfday,
        },
      });
    }

    const paginate_conf = [{ $skip: limit * page }];
    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const ventas = await VentasModel.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: {
          $or: or_match,
          $and: and_match,
        },
      },
      {
        $lookup: {
          from: "productosmovimientos",
          let: {
            id: "$_id",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            concepto: "ventas",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id_venta", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$concepto", "$$concepto"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "productoalmacens",
                let: {
                  id: "$id_producto",
                  empresa: `${empresa}`,
                  sucursal: `${sucursal}`,
                  almacen: `${almacenPrincipal._id}`,
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                          { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                          { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                          {
                            $eq: ["$id_almacen", { $toObjectId: "$$almacen" }],
                          },
                        ],
                      },
                    },
                  },
                  {
                    $group: {
                      _id: "$producto._id",
                      cantidad_existente: { $first: "$cantidad_existente" },
                      unidad_inventario: { $first: "$unidad_inventario" },
                      cantidad_existente_maxima: {
                        $first: "$cantidad_existente_maxima",
                      },
                      unidad_maxima: { $first: "$unidad_maxima" },
                    },
                  },
                ],
                as: "inventario_general",
              },
            },
            {
              $lookup: {
                from: "productos",
                localField: "id_producto",
                foreignField: "_id",
                as: "id_producto",
              },
            },
            { $unwind: { path: "$id_producto" } },
            {
              $lookup: {
                from: "unidadesventas",
                localField: "id_unidad_venta",
                foreignField: "_id",
                as: "id_unidad_venta",
              },
            },
            { $unwind: { path: "$id_unidad_venta" } },
          ],
          as: "productos",
        },
      },
      {
        $lookup: {
          from: "facturas",
          let: {
            folio: "$folio",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$folio_venta", "$$folio"] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                  ],
                },
              },
            },
          ],
          as: "factura",
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
        },
      },
      {
        $lookup: {
          from: "cajas",
          localField: "id_caja",
          foreignField: "_id",
          as: "id_caja",
        },
      },
      {
        $lookup: {
          from: "notascreditos",
          localField: "_id",
          foreignField: "venta",
          as: "nota_credito",
        },
      },
      //{ $unwind: { path: "$nota_credito" } },
      { $unwind: { path: "$usuario" } },
      { $unwind: { path: "$id_caja" } },
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

    /* const ventas_final = await VentasModel.populate(ventas, {
      path: "usuario id_caja",
    }); */
    /* const venta_final_product = await VentasModel.populate(ventas, [
      {
        path: "productos.id_producto",
        model: "Productos",
      },
      {
        path: "productos.id_unidad_venta",
        model: "Unidadesventa",
      },
    ]); */
    /* console.log(venta_final_product[venta_final_product.length - 1].productos); */
    /* console.log(venta_final_product[0]); */
    //return venta_final_product;

    return ventas[0].docs.length
      ? { docs: ventas[0].docs, totalDocs: ventas[0].totalDocs[0].count }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
};

ventasCtrl.cancelarVentasSucursal = async (empresa, sucursal, folio, input) => {
  try {
    let queries = {};
    const {
      observaciones,
      devolucion_efectivo,
      devolucion_credito,
      turno,
    } = input;

    const filtros = {
      filtro: "",
      busqueda: folio,
      vista: "VENTAS",
      turno,
      admin: true,
    };
    const result = await ventasCtrl.obtenerVentasSucursal(
      empresa,
      sucursal,
      filtros
    );
    if (result.length === 0) throw new Error("No existe este folio");
    const venta = result[0];

    //creo que primero se tiene que cancelar el CFDI si tiene y luego volver a cancelar la venta
    //revisar este detalle

    //devolucion a inventario
    //verificar productosAlmacens si existe
    const almacen_principal = await AlmacenesModel.findOne({
      id_sucursal: sucursal,
      default_almacen: true,
    });
    //buscar productoAlmacens si hay con el almacen devolucion
    const productosAlmacen_principal = await ProductoAlmacenModel.find({
      empresa,
      sucursal,
      id_almacen: almacen_principal._id,
    });
    /* console.log(productosAlmacen_pricipal); */

    for (let i = 0; i < venta.productos.length; i++) {
      const datosProducto = venta.productos[i];
      //si son MEDIDAS actualizar las unidades
      let unidad_medida = {};
      if (datosProducto.id_unidad_venta.concepto === "medidas") {
        const cantidad_nueva = datosProducto.cantidad_venta;
        const { cantidad } = datosProducto.id_unidad_venta;
        unidad_medida = {
          cantidad_nueva: 0,
          cantidad: cantidad + cantidad_nueva,
          almacen: almacen_principal._id,
          existencia: true,
          /* id_producto: datosProducto.id_producto._id  */
        };
        /* console.log({unidad_id: datosProducto.id_unidad_venta._id, unidad_medida}) */
        queries.unidades = {
          _id: datosProducto.id_unidad_venta._id,
          unidad_medida,
        };
      }

      const producto_existente = productosAlmacen_principal.filter(
        (res) =>
          res.producto._id.toString() ===
          datosProducto.id_producto._id.toString()
      );
      /* console.log(producto_existente); */
      //si existe sumarlos, si no exite, crear un nuevo productoAlmacens
      const productos_almacen = await agregarAlmacen(
        datosProducto,
        almacen_principal,
        producto_existente,
        unidad_medida
      );
      /* console.log(productos_almacen); */

      const { actualizar, productos_almacen_inventario } = productos_almacen;
      /* console.log({ actualizar, productos_almacen_inventario }) */
      queries.productos_almacen = {
        actualizar,
        _id: producto_existente.length > 0 ? producto_existente[0]._id : "",
        productos_almacen: productos_almacen_inventario,
      };
    }
    //verificar si va a devolver dinero
    if (devolucion_efectivo) {
      const input = {
        id_movimiento: venta._id,
        tipo_movimiento: "RETIRO",
        concepto: "DEVOLUCIONES",
        numero_caja: turno.numero_caja,
        id_Caja: turno.id_caja,
        horario_turno: turno.horario_en_turno,
        rol_movimiento: "CAJA",
        hora_moviento: {
          hora: moment().locale("es-mx").format("hh"),
          minutos: moment().locale("es-mx").format("mm"),
          segundos: moment().locale("es-mx").format("ss"),
          completa: moment().locale("es-mx").format("HH:mm:ss"),
        },
        fecha_movimiento: {
          year: moment().locale("es-mx").format("YYYY"),
          mes: moment().locale("es-mx").format("DD"),
          dia: moment().locale("es-mx").format("MM"),
          no_semana_year: moment().locale("es-mx").week().toString(),
          no_dia_year: moment().locale("es-mx").dayOfYear().toString(),
          completa: moment().locale("es-mx").format(),
        },
        id_User: turno.usuario_en_turno._id,
        numero_usuario_creador: turno.usuario_en_turno.numero_usuario,
        nombre_usuario_creador: turno.usuario_en_turno.nombre,
        montos_en_caja: {
          monto_efectivo: {
            monto: venta.montos_en_caja.monto_efectivo.monto,
            metodo_pago: "01",
          },
          monto_tarjeta_debito: {
            monto: 0,
            metodo_pago: "28",
          },
          monto_tarjeta_credito: {
            monto: 0,
            metodo_pago: "04",
          },
          monto_creditos: {
            monto: 0,
            metodo_pago: "99",
          },
          monto_monedero: {
            monto: 0,
            metodo_pago: "05",
          },
          monto_transferencia: {
            monto: 0,
            metodo_pago: "03",
          },
          monto_cheques: {
            monto: 0,
            metodo_pago: "02",
          },
          monto_vales_despensa: {
            monto: 0,
            metodo_pago: "08",
          },
        },
        empresa: turno.empresa,
        sucursal: turno.sucursal,
      };
      // Si fue monedero devolverle los puntos al cliente
      let monedero;
      let monto_puntos = venta.montos_en_caja.monto_monedero.monto;
      if (venta.cliente && monto_puntos) {
        const cliente = await ClienteModel.findById(venta.cliente._id);
        const total_monedero = cliente.monedero_electronico + monto_puntos;
        monedero = {
          id: cliente._id,
          monto: total_monedero,
        };
      }
      queries.devolucion_efectivo = { input, empresa, sucursal, monedero };
    }
    //verificar si va a devolver credito
    if (devolucion_credito) {
      if (venta.credito === false) {
        throw new Error("Esta venta no fue a crédito");
      }
      //obtener datos cliente
      const cliente = await ClienteModel.findById(venta.cliente._id);

      if (!cliente.credito_disponible) {
        throw new Error("Este cliente no tiene crédito");
      }
      let limite_credito = cliente.limite_credito;
      let credito_disponible = venta.total + cliente.credito_disponible;

      if (credito_disponible > limite_credito) {
        //si su limite disminuyo y su credito disponible es mayor al limite, sumar lo que falta para el limite
        let diferencia = cliente.credito_disponible - limite_credito;
        credito_disponible = cliente.credito_disponible - diferencia;
      }

      //revisar si tiene abonos, cancelarlos y crear un nuevo historial de cancelacion de compra
      const abonos = await AbonosModel.find({ id_venta: venta._id });
      let cantidad_abonada = 0;
      if (abonos.length > 0) {
        abonos.forEach(
          (abono) => (cantidad_abonada += abono.monto_total_abonado)
        );
      }

      const historial_caja_cancelacion = {
        id_movimiento: venta._id,
        tipo_movimiento: "ABONO_CLIENTE",
        concepto: "CANCELADO",
        numero_caja: turno.numero_caja,
        id_Caja: turno.id_caja,
        horario_turno: turno.horario_en_turno,
        rol_movimiento: "CAJA",
        hora_moviento: {
          hora: moment().locale("es-mx").format("hh"),
          minutos: moment().locale("es-mx").format("mm"),
          segundos: moment().locale("es-mx").format("ss"),
          completa: moment().locale("es-mx").format("HH:mm:ss"),
        },
        fecha_movimiento: {
          year: moment().locale("es-mx").format("YYYY"),
          mes: moment().locale("es-mx").format("DD"),
          dia: moment().locale("es-mx").format("MM"),
          no_semana_year: moment().locale("es-mx").week().toString(),
          no_dia_year: moment().locale("es-mx").dayOfYear().toString(),
          completa: moment().locale("es-mx").format(),
        },
        id_User: turno.usuario_en_turno._id,
        numero_usuario_creador: turno.usuario_en_turno.numero_usuario,
        nombre_usuario_creador: turno.usuario_en_turno.nombre,
        montos_en_caja: {
          monto_efectivo: {
            monto: cantidad_abonada * -1,
            metodo_pago: "01",
          },
          monto_tarjeta_debito: {
            monto: 0,
            metodo_pago: "28",
          },
          monto_tarjeta_credito: {
            monto: 0,
            metodo_pago: "04",
          },
          monto_creditos: {
            monto: 0,
            metodo_pago: "99",
          },
          monto_monedero: {
            monto: 0,
            metodo_pago: "05",
          },
          monto_transferencia: {
            monto: 0,
            metodo_pago: "03",
          },
          monto_cheques: {
            monto: 0,
            metodo_pago: "02",
          },
          monto_vales_despensa: {
            monto: 0,
            metodo_pago: "08",
          },
        },
        empresa: turno.empresa,
        sucursal: turno.sucursal,
      };

      queries.cancelar_abonos = {
        abonos: abonos.length > 0,
        historial_caja_cancelacion,
      };
      queries.devolucion_credito = { _id: cliente._id, credito_disponible };
    }

    //Realizar consultas
    if (queries.unidades) {
      const { _id, unidad_medida } = queries.unidades;
      await UnidadVentaModel.findByIdAndUpdate(_id, unidad_medida);
    }
    if (queries.productos_almacen) {
      if (queries.productos_almacen.actualizar) {
        const { _id, productos_almacen } = queries.productos_almacen;
        await ProductoAlmacenModel.findByIdAndUpdate(_id, productos_almacen);
      } else {
        await queries.productos_almacen.productos_almacen.save();
      }
    }
    if (queries.devolucion_efectivo) {
      const {
        input,
        empresa,
        sucursal,
        monedero,
      } = queries.devolucion_efectivo;
      await crearHistorialCaja(input, empresa, sucursal);
      if (monedero) {
        await ClienteModel.findByIdAndUpdate(monedero.id, {
          monedero_electronico: monedero.monto,
        });
      }
    }
    if (queries.devolucion_credito) {
      const { _id, credito_disponible } = queries.devolucion_credito;
      await ClienteModel.findByIdAndUpdate({ _id }, { credito_disponible });
    }
    //revisar si tiene abonos, cancelarlos y crear un nuevo historial de cancelacion de compra
    if (queries.cancelar_abonos) {
      const { abonos, historial_caja_cancelacion } = queries.cancelar_abonos;

      if (abonos) {
        await AbonosModel.updateMany(
          { id_venta: venta._id },
          { status: "CANCELADO" }
        );
      }
      await crearHistorialCaja(historial_caja_cancelacion, empresa, sucursal);
    }

    //actualizar el estado de la venta a "CANCELADO"
    await VentasModel.findByIdAndUpdate(
      { _id: venta._id },
      { status: "CANCELADO", observaciones }
    );

    return { message: "Venta Cancelada" };
  } catch (error) {
    console.log(error);
    return error;
  }
};

async function agregarAlmacen(
  datosProducto,
  almacen,
  existencia_almacen,
  unidad_medida
) {
  const {
    precios,
    datos_generales,
    empresa,
    sucursal,
  } = datosProducto.id_producto;
  let productos_almacen_inventario = {};
  let actualizar = false;

  switch (datosProducto.unidad) {
    case "Pz":
      if (existencia_almacen.length === 0) {
        actualizar = false;
        productos_almacen_inventario = new ProductoAlmacenModel({
          producto: {
            _id: datosProducto.id_producto._id,
            datos_generales,
            precios,
          },
          /* cantidad_existente: unidad_medida.cantidad
            ? unidad_medida.cantidad
            : datosProducto.cantidad_venta, */
          cantidad_existente: datosProducto.cantidad_venta,
          unidad_inventario: datosProducto.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen._id,
          almacen: almacen,
          year_registro: moment().year(),
          numero_semana_year: moment().week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        const existencia = existencia_almacen[0];
        let cantidad_existente = 0;
        /* if (unidad_medida.cantidad) {
          cantidad_existente = unidad_medida.cantidad;
        } else {
          cantidad_existente =
            existencia.cantidad_existente + datosProducto.cantidad_venta;
        } */

        actualizar = true;
        productos_almacen_inventario = {
          cantidad_existente:
            existencia.cantidad_existente + datosProducto.cantidad_venta,
        };
      }
      break;
    case "Caja":
      if (existencia_almacen.length === 0) {
        actualizar = false;
        productos_almacen_inventario = new ProductoAlmacenModel({
          producto: {
            _id: datosProducto.id_producto._id,
            datos_generales,
            precios,
          },
          cantidad_existente:
            parseFloat(datosProducto.cantidad_venta) *
            parseFloat(precios.unidad_de_compra.cantidad),
          unidad_inventario: "Pz",
          // cantidad_existente_minima: almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
          // unidad_minima: 'Pz',
          cantidad_existente_maxima: datosProducto.cantidad_venta,
          unidad_maxima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen._id,
          almacen: almacen,
          year_registro: moment().year(),
          numero_semana_year: moment().week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        const existencia = existencia_almacen[0];
        actualizar = true;

        const cantidad_actual =
          datosProducto.cantidad_venta * precios.unidad_de_compra.cantidad;
        const cantidad_existente =
          cantidad_actual + existencia.cantidad_existente;
        const cantidad_existente_maxima =
          cantidad_existente / precios.unidad_de_compra.cantidad;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_maxima,
        };
      }

      break;
    case "Kg":
      if (existencia_almacen.length === 0) {
        actualizar = false;
        productos_almacen_inventario = new ProductoAlmacenModel({
          producto: {
            _id: datosProducto.id_producto._id,
            datos_generales,
            precios,
          },
          cantidad_existente: datosProducto.cantidad_venta,
          unidad_inventario: "Kg",
          cantidad_existente_minima: datosProducto.cantidad_venta * 1000,
          unidad_minima: "g",
          // cantidad_existente_maxima: almacen_inicial.cantidad ,
          // unidad_maxima: 'Kg',
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen._id,
          almacen: almacen,
          year_registro: moment().year(),
          numero_semana_year: moment().week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        const existencia = existencia_almacen[0];
        actualizar = true;

        const cantidad_existente =
          existencia.cantidad_existente + datosProducto.cantidad_venta;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
        };
      }
      break;
    case "Costal":
      if (existencia_almacen.length === 0) {
        actualizar = false;
        productos_almacen_inventario = new ProductoAlmacenModel({
          producto: {
            _id: datosProducto.id_producto._id,
            datos_generales,
            precios,
          },
          cantidad_existente:
            datosProducto.cantidad_venta * precios.unidad_de_compra.cantidad,
          unidad_inventario: "Kg",
          cantidad_existente_minima:
            datosProducto.cantidad_venta *
            precios.unidad_de_compra.cantidad *
            1000,
          unidad_minima: "g",
          cantidad_existente_maxima: datosProducto.cantidad_venta,
          unidad_maxima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen._id,
          almacen: almacen,
          year_registro: moment().year(),
          numero_semana_year: moment().week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        const existencia = existencia_almacen[0];
        actualizar = true;

        const cantidad_actual =
          datosProducto.cantidad_venta * precios.unidad_de_compra.cantidad;
        const cantidad_existente =
          cantidad_actual + existencia.cantidad_existente;
        const cantidad_existente_maxima =
          cantidad_existente / precios.unidad_de_compra.cantidad;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
          cantidad_existente_maxima,
        };
      }

      break;
    default:
      if (existencia_almacen.length === 0) {
        actualizar = false;
        productos_almacen_inventario = new ProductoAlmacenModel({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente: datosProducto.cantidad_venta,
          unidad_inventario: "Lt",
          cantidad_existente_minima: datosProducto.cantidad_venta * 1000,
          unidad_minima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen._id,
          almacen: almacen,
          year_registro: moment().year(),
          numero_semana_year: moment().week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        const existencia = existencia_almacen[0];
        actualizar = true;

        const cantidad_existente =
          existencia.cantidad_existente + datosProducto.cantidad_venta;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
        };
      }

      break;
  }
  return { actualizar, productos_almacen_inventario };
}

//reporte ventas por producto
ventasCtrl.obtenerVentasReportes = async (
  empresa,
  sucursal,
  filtros,
  limit = 20,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    const {
      fecha_inicio,
      fecha_fin,
      metodo_pago,
      forma_pago,
      producto,
      cliente,
      usuario,
      folio,
      caja,
      notas_credito,
      canceladas,
      facturadas,
      vencidas,
      vigentes,
      liquidadas
    } = filtros;

    const venta_credito = metodo_pago === "CREDITO" ? true : false;

    let filtro_and = [
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
      { concepto: "ventas" },
    ];

    if (fecha_inicio !== "" && fecha_fin !== "") { 
      const fechaInicio = moment(fecha_inicio).format();
      const fechaFinal = moment(fecha_fin).format();
      const dates = fechaFinal.split("T");
      const fechaFin = `${dates[0]}T23:59:59-05:00`;
      filtro_and.push({
        fecha_registro: {
          $gte: fechaInicio,
          $lte: fechaFin,
        },
      });
      console.log({fechaInicio, fechaFin})
    }
    
    if (metodo_pago !== "") {
      filtro_and.push({
        venta_credito,
      });
    }
    if (forma_pago !== "") {
      filtro_and.push({
        forma_pago,
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
    if (cliente !== "") {
      let filtro_cliente_or = [];
      filtro_cliente_or.push({
        "venta.cliente.clave_cliente": {
          $regex: ".*" + cliente + ".*",
          $options: "i",
        },
      });
      filtro_cliente_or.push({
        "venta.cliente.nombre_cliente": {
          $regex: ".*" + cliente + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_cliente_or,
      });
    }
    if (usuario !== "") {
      let filtro_user_or = [];
      filtro_user_or.push({
        "venta.usuario.numero_usuario": {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_user_or.push({
        "venta.usuario.nombre": {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_user_or,
      });
    }
    if (folio !== "") {
      let filtro_folio_or = [];
      filtro_folio_or.push({
        "venta.folio": {
          $regex: ".*" + folio + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_folio_or,
      });
    }
    if (caja !== "") {
      filtro_and.push({
        "venta.id_caja.numero_caja": parseInt(caja),
      });
    }
    if (canceladas) {
      filtro_and.push({
        "venta.status": "CANCELADO",
      });
    }
    if (facturadas) {
      filtro_and.push({
        factura:{ $exists: true, $type: 'array', $ne: []},
      });
    }
    if (notas_credito) {
      filtro_and.push({
        "nota_credito.id_nota_credito":{ $ne: null},
      });
    }
    //vigentes/vencidas
    const todayDate = moment().format("YYYY-MM-DD");
    if (vigentes) {
      filtro_and.push({
        "venta.credito": true,
        "venta.credito_pagado": false,
        "venta.fecha_de_vencimiento_credito": {$gt: todayDate}
      });
    }
    if (vencidas) {
      filtro_and.push({
        "venta.credito": true,
        "venta.credito_pagado": false,
        "venta.fecha_de_vencimiento_credito": {$lte: todayDate}
      });
    }
    if (liquidadas) {
      filtro_and.push({
        "venta.credito": true,
        "venta.credito_pagado": true,
      });
    }

    const paginate_conf = [{ $skip: limit * page }];

    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const ventas = await ProductoMovimientoModel.aggregate([
      {
        $lookup: {
          from: "ventas",
          localField: "id_venta",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "usuarios",
                localField: "usuario",
                foreignField: "_id",
                as: "usuario",
              },
            },
            {
              $lookup: {
                from: "cajas",
                localField: "id_caja",
                foreignField: "_id",
                as: "id_caja",
              },
            },
            { $unwind: { path: "$usuario" } },
            { $unwind: { path: "$id_caja" } },
          ],
          as: "venta",
        },
      },
      { $unwind: { path: "$venta" } },
      {
        $lookup: {
          from: "facturas",
          localField: "venta.folio",
          foreignField: "folio_venta",
          as: "factura",
        },
      },
      {
        $match: {
          $and: filtro_and,
        },
      },
      {
        $sort: { fecha_registro: -1 },
      },
      {
        $facet: {
          docs: paginate_conf,
          totalDocs: [
            {
              $count: "count",
            },
          ],
          totalVenta: [
            { $group: {
              _id: null,
              total: { $sum: "$total" },
            }},
          ]
        },
      },
    ]);

    return ventas[0].docs.length
      ? { docs: ventas[0].docs, totalDocs: ventas[0].totalDocs[0].count, totalVenta: ventas[0].totalVenta[0].total }
      : { docs: [], totalDocs: 0, totalVenta: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
};

//reporte ventas por venta
ventasCtrl.obtenerVentasByVentaReportes = async (
  empresa,
  sucursal,
  filtros,
  limit = 20,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    const {
      fecha_inicio,
      fecha_fin,
      metodo_pago,
      forma_pago,
      cliente,
      usuario,
      folio,
      caja,
      tipo_emision,
      canceladas,
      facturadas,
      notas_credito,
      publico_general,
      vigentes,
      vencidas,
      liquidadas
    } = filtros;

    let filtro_and = [
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
    ];

    if (fecha_inicio !== "" && fecha_fin !== "") { 
      const fechaInicio = moment(fecha_inicio).format();
      const fechaFinal = moment(fecha_fin).format();
      const dates = fechaFinal.split("T");
      const fechaFin = `${dates[0]}T23:59:59-05:00`;
      filtro_and.push({
        fecha_registro: {
          $gte: fechaInicio,
          $lte: fechaFin,
        },
      });
    }
    
    if (metodo_pago !== "") {
      filtro_and.push({
        metodo_pago,
      });
    }
    if (forma_pago !== "") {
      filtro_and.push({
        forma_pago,
      });
    }
    if (cliente !== "") {
      let filtro_cliente_or = [];
      filtro_cliente_or.push({
        "cliente.clave_cliente": {
          $regex: ".*" + cliente + ".*",
          $options: "i",
        },
      });
      filtro_cliente_or.push({
        "cliente.nombre_cliente": {
          $regex: ".*" + cliente + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_cliente_or,
      });
    }
    if (usuario !== "") {
      let filtro_user_or = [];
      filtro_user_or.push({
        "usuario.numero_usuario": {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_user_or.push({
        "usuario.nombre": {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_user_or,
      });
    }
    if (folio !== "") {
      let filtro_folio_or = [];
      filtro_folio_or.push({
        "folio": {
          $regex: ".*" + folio + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_folio_or,
      });
    }
    if (caja !== "") {
      filtro_and.push({
        "id_caja.numero_caja": parseInt(caja),
      });
    }
    if (tipo_emision !== "") {
      filtro_and.push({
        tipo_emision,
      });
    }

    if (canceladas) {
      filtro_and.push({
        status: "CANCELADO",
      });
    }
    if (facturadas) {
      filtro_and.push({
        factura:{ $exists: true, $type: 'array', $ne: []},
      });
    }
    if (notas_credito) {
      filtro_and.push({
        nota_credito:{ $exists: true, $type: 'array', $ne: []},
      });
    }
    if (publico_general) {
      filtro_and.push({
        cliente: null,
      });
    }

    //vigentes/vencidas
    const todayDate = moment().format("YYYY-MM-DD");
    if (vigentes) {
      filtro_and.push({
        credito: true,
        credito_pagado: false,
        fecha_de_vencimiento_credito: {$gt: todayDate}
      });
    }
    if (vencidas) {
      filtro_and.push({
        credito: true,
        credito_pagado: false,
        fecha_de_vencimiento_credito: {$lte: todayDate}
      });
    }
    if (liquidadas) {
      filtro_and.push({
        credito: true,
        credito_pagado: true,
      });
    }

    const paginate_conf = [{ $skip: limit * page }];

    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const ventas = await VentasModel.aggregate([
      {
        $lookup: {
          from: "facturas",
          localField: "folio",
          foreignField: "folio_venta",
          as: "factura",
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "usuario",
          foreignField: "_id",
          as: "usuario",
        },
      },
      {
        $lookup: {
          from: "cajas",
          localField: "id_caja",
          foreignField: "_id",
          as: "id_caja",
        },
      },
      {
        $lookup: {
          from: "notascreditos",
          localField: "_id",
          foreignField: "venta",
          as: "nota_credito",
        },
      },
      //{ $unwind: { path: "$nota_credito" } },
      { $unwind: { path: "$usuario" } },
      { $unwind: { path: "$id_caja" } },
      {
        $match: {
          $and: filtro_and,
        },
      },
      {
        $sort: { fecha_registro: -1 },
      },
      {
        $facet: {
          docs: paginate_conf,
          totalDocs: [
            {
              $count: "count",
            },
          ],
          totalVenta: [
            { $group: {
              _id: null,
              total: { $sum: "$total" },
            }},
          ]
        },
      },
    ]);

    return ventas[0].docs.length
      ? { docs: ventas[0].docs, totalDocs: ventas[0].totalDocs[0].count, totalVenta: ventas[0].totalVenta[0].total }
      : { docs: [], totalDocs: 0, totalVenta: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = ventasCtrl;
