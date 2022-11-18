const TraspasosCtrl = {};
const ProductoModel = require("../models/Producto");
const TraspasosModel = require("../models/Traspasos");
const ProductosAlamacen = require("../models/Productos_almacen");
const ProductoMovimiento = require("../models/ProductoMovimiento");
const UsuarioModel = require("../models/Usuarios");
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const moment = require("moment");
const mongoose = require("mongoose");
const { isNull } = require("util");

TraspasosCtrl.crearTraspaso = async (input, empresa, usuario) => {
  try {
    const {
      concepto_traspaso,
      almacen_origen,
      almacen_destino,
      datosTransporte,
      sucursalOrigen,
      sucursalDestino,
      productos,
      fecha_registro,
    } = input;

    let productoAlmacenAdd;
    //console.log(almacen_origen, almacen_destino);
    //TRASPASO

    const nuevaTraspasoBase = new TraspasosModel({
      usuario,
      concepto_traspaso,
      almacen_origen: almacen_origen._id !== "" ? almacen_origen : null,
      almacen_destino: almacen_destino._id !== "" ? almacen_destino : null,
      datosTransporte,
      empresa,
      sucursal: sucursalDestino,
      year_registro: moment().locale("es-mx").year(),
      numero_semana_year: moment().locale("es-mx").week(),
      numero_mes_year: moment().locale("es-mx").month(),
      fecha_registro: moment().locale("es-mx").format(),
    });

    //PRODUCTO_MOVIMIENTO one by one Talla
    const newTraspaso = await nuevaTraspasoBase.save();

    productos.forEach(async (element) => {
      let datosProducto = element;
      let precio_unidad =
        datosProducto.product_selected.precios.precios_producto[0];

      let existencia_almacen = null;
      //Cantidad_actual_almacen_origen, cantidad_actual_almacen_destino
      let cantidad_durante_mov_origen = null;

      if (almacen_origen._id !== "") {
        cantidad_durante_mov_origen = await getCantidadExistenciaAlmacen(
          datosProducto,
          almacen_origen,
          empresa
        );
      }

      let cantidad_durante_mov_destino = null;
      if (almacen_destino._id !== "") {
        cantidad_durante_mov_destino = await getCantidadExistenciaAlmacen(
          datosProducto,
          almacen_destino,
          empresa
        );
      }

      //DEBE BUSCAR PRODUCTO EN ALMACENS PRODUCTOS

      /* SABER SI EL ORIGEN SUMA O RESTA
              SABER SI EL DESTINO SUMA O RESTA */
      if (concepto_traspaso.origen !== "N/A") {
        let almacen_origen_datos = await getAlmacenOrigenDatos(
          datosProducto.product_selected._id,
          almacen_origen._id,
          empresa
        );
        //console.log(almacen_origen_datos);
        //productoAlmacenAdd  = await restarCantidad(datosProducto, almacen_origen_datos);

        productoAlmacenAdd = await TraspasosCtrl.restarCantidadAlmacen({
          is_unidad_maxima: datosProducto.unidad_maxima,
          cantidad_a_restar: datosProducto.cantidad_total,
          factor_producto:
            datosProducto.product_selected.precios.unidad_de_compra.cantidad,
          unidad_maxima_producto_almacen:
            datosProducto.product_selected.inventario_general[0].unidad_maxima,
          unidad_de_compra:
            datosProducto.product_selected.precios.unidad_de_compra.unidad,
          almacen_origen_datos,
        });
      }
      //VERIFICA SI EXISTE REGISTRO EN ESTE ALMACEN
      if (concepto_traspaso.destino !== "N/A") {
        existencia_almacen = await getExistenciaAlmacen(
          datosProducto,
          almacen_destino._id,
          empresa
        );

        let productos_almacen = {};

        //unidad_maxima este campo indica si la cantidad nueva del producto la enviaron considerando que sean cajas, costales o piezas, kilos

        productos_almacen = await agregarAlmacen(
          datosProducto,
          almacen_destino,
          existencia_almacen,
          sucursalDestino,
          empresa
        );
        // Función que modifica al almacén origen
        const { actualizar, productos_almacen_inventario } = productos_almacen;
        //console.log(productos_almacen)

        if (actualizar) {
          productoAlmacenAdd = await getProductosAlmacen(
            existencia_almacen,
            productos_almacen_inventario
          );
        } else {
          productoAlmacenAdd = await saveProductosAlmacenInventario(
            productos_almacen_inventario
          );
        }
        //console.log('productosAlmacenInventario:', existencia_almacen, productoAlmacenAdd._id)
      }

      if (datosProducto.new_medidas.length > 0) {
        //console.log('datosProducto.new_medidas.length > 0:', existencia_almacen, productoAlmacenAdd._id)
        let existAlm = existencia_almacen ? true : false;

        await putUnidadesProductoMovimiento(
          datosProducto.new_medidas,
          datosProducto,
          almacen_destino,
          almacen_origen,
          newTraspaso._id,
          empresa,
          usuario,
          sucursalDestino,
          sucursalOrigen,
          existAlm,
          concepto_traspaso,
          datosProducto.product_selected.precios.unidad_de_compra.unidad
        );
      } else {
        //if tipo_producto

        const nuevoProductoMovimiento = new ProductoMovimiento({
          id_traspaso: newTraspaso._id,
          id_producto: datosProducto.product_selected._id,
          producto: {
            almacen_inicial: datosProducto.product_selected.almacen_inicial,
            datos_generales: datosProducto.product_selected.datos_generales,
            precios: datosProducto.product_selected.precios,
            unidades_de_venta: datosProducto.product_selected.unidades_de_venta,
          },
          concepto: "traspasos",
          almacen_origen: almacen_origen._id !== "" ? almacen_origen : null,
          almacen_destino: almacen_destino._id !== "" ? almacen_destino : null,
          cantidad: datosProducto.cantidad_total,
          cantidad_durante_mov_origen: cantidad_durante_mov_origen,
          cantidad_durante_mov_destino: cantidad_durante_mov_destino,
          concepto_traspaso: concepto_traspaso.nombre_concepto,
          unidad:
            datosProducto.product_selected.precios.unidad_de_compra.unidad,
          empresa: empresa,
          sucursal: sucursalDestino,
          usuario: usuario,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format(),
        });

        const nuevoProductoMov = await saveNuevoProductoMovimiento(
          nuevoProductoMovimiento
        );

        //has registro del movimiento
        let unidad = datosProducto.product_selected.unidades_de_venta
          ? datosProducto.product_selected.unidades_de_venta.unidad
          : datosProducto.product_selected.precios.unidad_de_compra;
        let precio = datosProducto.product_selected.unidades_de_venta
          ? datosProducto.product_selected.unidades_de_venta.precio
          : 0;

        let unidad_principal = datosProducto.product_selected.unidades_de_venta
          ? datosProducto.product_selected.unidades_de_venta.unidad_principal
          : datosProducto.product_selected.precios.unidad_de_compra;
        const newMedidaProducto = new UnidadVentaModel({
          id_producto: datosProducto.product_selected._id,
          codigo_barras:
            datosProducto.product_selected.datos_generales.codigo_barras,

          unidad: unidad,
          precio: precio,
          precio_unidad: precio_unidad,
          cantidad: datosProducto.product_selected.cantidad_total,
          unidad_principal: unidad_principal,
          almacen: almacen_destino._id,
          concepto: "unidades",
          empresa: empresa,
          sucursal: sucursalDestino,
          eliminado: false,
        });
      }
    });

    let resp = {
      resp: "success",
      message: "Traspaso realizado con éxito.",
    };
    // console.log("FINAL",resp)
    return resp;
  } catch (error) {
    console.log("PRINCIPAL TRASPASOs", error);
    let message =
      error.MongooseServerSelectionError !== undefined
        ? "Ocurrió un error al realizar el traspaso. Revise su conexión"
        : "Ocurrió un error al realizar el traspaso.";
    let resp = {
      resp: "error",
      message: message,
    };
    return resp;
  }
};

