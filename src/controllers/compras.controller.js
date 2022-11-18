const ComprasModel = require("../models/Compras");
const ProductoModel = require("../models/Producto");
const ProductosAlamacen = require("../models/Productos_almacen");
const ProductoMovimiento = require("../models/ProductoMovimiento");
const AlmacenModel = require("../models/Almacen");
const Clientes = require("../models/Clientes");
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const ComprasEnEsperaModel = require("../models/CompraEnEspera");
const moment = require("moment");
const { editarUnidadesDeMedida } = require("./producto.controller");
const { isNull } = require("util");
const mongoose = require("mongoose");
const { obtenerPreCorteCaja } = require("../controllers/caja.controller");
const HistorialCajas = require("../models/HistorialCajas");
const CajasModel = require("../models/Cajas");
const AbonosModel = require("../models/Abonos");
const {
  crearHistorialCaja,
} = require("../controllers/historialCajas.controller");

const montos_en_caja = {
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
};

async function crearCompra(input, empresa, sucursal, usuario) {
  try {
    //obtener datos
    const {
      _id,
      proveedor,
      productos,
      almacen,
      en_espera,
      compra_credito,
      fecha_vencimiento_credito,
      credito_pagado,
      saldo_credito_pendiente,
      forma_pago,
      descuento_aplicado,
      descuento,
      subtotal,
      impuestos,
      total,
      fecha_registro,
      turnoEnCurso,
      admin,
      sesion,
    } = input;

    //Verificamos los filtros del producto (Que todos los campos esten completos)
    if (
      !proveedor.id_proveedor ||
      !almacen.id_almacen ||
      !productos ||
      !subtotal ||
      !total ||
      !fecha_registro
    ) {
      throw new Error("Datos incompletos.");
    }

    //verificar folios para crear uno nuevo
    let folio = "1";
    const last_compra = await ComprasModel.findOne().sort({createdAt: -1});
    if(last_compra){//si hay, sumarle 1
      folio = parseInt(last_compra.folio) + 1;
    }
    let folio_compra = folio.toString().padStart(6, "0")

    //genramos la instancia de compra
    const nuevaCompraBase = new ComprasModel({
      proveedor,
      almacen,
      en_espera,
      compra_credito,
      fecha_vencimiento_credito: moment(fecha_vencimiento_credito).locale('es-mx').format("YYYY-MM-DD"),
      credito_pagado,
      saldo_credito_pendiente,
      forma_pago,
      descuento_aplicado,
      descuento,
      subtotal,
      impuestos,
      total,
      folio: folio_compra,
      empresa: empresa,
      sucursal: sucursal,
      usuario: usuario,
      year_registro: moment().locale("es-mx").year(),
      numero_semana_year: moment().locale("es-mx").week(),
      numero_mes_year: moment().locale("es-mx").month(),
      fecha_registro: moment(fecha_registro).locale('es-mx').format(),
    });

    //declarar las variables de control para realizar acciones en BD al finalizar
    let newHistorial = "";

    //verificar si es a contado, que tenga suficiente dinero para concretar la compra. si es a credito seguir
    if (compra_credito === false) {
      //verificar la forma de pago si no es bancaria
      if (
        forma_pago !== "03" ||
        forma_pago !== "04" ||
        forma_pago !== "28" ||
        forma_pago !== "02"
      ) {
        //forma bancaria, realizar las operaciones a la caja bancaria de la empresa
        //si es en efectivo, verificar turnos o admin
        if (turnoEnCurso) {
       
          //realizar un precorte de la caja principal con param false y verificar dinero en caja
          const inputPrecorte = {
            id_caja: turnoEnCurso.id_caja,
            id_usuario: turnoEnCurso.id_usuario,
            token_turno_user: turnoEnCurso.token_turno_user,
          };
          const dineroEnCaja = await obtenerPreCorteCaja(
            empresa,
            sucursal,
            inputPrecorte,
            false
          );
          if (total > dineroEnCaja.monto_efectivo_precorte) {
            throw new Error(
              "No hay suficiente efectivo para realizar esta operación"
            );
          }
          //realizar un historial caja
          newHistorial = crearNuevoHistorial(
            turnoEnCurso,
            total * -1,
            empresa,
            sucursal,
            false,
            nuevaCompraBase._id
          );
        } else if (admin) {
          //realizar un precorte de la caja principal con param true y verificar dinero en caja principal
          //obtener la caja principal
          const cajaPrincipal = await CajasModel.findOne({
            empresa,
            sucursal,
            principal: true,
          });
          const inputPrecorte = {
            id_caja: cajaPrincipal._id,
            id_usuario: sesion.id_usuario,
          };
          const dineroEnCaja = await obtenerPreCorteCaja(
            empresa,
            sucursal,
            inputPrecorte,
            true
          );
          if (total > dineroEnCaja.monto_efectivo_precorte) {
            throw new Error(
              "No hay suficiente efectivo para realizar esta operación"
            );
          }
          //realizar un historial caja
          const datosTurno = {
            numero_caja: cajaPrincipal.numero_caja,
            id_caja: cajaPrincipal._id,
            id_User: sesion.id_usuario,
            numero_usuario_creador: sesion.numero_usuario,
            nombre_usuario_creador: sesion.nombre_usuario,
            horario_turno: "",
          };

          newHistorial = crearNuevoHistorial(
            datosTurno,
            total * -1,
            empresa,
            sucursal,
            true,
            nuevaCompraBase._id
          );
        } else {
          //no tiene ni turno y no es admin, mandar mensaje para que abra turno
          throw new Error(
            "No tiene autorización o necesita abrir un turno para realizar esta operación"
          );
        }
      }
    }

    //reecorremos los productos dentro de la compra para realizar algunas acciones
    for (let i = 0; i < productos.length; i++) {
      let datosProducto = productos[i];

      const {
        presentaciones,
        datos_generales,
        precios,
        almacen_inicial,
        unidades_de_venta,
        empresa,
        sucursal,
      } = datosProducto.producto;

      const existencia_almacen = await ProductosAlamacen.findOne().where({
        "producto._id": datosProducto.id_producto,
        id_almacen: almacen.id_almacen,
        empresa,
        sucursal,
      });

      //SI TIENE PRESENTACIONES O NO
      let editarMedidas = {};
      let datos_extra = {
        empresa,
        sucursal,
        usuario,
        proveedor,
        almacen,
        compra_credito,
        forma_pago,
        folio_compra
      };
      if (presentaciones.length > 0) {
        //verificar presentaciones y obtener los datos para guardar unidades de medida y productoMovimiento
        editarMedidas = await editarUnidadesDeMedida(
          empresa,
          sucursal,
          presentaciones,
          datosProducto.producto,
          almacen.id_almacen,
          true,
          nuevaCompraBase._id,
          datosProducto,
          datos_extra
        );
      }

      //verificar producto en ProductosAlmacen
      let productos_almacen = {};
      //suma cantidades
      productos_almacen = await agregarAlmacen(
        datosProducto,
        almacen,
        existencia_almacen,
        editarMedidas
      );

      //si mantener_precios es true, guardar la instancia de producto a ProductosModel
      if (!datosProducto.mantener_precio) {
        await ProductoModel.findByIdAndUpdate(datosProducto.id_producto, {
          precios,
        });
      }
      //guardar instancia ProductosAlmacen y verificar si crear o actualizar
      const { actualizar, productos_almacen_inventario } = productos_almacen;

      if (actualizar) {
        await ProductosAlamacen.findByIdAndUpdate(
          existencia_almacen._id,
          productos_almacen_inventario
        );
      } else {
        await productos_almacen_inventario.save();
      }

      //hacer instancia y save a ProductosMovimientos y unidades
      if (presentaciones.length > 0) {
        //si son tallas y es actualizar o registrar, hacer el save de productos movimientos y unidadesVenta
        const {
          unidadVenta_registrar,
          unidadVenta_actualizar,
          productosMovimientos,
        } = editarMedidas;
        productosMovimientos.forEach(async (movimientos) => {
          await movimientos.save();
        });
        unidadVenta_registrar.forEach(async (unidades) => {
          await unidades.save();
        });
        unidadVenta_actualizar.forEach(async (unidades) => {
          await UnidadVentaModel.findByIdAndUpdate(unidades._id, unidades);
        });
      } else {
        //si son unidades y es actualizar o registrar, hacer el save de prodductos movimientos y unidadesVenta
        const nuevoProductoMovimiento = new ProductoMovimiento({
          folio_compra,
          id_compra: nuevaCompraBase._id,
          id_producto: datosProducto.id_producto,
          id_proveedor: proveedor.id_proveedor,
          id_almacen: almacen.id_almacen,
          almacen: {
            id_almacen: almacen.id_almacen,
            nombre_almacen: almacen.nombre_almacen,
            default_almacen: almacen.default_almacen,
          },
          proveedor: {
            _id: proveedor.id_proveedor,
            clave_cliente: proveedor.clave_cliente,
            numero_cliente: proveedor.numero_cliente,
            nombre_cliente: proveedor.nombre_cliente,
          },
          producto: {
            almacen_inicial,
            datos_generales,
            precios,
            unidades_de_venta,
          },
          concepto: "compras",
          cantidad: datosProducto.cantidad,
          cantidad_regalo: datosProducto.cantidad_regalo,
          unidad_regalo: datosProducto.unidad_regalo,
          cantidad_total: datosProducto.cantidad_total,
          costo: datosProducto.costo,
          descuento_porcentaje: datosProducto.descuento_porcentaje,
          descuento_precio: datosProducto.descuento_precio,
          compra_credito,
          forma_pago,
          iva_total: datosProducto.iva_total,
          ieps_total: datosProducto.ieps_total,
          impuestos: datosProducto.impuestos,
          mantener_precio: datosProducto.mantener_precio,
          subtotal: datosProducto.subtotal,
          total: datosProducto.total,
          unidad: precios.unidad_de_compra.unidad,
          codigo_unidad: precios.unidad_de_compra.codigo_unidad,
          id_unidad_venta: unidades_de_venta[0]._id,
          empresa,
          sucursal,
          usuario,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format(),
        });
        await nuevoProductoMovimiento.save();

        if (!datosProducto.mantener_precio) {
          for (let i = 0; i < unidades_de_venta.length; i++) {
            const element = unidades_de_venta[i];
            await UnidadVentaModel.findByIdAndUpdate(element._id, {
              ...element,
            });
          }
        }
      }
    }
    //guardar la instancia de compra en la BD
    if (en_espera) {
      const compra_espera = await ComprasEnEsperaModel.findById(_id);
      if (compra_espera) {
        const eliminada = await ComprasEnEsperaModel.findByIdAndDelete(_id);
        if (eliminada) {
          await nuevaCompraBase.save();
          return {
            message: "Compra realizada.",
          };
        } else {
          throw new Error("Error al eliminar compra en espera.");
        }
      } else {
        throw new Error("No existe esta compra en espera.");
      }
    } else {
      if (newHistorial) {
       
        await newHistorial.save();
      }
      await nuevaCompraBase.save();
      return {
        message: "Compra realizada.",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

function crearNuevoHistorial(
  turnoEnCurso,
  amount,
  empresa,
  sucursal,
  rol,
  id_compra
) {
  try {
    const input = {
      id_movimiento: id_compra,
      tipo_movimiento: "COMPRA",
      numero_caja: turnoEnCurso.numero_caja,
      id_Caja: turnoEnCurso.id_caja,
      rol_movimiento: rol ? "CAJA_PRINCIPAL" : "CAJA",
      horario_turno: turnoEnCurso.turnoEnCurso,
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
      id_User: turnoEnCurso.id_usuario,
      numero_usuario_creador: turnoEnCurso.numero_usuario_creador,
      nombre_usuario_creador: turnoEnCurso.nombre_usuario_creador,
      montos_en_caja: {
        ...montos_en_caja,
        monto_efectivo: {
          monto: amount,
          metodo_pago: "01",
        },
      },
      empresa,
      sucursal,
    };
    const nuevoHistorial = new HistorialCajas(input);
    return nuevoHistorial;
  } catch (error) {
    return error;
  }
}

async function agregarAlmacen(
  datosProducto,
  almacen,
  existencia_almacen,
  medidas
) {
  const {
    precios,
    datos_generales,
    empresa,
    sucursal,
  } = datosProducto.producto;
  let productos_almacen_inventario = {};
  let actualizar = false;

  switch (precios.unidad_de_compra.unidad) {
    case "Pz":
      if (isNull(existencia_almacen)) {
        actualizar = false;
        productos_almacen_inventario = new ProductosAlamacen({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente: medidas.cantidad_total_medida
            ? medidas.cantidad_total_medida
            : datosProducto.cantidad_total,
          unidad_inventario: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen.id_almacen,
          almacen: almacen,
          default_almacen: almacen.default_almacen,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        let cantidad_existente = 0;
        if (medidas.cantidad_total_medida) {
          cantidad_existente = medidas.cantidad_total_medida;
        } else {
          cantidad_existente =
            existencia_almacen.cantidad_existente +
            datosProducto.cantidad_total;
        }

        actualizar = true;
        productos_almacen_inventario = {
          cantidad_existente,
          "producto.precios": precios,
        };
      }
      break;
    case "Caja":
      if (isNull(existencia_almacen)) {
        actualizar = false;
        productos_almacen_inventario = new ProductosAlamacen({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente:
            parseFloat(datosProducto.cantidad_total) *
            parseFloat(precios.unidad_de_compra.cantidad),
          unidad_inventario: "Pz",
          // cantidad_existente_minima: almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
          // unidad_minima: 'Pz',
          cantidad_existente_maxima: datosProducto.cantidad_total,
          unidad_maxima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen.id_almacen,
          almacen: almacen,
          default_almacen: almacen.default_almacen,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        actualizar = true;

        const cantidad_actual =
          datosProducto.cantidad_total * precios.unidad_de_compra.cantidad;
        const cantidad_existente =
          cantidad_actual + existencia_almacen.cantidad_existente;
        const cantidad_existente_maxima =
          cantidad_existente / precios.unidad_de_compra.cantidad;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_maxima,
          "producto.precios": precios,
        };
      }

      break;
    case "Kg":
      if (isNull(existencia_almacen)) {
        actualizar = false;
        productos_almacen_inventario = new ProductosAlamacen({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente: datosProducto.cantidad_total,
          unidad_inventario: "Kg",
          cantidad_existente_minima: datosProducto.cantidad_total * 1000,
          unidad_minima: "g",
          // cantidad_existente_maxima: almacen_inicial.cantidad ,
          // unidad_maxima: 'Kg',
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen.id_almacen,
          almacen: almacen,
          default_almacen: almacen.default_almacen,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        actualizar = true;

        const cantidad_existente =
          existencia_almacen.cantidad_existente + datosProducto.cantidad_total;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
          "producto.precios": precios,
        };
      }
      break;
    case "Costal":
      if (isNull(existencia_almacen)) {
        actualizar = false;
        productos_almacen_inventario = new ProductosAlamacen({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente:
            datosProducto.cantidad_total * precios.unidad_de_compra.cantidad,
          unidad_inventario: "Kg",
          cantidad_existente_minima:
            datosProducto.cantidad_total *
            precios.unidad_de_compra.cantidad *
            1000,
          unidad_minima: "g",
          cantidad_existente_maxima: datosProducto.cantidad_total,
          unidad_maxima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen.id_almacen,
          almacen: almacen,
          default_almacen: almacen.default_almacen,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        actualizar = true;

        const cantidad_actual =
          datosProducto.cantidad_total * precios.unidad_de_compra.cantidad;
        const cantidad_existente =
          cantidad_actual + existencia_almacen.cantidad_existente;
        const cantidad_existente_maxima =
          cantidad_existente / precios.unidad_de_compra.cantidad;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
          cantidad_existente_maxima,
          "producto.precios": precios,
        };
      }

      break;
    default:
      if (isNull(existencia_almacen)) {
        actualizar = false;
        productos_almacen_inventario = new ProductosAlamacen({
          producto: {
            _id: datosProducto.id_producto,
            datos_generales,
            precios,
          },
          cantidad_existente: datosProducto.cantidad_total,
          unidad_inventario: "Lt",
          cantidad_existente_minima: datosProducto.cantidad_total * 1000,
          unidad_minima: precios.unidad_de_compra.unidad,
          empresa,
          sucursal,
          eliminado: false,
          id_almacen: almacen.id_almacen,
          almacen: almacen,
          default_almacen: almacen.default_almacen,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          fecha_registro: moment().locale("es-mx").format(),
        });
      } else {
        actualizar = true;

        const cantidad_existente =
          existencia_almacen.cantidad_existente + datosProducto.cantidad_total;
        const cantidad_existente_minima = cantidad_existente * 1000;

        productos_almacen_inventario = {
          cantidad_existente,
          cantidad_existente_minima,
          "producto.precios": precios,
        };
      }

      break;
  }
  return { actualizar, productos_almacen_inventario };
}

async function crearCompraEnEspera(input, empresa, sucursal, usuario) {
  try {
    //obtener datos
    const {
      proveedor,
      productos,
      almacen,
      en_espera,
      compra_credito,
      fecha_vencimiento_credito,
      credito_pagado,
      saldo_credito_pendiente,
      subtotal,
      impuestos,
      total,
      fecha_registro,
    } = input;
    //Verificamos los filtros del producto (Que todos los campos esten completos)
    if (
      !proveedor.id_proveedor ||
      !almacen.id_almacen ||
      !productos ||
      !subtotal ||
      !impuestos ||
      !total ||
      !fecha_registro
    )
      throw new Error("Datos incompletos.");

    //genramos la instancia de compra
    const nuevaCompraEnEsperaBase = new ComprasEnEsperaModel({
      proveedor,
      almacen,
      productos,
      en_espera,
      compra_credito,
      fecha_vencimiento_credito: moment(fecha_vencimiento_credito).locale('es-mx').format("YYYY-MM-DD"),
      credito_pagado,
      saldo_credito_pendiente,
      subtotal,
      impuestos,
      total,
      empresa: empresa,
      sucursal: sucursal,
      usuario: usuario,
      year_registro: moment().locale("es-mx").year(),
      numero_semana_year: moment().locale("es-mx").week(),
      numero_mes_year: moment().locale("es-mx").month(),
      fecha_registro: moment().locale("es-mx").locale('es-mx').format(),
    });
    await nuevaCompraEnEsperaBase.save();
    return {
      message: "Compra en espera realizada.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function obtenerConsultaGeneralCompras(empresa, sucursal) {
  try {
    /* const productos = await obtenerProductos(empresa, sucursal, "", almacen); */
    const almacenes = await AlmacenModel.find().where({
      id_sucursal: sucursal,
    });

    const proveedores = await Clientes.find().where({
      empresa,
      sucursal,
      tipo_cliente: "PROVEEDOR",
      eliminado: false,
    });

    return {
      /* productos, */
      almacenes,
      proveedores,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function obtenerComprasRealizadas(empresa, sucursal, filtro, fecha, limit = 0, offset = 0) {
  try {
    let page = Math.max(0, offset);
    let filtro_match = {};
    const fechaActual = moment().locale("es-mx").format();
    const fechaInicial = fecha;

    if (filtro && fecha) {
      filtro_match = {
        $match: {
          $or: [
            {
              "almacen.nombre_almacen": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.nombre_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.numero_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.clave_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
          ],
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            { sucursal: mongoose.Types.ObjectId(sucursal) },
            {
              fecha_registro: {
                $gte: fechaInicial,
                $lte: fechaActual,
              },
            },
          ],
        },
      };
    } else if (filtro && !fecha) {
      filtro_match = {
        $match: {
          $or: [
            {
              "almacen.nombre_almacen": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.nombre_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.numero_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.clave_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
          ],
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            { sucursal: mongoose.Types.ObjectId(sucursal) },
          ],
        },
      };
    } else if (!filtro && fecha) {
      filtro_match = {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          sucursal: mongoose.Types.ObjectId(sucursal),
          fecha_registro: {
            $gte: fechaInicial,
            $lte: fechaActual,
          },
        },
      };
    } else if (!filtro && !fecha) {
      filtro_match = {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          sucursal: mongoose.Types.ObjectId(sucursal),
        },
      };
    }

    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }

    //Hacer la consulta de las tallas a la base de datos.
    const compras_realizadas = await ComprasModel.aggregate([
      filtro_match,
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "productosmovimientos",
          let: {
            id: "$_id",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            concepto: "compras",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id_compra", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$concepto", "$$concepto"] },
                  ],
                },
              },
            },
          ],
          as: "productos",
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
          from: "almacens",
          localField: "almacen.id_almacen",
          foreignField: "_id",
          as: "almacen.id_almacen",
        },
      },
      {
        $lookup: {
          from: "clientes",
          localField: "proveedor.id_proveedor",
          foreignField: "_id",
          as: "proveedor.id_proveedor",
        },
      },
      {
        $lookup: {
          from: "empresas",
          localField: "empresa",
          foreignField: "_id",
          as: "empresa",
        },
      },
      {
        $lookup: {
          from: "sucursals",
          localField: "sucursal",
          foreignField: "_id",
          as: "sucursal",
        },
      },
      {$unwind: { path: "$usuario" }},
      {$unwind: { path: "$almacen.id_almacen" }},
      {$unwind: { path: "$proveedor.id_proveedor" }},
      {$unwind: { path: "$empresa" }},
      {$unwind: { path: "$sucursal" }},
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
    /* const datos_populate = await ComprasModel.populate(compras_realizadas, {
      path:
        "usuario almacen.id_almacen proveedor.id_proveedor empresa sucursal",
    }); */

    let arrayToSet = [];
    const ahora = moment();
    let estatus_credito = "";
    
    if (compras_realizadas[0].docs.length > 0) {
      compras_realizadas[0].docs.forEach((element) => {
        
        if (element.saldo_credito_pendiente > 0) {
          
          if (ahora.isAfter(element.fecha_vencimiento_credito)) {
            estatus_credito = "VENCIDA";
          } else {
            estatus_credito = "POR VENCER";
          }
        }else{
          estatus_credito = 'PAGADA';
        }

        arrayToSet.push({ ...element, estatus_credito: estatus_credito });
      });
    }

    //return arrayToSet;
    return arrayToSet.length
      ? { docs: arrayToSet, totalDocs: compras_realizadas[0].totalDocs[0].count }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function obtenerComprasEnEspera(empresa, sucursal, filtro, limit = 0, offset = 0) {
  try {
    let page = Math.max(0, offset);
    let filtro_match = {};

    if (filtro) {
      filtro_match = {
        $match: {
          $or: [
            {
              "almacen.nombre_almacen": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.nombre_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.numero_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "proveedor.clave_cliente": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
          ],
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            { sucursal: mongoose.Types.ObjectId(sucursal) },
          ],
        },
      };
    } else {
      filtro_match = {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          sucursal: mongoose.Types.ObjectId(sucursal),
        },
      };
    }

    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }

    //Hacer la consulta de las tallas a la base de datos.
    const compras_espera = await ComprasEnEsperaModel.aggregate([
      filtro_match,
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
    //return compras_espera;
    return compras_espera[0].docs.length
      ? { docs: compras_espera[0].docs, totalDocs: compras_espera[0].totalDocs[0].count }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function eliminarCompraEnEspera(id) {
  try {
    const exist = await ComprasEnEsperaModel.findById(id);
    if (exist) {
      await ComprasEnEsperaModel.findByIdAndDelete(id);
      return {
        message: "Compra en espera eliminada",
      };
    } else {
      return {
        message: "Esta compra no existe",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: error,
    };
  }
}

async function cancelarCompra(empresa, sucursal, id_compra, data_sesion) {
  try {
    //obtener si es admin, su sesion y si tiene turno en caja
    const { admin, sesion, turno } = data_sesion;

    const compra = await ComprasModel.findById(id_compra);

    //declarar las variables de control para realizar acciones en BD al finalizar
    let newHistorial = "";

    if (turno) {
      //realizar un historial caja
      newHistorial = crearNuevoHistorial(
        turno,
        compra.total,
        empresa,
        sucursal,
        false,
        id_compra
      );
    } else if (admin) {
      //obtener la caja principal
      const cajaPrincipal = await CajasModel.findOne({
        empresa,
        sucursal,
        principal: true,
      });
      //realizar un historial caja
      const datosTurno = {
        numero_caja: cajaPrincipal.numero_caja,
        id_caja: cajaPrincipal._id,
        id_User: sesion.id_usuario,
        numero_usuario_creador: sesion.numero_usuario,
        nombre_usuario_creador: sesion.nombre_usuario,
        horario_turno: "",
      };

      newHistorial = crearNuevoHistorial(
        datosTurno,
        compra.total,
        empresa,
        sucursal,
        true,
        id_compra
      );
    } else {
      throw new Error(
        "No tiene autorización o necesita abrir un turno para realizar esta operación"
      );
    }
    //revisar si tiene abonos, cancelarlos y crear un nuevo historial de cancelacion de compra
    const abonos = await AbonosModel.find({ id_compra });
    if (abonos.length > 0) {
      await AbonosModel.updateMany({id_compra}, {status: "CANCELADO"});
    }
    //crear historial
    await crearHistorialCaja(newHistorial, empresa, sucursal);
    //cancelar state de compra
    await ComprasModel.findByIdAndUpdate(id_compra, {status: "CANCELADO"});

    return {
      message: "Compra cancela",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = {
  crearCompra,
  crearCompraEnEspera,
  obtenerConsultaGeneralCompras,
  obtenerComprasRealizadas,
  obtenerComprasEnEspera,
  eliminarCompraEnEspera,
  cancelarCompra,
};
