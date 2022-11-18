const notasCreditoCtrl = {};
const AlmacenesModel = require("../models/Almacen");
const NotaCreditoNodel = require("../models/NotasCredito");
const ClienteModel = require("../models/Clientes");
const ProductoMovimientoModel = require("../models/ProductoMovimiento");
const moment = require("moment");
const HistorialCajaModel = require("../models/HistorialCajas");
const ProductoAlmacenModel = require("../models/Productos_almacen");
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const { crearNotaCredito } = require("./facturacion.controller");

notasCreditoCtrl.crearNotaCredito = async (input, empresa, sucursal, turno) => {
  try {
    let venta = { ...input };
    let querieUnidades = [];
    let querieProAlmacens = [];
    let querieHistorial = null;
    let querieCliente = [];
    //restar inventarios
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

    //sacar productos que no fueron devueltos
    const productos = venta.productos.filter(
      (prod) => prod.cantidad_venta < prod.cantidad_venta_original
    );
    //recorrer productos
    for (let i = 0; i < productos.length; i++) {
      const datosProducto = productos[i];
      //si son MEDIDAS actualizar las unidades
      let unidad_medida = {};
      if (datosProducto.id_unidad_venta.concepto === "medidas") {
        const cantidad_regresada = datosProducto.cantidad_regresada;
        const { cantidad } = datosProducto.id_unidad_venta;
        unidad_medida = {
          cantidad_nueva: 0,
          cantidad: cantidad + cantidad_regresada,
          almacen: almacen_principal._id,
          existencia: true,
        };
        let unidadUpdated = UnidadVentaModel.findByIdAndUpdate(
          datosProducto.id_unidad_venta._id,
          unidad_medida
        );
        querieUnidades.push(unidadUpdated);
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
        producto_existente
      );

      let prodAlmUpdated = ProductoAlmacenModel.findByIdAndUpdate(
        producto_existente.length > 0 ? producto_existente[0]._id : "",
        productos_almacen
      );
      querieProAlmacens.push(prodAlmUpdated);
    }
    //devolver dinero
    //si no es cliente hacer un retiro de caja o es cliente y quiere en efectivo
    if (venta.cliente === null || venta.devolucion_en === "monto_efectivo") {
      querieHistorial = HistorialCajaModel({
        id_movimiento: venta.venta,
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
            monto: venta.cambio * -1,
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
      })
    } else if (venta.cliente && venta.devolucion_en === "monto_monedero") {
      //si es cliente
      //si es monedero solo sumarselo al cliente
      const cliente = await ClienteModel.findById(venta.cliente._id);
      const monedero_electronico = cliente.monedero_electronico + venta.cambio;
      querieCliente = ClienteModel.findByIdAndUpdate(cliente._id, {monedero_electronico});
    }
    //crear la nota de credito
    const newNotaCredito = new NotaCreditoNodel({
      descuento: venta.descuento,
      ieps: venta.ieps,
      impuestos: venta.impuestos,
      iva: venta.iva,
      subTotal: venta.subTotal,
      total: venta.total,
      observaciones: venta.observaciones,
      cambio: venta.cambio,
      generar_cfdi: venta.generar_cfdi,
      id_factura: null,
      venta: venta.venta,
      productos: productos,
      empresa,
      sucursal,
      usuario: turno.usuario_en_turno._id,
      cliente: venta.cliente,
      payment_form: venta.payment_form,
      payment_method: venta.payment_method,
      year_registro: moment().year(),
      numero_semana_year: moment().week(),
      numero_mes_year: moment().month(),
      fecha_registro: moment().locale("es-mx").format(),
    });

    //actualizar productomovimientos de la venta

    let productoMov = [];
    productos.forEach(async (res) => {
      const updateProdMov = ProductoMovimientoModel.updateOne(
        {
          id_producto: res.id_producto._id,
          concepto: "ventas",
          id_venta: venta.venta,
        },
        {
          nota_credito: {
            id_nota_credito: newNotaCredito._id,
            cantidad_devuelta: res.cantidad_regresada,
            cantidad_vendida: res.cantidad_venta,
            total: res.total_total_producto,
          },
        }
      );
      productoMov.push(updateProdMov);
    });

    //si la venta fue facturada, crear factura de nota de credito
    if (venta.generar_cfdi) {
      //codigo facturama
      let input = {
        id_venta: venta.venta,
        nota_credito: newNotaCredito,
        folio_venta: venta.folio,
        empresa,
        sucursal
      }
      const result = await crearNotaCredito(input);
      //console.log({success: result.success, message: result.message, id_factura: result.id_factura})
      if(!result.success) throw new Error("Error al realizar cfdi");
      newNotaCredito.id_factura = result.id_factura
    }

    // realizar las consultas
    await Promise.all([
      ...querieUnidades,
      ...querieProAlmacens,
      ...productoMov,
    ]);

    if(querieHistorial) await querieHistorial.save();
    if(querieCliente) await querieCliente;
    await newNotaCredito.save();

    return { message: "Nota de crédito realizada" };
  } catch (error) {
    console.log(error);
    return error
  }
};

async function agregarAlmacen(datosProducto, existencia_almacen) {
  const { precios } = datosProducto.id_producto;
  let existencia = 0;
  let cantidad_actual = 0;
  let cantidad_existente = 0;
  let cantidad_existente_maxima = 0;
  let cantidad_existente_minima = 0;

  switch (datosProducto.unidad) {
    case "Pz":
      return {
        cantidad_existente:
          existencia_almacen[0].cantidad_existente +
          datosProducto.cantidad_regresada,
      };
    case "Caja":
      existencia = existencia_almacen[0];
      cantidad_actual =
        datosProducto.cantidad_regresada * precios.unidad_de_compra.cantidad;
      cantidad_existente = cantidad_actual + existencia.cantidad_existente;
      cantidad_existente_maxima =
        cantidad_existente / precios.unidad_de_compra.cantidad;

      return {
        cantidad_existente,
        cantidad_existente_maxima,
      };
    case "Kg":
      existencia = existencia_almacen[0];
      cantidad_existente =
        existencia.cantidad_existente + datosProducto.cantidad_regresada;
      cantidad_existente_minima = cantidad_existente * 1000;
      return {
        cantidad_existente,
        cantidad_existente_minima,
      };
    case "Costal":
      existencia = existencia_almacen[0];
      cantidad_actual =
        datosProducto.cantidad_regresada * precios.unidad_de_compra.cantidad;
      cantidad_existente = cantidad_actual + existencia.cantidad_existente;
      cantidad_existente_maxima =
        cantidad_existente / precios.unidad_de_compra.cantidad;
      cantidad_existente_minima = cantidad_existente * 1000;

      return {
        cantidad_existente,
        cantidad_existente_minima,
        cantidad_existente_maxima,
      };
    default:
      existencia = existencia_almacen[0];
      cantidad_existente =
        existencia.cantidad_existente + datosProducto.cantidad_regresada;
      cantidad_existente_minima = cantidad_existente * 1000;
      return {
        cantidad_existente,
        cantidad_existente_minima,
      };
  }
}

module.exports = notasCreditoCtrl;