async function saveNuevoProductoMovimiento(nuevoProductoMovimiento) {
  try {
    return await nuevoProductoMovimiento.save();
  } catch (error) {
    console.log(error);
  }
}
async function saveProductosAlmacenInventario(productos_almacen_inventario) {
  try {
    return await productos_almacen_inventario.save();
  } catch (error) {
    console.log(error);
  }
}
async function getExistenciaAlmacen(datosProducto, almacen_destino, empresa) {
  try {
    let respuesta = await ProductosAlamacen.findOne().where({
      "producto._id": datosProducto.product_selected._id,
      id_almacen: almacen_destino,
      empresa,
    });

    return respuesta;
  } catch (error) {
    console.log(error);
  }
}
async function getCantidadExistenciaAlmacen(
  datosProducto,
  almacen_destino,
  empresa
) {
  try {
    let respuesta = await ProductosAlamacen.findOne().where({
      "producto._id": datosProducto.product_selected._id,
      id_almacen: almacen_destino,
      empresa,
    });

    return respuesta.cantidad_existente;
  } catch (error) {}
}

async function getProductosAlmacen(
  existencia_almacen,
  productos_almacen_inventario
) {
  try {
    let respuesta = await ProductosAlamacen.findByIdAndUpdate(
      existencia_almacen._id,
      productos_almacen_inventario
    );
    return respuesta;
  } catch (error) {
    console.log(error);
  }
}

async function getAlmacenOrigenDatos(id, id_almacen_origen, empresa) {
  try {
    //console.log(id, id_almacen_origen, empresa);
    let respuesta = await ProductosAlamacen.findOne().where({
      "producto._id": id,
      id_almacen: id_almacen_origen,
      empresa,
    });

    return respuesta;
  } catch (error) {
    console.log(error);
  }
}
/* async function restarCantidad(producto, almacen_origen_datos){
  productoAlmacenAdd = null;
  let cantidad_existente_minima = 0;

  let inventario_general = await get_inventario_general_origen(producto.unidad_maxima, almacen_origen_datos, producto.cantidad_total, producto.product_selected.precios.unidad_de_compra.cantidad, producto.product_selected.inventario_general[0].unidad_maxima)
  switch (producto.product_selected.precios.unidad_de_compra.unidad) {
    case "Pz":
      productoAlmacenAdd =  await ProductosAlamacen.findByIdAndUpdate({_id: almacen_origen_datos._id},
            {cantidad_existente: inventario_general.cantidad_existente }
          );
      break;
    case "Caja":

      productoAlmacenAdd =  await ProductosAlamacen.findByIdAndUpdate({_id: almacen_origen_datos._id},
          {cantidad_existente: inventario_general.cantidad_existente, cantidad_existente_maxima: inventario_general.cantidad_existente_maxima }
      );

      break;
    case "Kg":
      cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd =  await ProductosAlamacen.findByIdAndUpdate({_id: almacen_origen_datos._id},
          {cantidad_existente: inventario_general.cantidad_existente, cantidad_existente_minima: cantidad_existente_minima }
      );

      break;
    case "Costal":
       cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd =  await ProductosAlamacen.findByIdAndUpdate({_id: almacen_origen_datos._id},
          {cantidad_existente: inventario_general.cantidad_existente, cantidad_existente_maxima: inventario_general.cantidad_existente_maxima,cantidad_existente_minima: cantidad_existente_minima }
      );

      break;
    default:
       cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd =  await ProductosAlamacen.findByIdAndUpdate({_id: almacen_origen_datos._id},
          {cantidad_existente: inventario_general.cantidad_existente, cantidad_existente_minima: cantidad_existente_minima }
      );
      break;
  }
  return productoAlmacenAdd;
}  */

//TraspasosCtrl.obtenerTraspasos

TraspasosCtrl.restarCantidadAlmacen = async ({
  is_unidad_maxima,
  cantidad_a_restar,
  factor_producto,
  unidad_maxima_producto_almacen,
  unidad_de_compra,
  almacen_origen_datos,
}) => {
  /**
   * Returns El ModeloAlmacen Origen Modificado.
   *
   * @param {boolean} is_unidad_maxima dice si se está restando por unidad máxima.
   * @param {number} cantidad_a_restar Cantidad que se va a restar.
   * @param {number} factor_producto  x >= 1   Valor por que se multiplica.
   * @param {String} unidad_maxima_producto_almacen Indica si el valor
   * @return {Object} Modelo Almacen Modificado.
   */
  //async function restarCantidad({ is_unidad_maxima, cantidad_a_restar, factor_producto, unidad_maxima_producto_almacen, unidad_de_compra,  almacen_origen_datos}){
  productoAlmacenAdd = null;
  let cantidad_existente_minima = 0;
  //{ is_unidad_maxima, cantidad_a_restar, factor_producto, unidad_maxima,  almacen_origen_datos}
  //is_unidad_maxima es un dato boolean que dice si se está restando por unidad máxima
  //factor_producto  este dato dice el factor
  //unidad_maxima_producto_almacen de producto almacen

  //producto.product_selected.precios.unidad_de_compra.cantidad
  let inventario_general = await get_inventario_general_origen(
    is_unidad_maxima,
    almacen_origen_datos,
    cantidad_a_restar,
    factor_producto,
    unidad_maxima_producto_almacen
  );

  /* switch (unidad_de_compra) {
    case "Pz":
      productoAlmacenAdd = await ProductosAlamacen.findByIdAndUpdate(
        {
          _id: almacen_origen_datos._id,
        },
        { cantidad_existente: inventario_general.cantidad_existente }
      );
      break;
    case "Caja":
      productoAlmacenAdd = await ProductosAlamacen.findByIdAndUpdate(
        {
          _id: almacen_origen_datos._id,
        },
        {
          cantidad_existente: inventario_general.cantidad_existente,
          cantidad_existente_maxima:
            inventario_general.cantidad_existente_maxima,
        }
      );

      break;
    case "Kg":
      cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd = await ProductosAlamacen.findByIdAndUpdate(
        {
          _id: almacen_origen_datos._id,
        },
        {
          cantidad_existente: inventario_general.cantidad_existente,
          cantidad_existente_minima: cantidad_existente_minima,
        }
      );

      break;
    case "Costal":
      cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd = await ProductosAlamacen.findByIdAndUpdate(
        {
          _id: almacen_origen_datos._id,
        },
        {
          cantidad_existente: inventario_general.cantidad_existente,
          cantidad_existente_maxima:
            inventario_general.cantidad_existente_maxima,
          cantidad_existente_minima: cantidad_existente_minima,
        }
      );

      break;
    default:
      cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
      productoAlmacenAdd = await ProductosAlamacen.findByIdAndUpdate(
        {
          _id: almacen_origen_datos._id,
        },
        {
          cantidad_existente: inventario_general.cantidad_existente,
          cantidad_existente_minima: cantidad_existente_minima,
        }
      );
      break;
  } */
  return productoAlmacenAdd;
};

const get_inventario_general_origen = (
  unidad_maxima,
  almacen_origen_datos,
  cantidad_total,
  cantidadUnidadCompra,
  inventario_general_unidad_maxima
) => {
  let cantidad_existente_maxima = null,
    cantidad_existente = 0;
  if (unidad_maxima) {
    //cantidad_existente = parseFloat(cantidad_total) * parseFloat(producto.product_selected.precios.unidad_de_compra.cantidad)
    cantidad_existente =
      almacen_origen_datos.cantidad_existente -
      parseFloat(cantidad_total) * parseFloat(cantidadUnidadCompra);
    cantidad_existente_maxima =
      almacen_origen_datos.cantidad_existente_maxima - cantidad_total;
  } else {
    cantidad_existente =
      almacen_origen_datos.cantidad_existente - cantidad_total;
    if (inventario_general_unidad_maxima) {
      cantidad_existente_maxima =
        almacen_origen_datos.cantidad_existente_maxima -
        parseFloat(cantidad_total) / parseFloat(cantidadUnidadCompra);
      // console.log('inventario_general_unidad_maxima:',cantidad_existente_maxima)
    }
  }
  return { cantidad_existente_maxima, cantidad_existente };
};
const get_inventario_general = (
  unidad_maxima,
  cantidad_total,
  cantidadUnidadCompra,
  inventario_general_unidad_maxima
) => {
  //console.log(unidad_maxima, cantidad_total, cantidadUnidadCompra, inventario_general_unidad_maxima)
  let cantidad_existente_maxima = null,
    cantidad_existente = 0;
  //console.log(unidad_maxima, cantidad_total, cantidadUnidadCompra, inventario_general_unidad_maxima)
  if (unidad_maxima) {
    //cantidad_existente = parseFloat(cantidad_total) * parseFloat(producto.product_selected.precios.unidad_de_compra.cantidad)
    cantidad_existente =
      parseFloat(cantidad_total) * parseFloat(cantidadUnidadCompra);
    cantidad_existente_maxima = cantidad_total;
  } else {
    cantidad_existente = cantidad_total;
    if (inventario_general_unidad_maxima) {
      cantidad_existente_maxima = parseFloat(
        cantidad_total / cantidadUnidadCompra
      );
      //console.log(cantidad_existente_maxima)
    }
  }
  return { cantidad_existente_maxima, cantidad_existente };
};

async function agregarAlmacen(
  producto,
  almacen,
  existencia_almacen,
  sucursal_destino,
  empresa
) {
  try {
    let productos_almacen_inventario = {};
    let actualizar = false;

    let inventario_general;
    if (producto.inventario_general) {
      inventario_general = get_inventario_general(
        producto.unidad_maxima,
        producto.cantidad_total,
        producto.product_selected.precios.unidad_de_compra.cantidad,
        producto.product_selected.inventario_general[0].unidad_maxima
      );
    } else {
      inventario_general = get_inventario_general(
        producto.unidad_maxima,
        producto.cantidad_total,
        producto.product_selected.precios.unidad_de_compra.cantidad,
        true
      );
    }
    console.log(invetario_general)
    //console.log('agregarAlmacen',  inventario_general, producto.product_selected.precios.unidad_de_compra.unidad, existencia_almacen);
    //console.log('existencia_almacen', producto.product_selected.precios.unidad_de_compra.unidad)
    switch (producto.product_selected.precios.unidad_de_compra.unidad) {
      case "Pz":
        //console.log('Pz', isNull(existencia_almacen) , producto)
        if (isNull(existencia_almacen)) {
          actualizar = false;
          productos_almacen_inventario = new ProductosAlamacen({
            producto: {
              _id: producto.product_selected._id,
              datos_generales: producto.product_selected.datos_generales,
              precios: producto.product_selected.precios,
            },
            cantidad_existente: inventario_general.cantidad_existente,
            unidad_inventario:
              producto.product_selected.precios.unidad_de_compra.unidad,
            empresa: empresa,
            sucursal: sucursal_destino,
            id_almacen: almacen._id,
            almacen: almacen,
            eliminado: false,
            year_registro: moment().locale("es-mx").year(),
            numero_semana_year: moment().locale("es-mx").week(),
            fecha_registro: moment().locale("es-mx").format(),
          });
        } else {
          let cantidad_existente = inventario_general.cantidad_existente;
          actualizar = true;
          productos_almacen_inventario = {
            cantidad_existente:
              inventario_general.cantidad_existente +
              existencia_almacen.cantidad_existente,
          };
        }
        break;

      case "Caja":
        //console.log('Caja', isNull(existencia_almacen) , producto)
        if (isNull(existencia_almacen)) {
          actualizar = false;
          productos_almacen_inventario = new ProductosAlamacen({
            producto: {
              _id: producto.product_selected._id,
              datos_generales: producto.product_selected.datos_generales,
              precios: producto.product_selected.precios,
            },
            cantidad_existente: inventario_general.cantidad_existente,
            // parseFloat(producto.cantidad_total) *
            // parseFloat(producto.product_selected.precios.unidad_de_compra.cantidad),
            unidad_inventario: "Pz",
            //cantidad_existente_minima: almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
            unidad_minima: "Pz",
            cantidad_existente_maxima:
              inventario_general.cantidad_existente_maxima,

            unidad_maxima: "Caja",
            empresa: empresa,
            eliminado: false,
            sucursal: sucursal_destino,
            id_almacen: almacen._id,
            almacen: almacen,
            year_registro: moment().locale("es-mx").year(),
            numero_semana_year: moment().locale("es-mx").week(),
            fecha_registro: moment().locale("es-mx").format(),
          });
        } else {
          actualizar = true;

          productos_almacen_inventario = {
            cantidad_existente:
              existencia_almacen.cantidad_existente +
              inventario_general.cantidad_existente,
            cantidad_existente_maxima:
              existencia_almacen.cantidad_existente_maxima +
              inventario_general.cantidad_existente_maxima,
            "producto.precios": producto.product_selected.precios,
          };
        }

        break;
      case "Kg":
        //console.log('Kg', isNull(existencia_almacen) , producto.product_selected)
        if (isNull(existencia_almacen)) {
          actualizar = false;
          productos_almacen_inventario = new ProductosAlamacen({
            producto: {
              _id: producto.product_selected._id,
              datos_generales: producto.product_selected.datos_generales,
              precios: producto.product_selected.precios,
            },
            cantidad_existente: inventario_general.cantidad_existente,
            unidad_inventario: "Kg",
            cantidad_existente_minima:
              inventario_general.cantidad_existente * 1000,
            unidad_minima: "g",
            cantidad_existente_maxima:
              inventario_general.cantidad_existente_maxima,
            //unidad_maxima: 'Kg',
            empresa: empresa,
            eliminado: false,
            sucursal: sucursal_destino,
            id_almacen: almacen._id,
            almacen: almacen,
            year_registro: moment().locale("es-mx").year(),
            numero_semana_year: moment().locale("es-mx").week(),
            fecha_registro: moment().locale("es-mx").format(),
          });
        } else {
          actualizar = true;

          const cantidad_existente_minima =
            inventario_general.cantidad_existente * 1000;
          const cantidad_existente_maxima =
          inventario_general.cantidad_existente /
            producto.product_selected.precios.unidad_de_compra.cantidad;
          productos_almacen_inventario = {
            cantidad_existente:
              existencia_almacen.cantidad_existente +
              inventario_general.cantidad_existente,
            cantidad_existente_minima:
              existencia_almacen.cantidad_existente + cantidad_existente_minima,
            cantidad_existente_maxima:
              existencia_almacen.cantidad_existente_maxima +
              inventario_general.cantidad_existente_maxima,
            "producto.precios": producto.product_selected.precios,
          };
        }
        break;
      case "Costal":
        if (isNull(existencia_almacen)) {
          // console.log('Costal', isNull(existencia_almacen) , inventario_general)
          actualizar = false;
          productos_almacen_inventario = new ProductosAlamacen({
            producto: {
              _id: producto.product_selected._id,
              datos_generales: producto.product_selected.datos_generales,
              precios: producto.product_selected.precios,
            },
            cantidad_existente:
              inventario_general.cantidad_existente_maxima * 100,
            unidad_inventario: "Kg",
            cantidad_existente_minima:
              inventario_general.cantidad_existente_maxima * 1000,
            unidad_minima: "g",
            cantidad_existente_maxima:
              inventario_general.cantidad_existente_maxima,
            unidad_maxima:
              producto.product_selected.precios.unidad_de_compra.unidad,
            empresa: empresa,
            eliminado: false,
            sucursal: sucursal_destino,
            id_almacen: almacen._id,
            almacen: almacen,
            year_registro: moment().locale("es-mx").year(),
            numero_semana_year: moment().locale("es-mx").week(),
            fecha_registro: moment().locale("es-mx").format(),
          });
        } else {
          actualizar = true;

          const cantidad_actual =
            producto.cantidad_total *
            producto.product_selected.precios.unidad_de_compra.cantidad;

          //const cantidad_existente = cantidad_actual + existencia_almacen.cantidad_existente;
          const cantidad_existente =
            inventario_general.cantidad_existente_maxima * 100;
          //const cantidad_existente_maxima = cantidad_existente / producto.product_selected.precios.unidad_de_compra.cantidad;
          const cantidad_existente_maxima =
            inventario_general.cantidad_existente_maxima;
          //const cantidad_existente_minima = cantidad_existente * 1000;

          const cantidad_existente_minima =
            inventario_general.cantidad_existente * 1000;
          // console.log("AcTUALIZA",cantidad_actual, cantidad_existente, cantidad_existente_maxima, cantidad_existente_minima)
          productos_almacen_inventario = {
            cantidad_existente:
              existencia_almacen.cantidad_existente +
              inventario_general.cantidad_existente,
            cantidad_existente_minima:
              existencia_almacen.cantidad_existente_minima +
              cantidad_existente_minima,
            cantidad_existente_maxima:
              existencia_almacen.cantidad_existente_maxima +
              cantidad_existente_maxima,
            "producto.precios": producto.product_selected.precios,
          };
        }

        break;
      default:
        if (isNull(existencia_almacen)) {
          actualizar = false;
          productos_almacen_inventario = new ProductosAlamacen({
            producto: {
              _id: producto.product_selected._id,
              datos_generales: producto.product_selected.datos_generales,
              precios: producto.product_selected.precios,
            },
            cantidad_existente: producto.cantidad_total,
            unidad_inventario: "Lt",
            cantidad_existente_minima: producto.cantidad_total * 1000,
            unidad_minima:
              producto.product_selected.precios.unidad_de_compra.unidad,
            empresa: empresa,
            eliminado: false,
            sucursal: sucursal_destino,
            id_almacen: almacen._id,
            almacen: almacen,
            year_registro: moment().locale("es-mx").year(),
            numero_semana_year: moment().locale("es-mx").week(),
            fecha_registro: moment().locale("es-mx").format(),
          });
        } else {
          actualizar = true;
          const cantidad_existente_minima =
            inventario_general.cantidad_existente * 1000;
          productos_almacen_inventario = {
            cantidad_existente:
              existencia_almacen.cantidad_existente +
              inventario_general.cantidad_existente,
            //cantidad_existente_minima: ( existencia_almacen.cantidad_existente_minima + cantidad_existente_minima),
            "producto.precios": producto.product_selected.precios,
          };
        }

        break;
    }
    //console.log("FUNCTION ADD PRODUCTO ALMACEN",  productos_almacen_inventario)
    return { actualizar, productos_almacen_inventario };
  } catch (error) {
    console.log("PRODUCTOS ALMACEN", error);
  }
}

const getCantidad = (cantidad_nueva, cantidad_medida, accion) => {
  //console.log('getCantidad',cantidad_nueva, cantidad_medida, accion)
  const ACTION_CANTIDAD = {
    SUMA: cantidad_nueva + cantidad_medida,
    RESTA: cantidad_medida - cantidad_nueva,
    "N/A": cantidad_medida,
  };
  //console.log('ACTION_CANTIDAD[accion]',ACTION_CANTIDAD[accion])
  return ACTION_CANTIDAD[accion];
};

async function putUnidadesProductoMovimiento(
  arrayMedida,
  producto,
  almacen_destino,
  almacen_origen,
  id_traspaso,
  empresa,
  usuario,
  sucursal_destino,
  sucursal_origen,
  modificar,
  concepto_traspaso,
  unidad_de_compra
) {
  try {
    //console.log('putUnidadesProductoMovimiento:',  concepto_traspaso, unidad_de_compra)
    let cantidad_total_medida = 0;
    let unidadVenta_registrar = [];
    /* let nuevoProductoMovimiento = []; */
    let productosMovimientos = [];
    let unidadVenta_actualizar = [];
    let medidaDestino = [];
    let id_producto = "";
    let sucursal = "";
    let precio_unidad = producto.product_selected.precios.precios_producto[0];

    for (var i = 0; i < arrayMedida.length; i++) {
      const {
        _id,
        cantidad,
        existencia,
        precio,
        codigo_barras,
        color,
        medida,
        nombre_comercial,
        precio_unidad,
      } = arrayMedida[i].medida;

      const cantidad_nueva = arrayMedida[i].nuevaCantidad;

      //MODIFICA,  BUSCA LA UNIDAD MODELO MEDIDAS  DE LA SUCURSAL DESTINO
      let cantidadTo = 0;

      id_producto = producto.product_selected._id;

      //Sucursal Origen

      if (concepto_traspaso.origen !== "N/A") {
        cantidadTo = getCantidad(
          cantidad_nueva,
          arrayMedida[i].medida.cantidad,
          concepto_traspaso.origen
        );
        const findOneupt = await UnidadVentaModel.findOneAndUpdate(
          {
            id_producto,
            "color._id": color._id,
            "medida._id": medida._id,
            sucursal: sucursal_origen,
            empresa,
            almacen: almacen_origen._id,
          },
          { cantidad: cantidadTo }
        );
      }

      //Sucursal Destino
      if (concepto_traspaso.destino !== "N/A") {
        medidaDestino = await UnidadVentaModel.findOne({
          id_producto,
          "color._id": color._id,
          "medida._id": medida._id,
          sucursal: sucursal_destino,
          empresa,
          almacen: almacen_destino._id,
        });

        if (medidaDestino) {
          cantidadTo = getCantidad(
            cantidad_nueva,
            medidaDestino.cantidad,
            concepto_traspaso.destino
          );
          // console.log('Destino Cantidad to:', cantidadTo)
          id_producto = producto.product_selected._id;

          const findUnidad = await UnidadVentaModel.findOneAndUpdate(
            {
              id_producto,
              "color._id": color._id,
              "medida._id": medida._id,
              sucursal: sucursal_destino,
              empresa,
              almacen: almacen_destino._id,
            },
            {
              cantidad: cantidadTo,
              precio: precio,
              precio_unidad: precio_unidad,
            }
          );
        } else {
          // console.log('almacen_destino almacen_destino to:', almacen_destino)
          id_producto = producto.product_selected._id;
          sucursal = sucursal_origen;

          //const findUpdate = await UnidadVentaModel.findOneAndUpdate({id_producto, "color._id": color._id, "medida._id": medida._id, sucursal, empresa, almacen: almacen_origen}, { cantidad: cantidadTo });
          //console.log('findUpdate', findUpdate)
          //Crea la unidad de almacen destino
          const newMedidaProducto = new UnidadVentaModel({
            id_producto: producto.product_selected._id,
            codigo_unidad: "H87",
            unidad: "Pz",
            codigo_barras,
            color,
            existencia,
            nombre_comercial,
            medida,
            precio,
            precio_unidad: precio_unidad,
            cantidad: cantidad_nueva,
            almacen: almacen_destino._id,
            concepto: "medidas",
            empresa: empresa,
            sucursal: sucursal_destino,
            eliminado: false,
          });
          const newMedida = await newMedidaProducto.save();

          // console.log('nuevoProductoMov', nuevoProductoMov);
        }
        const nuevoProductoMovimiento = new ProductoMovimiento({
          id_traspaso: id_traspaso,
          id_producto: producto.product_selected._id,
          producto: {
            almacen_inicial: producto.product_selected.almacen_inicial,
            datos_generales: producto.product_selected.datos_generales,
            precios: producto.product_selected.precios,
            unidades_de_venta: producto.product_selected.unidades_de_venta,
          },
          concepto: "traspasos",
          unidad: unidad_de_compra,
          almacen_origen: almacen_origen._id !== "" ? almacen_origen._id : null,
          almacen_destino:
            almacen_destino._id !== "" ? almacen_destino._id : null,
          medida: {
            id_medida: medida._id,
            medida: medida.talla,
            tipo: medida.tipo,
          },
          color: {
            id_color: color._id,
            color: color.nombre,
            hex: color.hex,
          },
          cantidad: cantidad_nueva,
          unidad: producto.product_selected.precios.unidad_de_compra.unidad,
          //id_unidad_venta: producto.product_selected.unidades_de_venta[0]._id,
          empresa: empresa,
          sucursal: sucursal_destino,
          usuario: usuario,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format(),
        });
        // console.log('nuevoProductoMov', nuevoProductoMovimiento);
        const nuevoProductoMov = await nuevoProductoMovimiento.save();
      }
    }
  } catch (error) {
    console.log("PUT MEDIDA", error);
  }
}

const objectProductoMovimiento = (concepto, idMovimiento) => {
  //Concepto "Traspasos" o "Compras"
  //idMovimiento Traspasos / Compras

  let object = {};

  return object;
};

TraspasosCtrl.obtenerProductosPorEmpresa = async (empresa, filtro, limit, offset) => {
  try {
   
    let filtro_match = {};
    let page = Math.max(0, offset);

    //Agregar la condicion de las tallas y unidades de venta normal

    if (filtro) {
      filtro_match = {
        $match: {
          $or: [
            {
              "datos_generales.codigo_barras": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.clave_alterna": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.tipo_producto": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.nombre_comercial": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.nombre_generico": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.categoria": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.subcategoria": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.marca": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
          ],
          $and: [
            {
              empresa: mongoose.Types.ObjectId(empresa),
            },
            //{sucursal: mongoose.Types.ObjectId(sucursal)},
            /* {eliminado: false} */
          ],
        },
      };
    } else {
      filtro_match = {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          //sucursal: mongoose.Types.ObjectId(sucursal),
          /* eliminado: false */
        },
      };
    }

    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }

    const productos = await ProductoModel.aggregate([
      filtro_match,
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

    return productos[0].docs.length
    ? { docs: productos[0].docs, totalDocs: productos[0].totalDocs[0].count }
    : { docs: [], totalDocs: 0 };  

    //return productos;
  } catch (error) {
    console.log("objectProductoMovimiento", error);
    return error;
  }
};

TraspasosCtrl.obtenerTraspasos = async (input, limit = 20, offset = 0) => {
  try {
    let page = Math.max(0, offset);
    const {
      empresa,
      sucursal,
      fecha_inicio,
      fecha_final,
      producto,
      usuario,
      almacen_origen,
      almacen_destino,
    } = input;

    const fechaInicio = moment(fecha_inicio).locale("es-mx").format();
    const fechaFinal = moment(fecha_final)
      .add(1, "days")
      .locale("es-mx")
      .format();

    let filtro_and = [
      {
        empresa: mongoose.Types.ObjectId(empresa),
      },
      {
        sucursal: mongoose.Types.ObjectId(sucursal),
      },
      {
        concepto: "traspasos",
      },
    ];

    if (fecha_inicio !== "" && fecha_final !== "") {
      filtro_and.push({
        fecha_registro: {
          $gte: fechaInicio,
          $lte: fechaFinal,
        },
      });
    }

    if (usuario !== "") {
      filtro_and.push({ usuario: mongoose.Types.ObjectId(usuario) });
    }
    if (almacen_origen) {
      filtro_and.push({
        "id_traspaso.almacen_origen._id": mongoose.Types.ObjectId(almacen_origen),
      });
    }
    if (almacen_destino) {
      filtro_and.push({
        "id_traspaso.almacen_destino._id": mongoose.Types.ObjectId(almacen_destino),
      });
    } 

    if (producto) {
      filtro_and.push({
        "producto.datos_generales.nombre_comercial": { $regex: '.*' + producto + '.*', $options: 'i' },
      });
    } 

    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }
    
    const traspasos = await ProductoMovimiento.aggregate([
      {
        $sort: {
          fecha_registro: -1,
        },
      },
      {
        $lookup: {
          from: "traspasos",
          localField: "id_traspaso",
          foreignField: "_id",
          as: "id_traspaso",
        },
      },
      {
        $unwind: { path: "$id_traspaso" },
      },
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

    /* const datos_populate = await ProductoMovimiento.populate(traspasos, [{
      model: "", path: "id_traspaso almacen_origen almacen_destino "
    }]); */

    return traspasos[0].docs.length
      ? {
          docs: traspasos[0].docs,
          totalDocs: traspasos[0].totalDocs[0].count,
        }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log("ERROR CONSULTAS TRASPASOS", error);
  }
};

module.exports = TraspasosCtrl;
