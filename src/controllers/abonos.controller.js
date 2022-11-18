const AbonosCtrl = {};
const AbonosModel = require("../models/Abonos");
const UsuariosModel = require("../models/Usuarios");
const ComprasModel = require("../models/Compras");
const VentasModel = require("../models/Ventas");
const CajasModel = require("../models/Cajas");
const ClientesModel = require("../models/Clientes");
const Factura = require("../models/Factura");
const HistorialCaja = require('../models/HistorialCajas');
const Facturacion = require('./facturacion.controller');
const moment = require("moment");
const mongoose = require("mongoose");

// Controlador encargadop de registrar un nuevo abono
AbonosCtrl.crearAbono = async (empresa, sucursal, input) => {
  try {
    // Depende del tipo de rol que introduciremos sera la condicion que entra para poder realizar el abono correspondiente
    const {
      tipo_movimiento,
      monto_total_abonado,
      id_egreso,
      folio_egreso,
      id_compra,
      id_usuario,
      caja_principal

    } = input;
    if(caja_principal){
      const cajaPrincipal = await CajasModel.findOne({
        empresa,
        sucursal,
        principal: true,
      });
      input.id_Caja = cajaPrincipal._id ;
      input.numero_caja = cajaPrincipal.numero_caja;
    }
    if (tipo_movimiento === "ABONO_PROVEEDOR") {
      const compraAAbonar = await ComprasModel.findById({ _id: id_compra });
      
      let nuevoSaldoPendiente =
        compraAAbonar.saldo_credito_pendiente - monto_total_abonado;
      // Condicionar el monto total del abono para saber si este ha quedado en ceros
     
    if (nuevoSaldoPendiente <= 0) {
        let cambio = {
          saldo_credito_pendiente: nuevoSaldoPendiente,
          credito_pagado: true,
        };
        await ComprasModel.findByIdAndUpdate({ _id: id_compra }, cambio);
      } else {
        await ComprasModel.findByIdAndUpdate(
          { _id: id_compra },
          { saldo_credito_pendiente: nuevoSaldoPendiente }
        );
      } 
    }

   const nuevoHistorial = new HistorialCaja({...input, empresa, sucursal});
   
   nuevoHistorial.id_User = id_usuario;
    const nuevoAbono = new AbonosModel({...input, empresa, sucursal});
    nuevoAbono.status = 'REALIZADO';
    await nuevoAbono.save();
    await nuevoHistorial.save();  
    return { message: "Abono realizado con éxito." };
  } catch (error) {
    console.log(error);
  }
};

// Contrtolador encargado de realizar al filtracion de dtos para mostrar en el frente
AbonosCtrl.obtenerHistorialAbonos = async (empresa, sucursal, input) => {
  try {
  
    const {
      id_cliente,
      id_egreso,
      id_compra,
      usuario,
      fecha_fin,
      fecha_inicio,
      rol_movimiento,
    } = input;

    // destructuramos los datos que nos llegan del input para poder manipular de mejor manera
    const fechaInicio = moment(fecha_inicio).locale("es-mx").format();
    const fechaFinal = moment(fecha_fin)
      .add(1, "days")
      .locale("es-mx")
      .format();

    //   comenzamos a crear el filtro por medio de esta variable para poder
    let filtro_and = [ 
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
    ];

    if (fecha_inicio !== "" && fecha_fin !== "") {
      filtro_and.push({
        "fecha_movimiento.completa": {
          $gte: fechaInicio,
          $lte: fechaFinal,
        },
      });
    }
    if (id_compra !== "") {
      filtro_and.push({
        id_compra: mongoose.Types.ObjectId(id_compra),
      });
    }
    if (id_egreso !== "") {
      filtro_and.push({
        id_egreso: mongoose.Types.ObjectId(id_egreso),
      });
    }
    if (id_cliente !== "") {
      filtro_and.push({
        id_cliente: mongoose.Types.ObjectId(id_cliente),
      });
    }
    if (rol_movimiento !== "") {
      filtro_and.push({
        tipo_movimiento: rol_movimiento,
      });
    }

    // En este caso en caso de existir un usuario, el filtro se crea de manera de 
    // coinicidencias que se realizan para poder lanzar coincidencia de cualquier tipo
    if (usuario !== "") {
      let filtro_base_or = [];
      filtro_base_or.push({
        telefono_cliente: {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        nombre_cliente: {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        numero_cliente: {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        email_cliente: {
          $regex: ".*" + usuario + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_base_or,
      });
    }
    // Finalizar el filtro con todas las variables que se mandan por medio del input
    // para finalizar con un agregate y lanzar los datos coincidentes
    const abonos = await AbonosModel.aggregate([
      {
        $match: {
          $and: filtro_and,
        },
      },
    ]);

    return abonos;
  } catch (error) {
    console.log(error);
  }
};

//obtener abonos clientes
AbonosCtrl.obtenerAbonosProveedores = async (empresa, sucursal, filtro, limit = 0, offset = 0) => {
  try {
    let page = Math.max(0, offset);

    let filtro_match = {
      $match: {
        $and: [
          { empresa: mongoose.Types.ObjectId(empresa) },
          { sucursal: mongoose.Types.ObjectId(sucursal) },
          {status: {$ne: null, $ne: "CANCELADO"}},
          {$or: [
            {compra_credito: true}
          ]}
        ],
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
      },
    };

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



AbonosCtrl.historialVentasACredito = async (empresa, sucursal, idCliente,  limit = 0, offset = 0) => {
  try {
    let page = Math.max(0, offset); 
    
    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    } 
      const ventasCredito = await VentasModel.aggregate([
        {
          $match: {
            
            empresa: mongoose.Types.ObjectId(empresa),
            sucursal: mongoose.Types.ObjectId(sucursal),
            venta_cliente: true,
            'cliente._id': mongoose.Types.ObjectId(idCliente),
            credito: true, 
            status: 'REALIZADO'

          },
        },
        {
          $lookup: {
            from: "abonos",
  
            let: {
              empresa: `${empresa}`,
              sucursal: `${sucursal}`,
              idCliente: `${idCliente}`,
              id_venta: "$_id",
              status: 'REALIZADO'
            
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$tipo_movimiento",  "ABONO_CLIENTE" ] },
                      { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                      { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                      { $eq: ["$id_cliente", { $toObjectId: "$$idCliente" }] },
                      { $eq: ["$id_venta", { $toObjectId: "$$id_venta" }] },
                    ],
                  },
                },
              },
              
            ],
            as: "abonos",
          },
        },
        {
          $lookup: {
            from: "productosmovimientos",
  
            let: {
              id_venta: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$concepto",  "ventas" ] },
                 
                      { $eq: ["$id_venta", { $toObjectId: "$$id_venta" }] },
                    
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
            from: "facturas",
  
            let: {
              folio: "$folio",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$folio_venta",  "$$folio"] },
                    
                    ],
                  },
                },
              },
              
            ],
            as: "facturacion",
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
    
      let arrayToSet = [];
      const ahora = moment().locale("es-mx");
      let estatus_credito = '';
      if(ventasCredito[0].docs.length > 0){
        ventasCredito[0].docs.forEach(element => {
          
          if(element.saldo_credito_pendiente > 0){
            if (ahora.isAfter(moment(element.fecha_de_vencimiento_credito))) {
              
              estatus_credito= 'VENCIDA'
            } else {
              
              estatus_credito= 'POR VENCER';
            }
          }else{
            estatus_credito = 'PAGADA';
          }
        
        if(element.facturacion.length > 0){
            element.facturacion = true; 
          }else{
            element.facturacion = false; 
        } 
          arrayToSet.push({ ...element, estatus_credito: estatus_credito});
        });
       
      }
     
  
      return arrayToSet.length > 0
        ? { docs: arrayToSet, totalDocs: ventasCredito[0].totalDocs[0].count }
        : { docs: [], totalDocs: 0 };
   
  } catch (error) {
    console.log(error)
  }
};

AbonosCtrl.crearAbonoVentaCredito = async (empresa, sucursal, input) => {
  try {
    // Depende del tipo de rol que introduciremos sera la condicion que entra para poder realizar el abono correspondiente

    const {
      ventas,
      id_cliente,
      credito_disponible,
      liquidar,
      facturacion,
      id_usuario,
      caja_principal,
    } = input;

   let documentsFactura = {pdf:'', xml:''};
   await Promise.all(ventas.map( async (venta) => {
       
       
        if(caja_principal){
          const cajaPrincipal = await CajasModel.findOne({
            empresa,
            sucursal,
            principal: true,
          });
          input.id_Caja = cajaPrincipal._id ;
          input.numero_caja = cajaPrincipal.numero_caja;
        }

        const ventaAAbonar = await VentasModel.findById({ _id: venta.id_venta });
        let facturacion = await Factura.find({ id_venta: venta.id_venta });

        let PartialityNumber = 0;
        const complementos = facturacion.filter(factura => factura.tipo === "COMPLEMENTO");

        PartialityNumber = complementos.length + 1;
      
        const monto = (liquidar) ? parseFloat(ventaAAbonar.saldo_credito_pendiente): parseFloat(venta.monto_total_abonado)
       
        const montos_en_caja =  {   
          monto_efectivo: {
              monto: input.metodo_de_pago.clave === '01' ? monto : 0,
              metodo_pago: "01"
          },
          monto_tarjeta_debito: {
              monto: input.metodo_de_pago.clave === '28' ? monto : 0,
              metodo_pago: "28"
          },
          monto_tarjeta_credito: {
              monto: input.metodo_de_pago.clave === '04' ? monto : 0,
              metodo_pago: "04"
          },
          monto_creditos: {
              monto: input.metodo_de_pago.clave === '99' ? monto : 0,
              metodo_pago: "99"
          },
          monto_monedero: {
              monto: input.metodo_de_pago.clave === '05' ? monto : 0,
              metodo_pago: "05"
          },
          monto_transferencia: {
              monto: input.metodo_de_pago.clave === '03' ? monto : 0,
              metodo_pago: "03"
          },
          monto_cheques: {
              monto: input.metodo_de_pago.clave === '02' ? monto : 0,
              metodo_pago: "02"
          },
          monto_vales_despensa: {
              monto: input.metodo_de_pago.clave === '08' ? monto : 0,
              metodo_pago: "08"
          },
      };
      let factura = {pdf:'', xml:''};
         if(ventaAAbonar.saldo_credito_pendiente > 0) {
          let nuevoSaldoPendiente = (liquidar) ? 0 : ventaAAbonar.saldo_credito_pendiente - venta.monto_total_abonado;
          // Condicionar el monto total del abono para saber si este ha quedado en ceros
          let sumaDeuda =  (liquidar) ? credito_disponible + ventaAAbonar.saldo_credito_pendiente : credito_disponible + venta.monto_total_abonado;
         
          //Verifica si tuvo facturación esta venta
          if(facturacion.length > 0){
          
            documentsFactura = await facturar(
              {empresa, sucursal,
                id_venta:  venta.id_venta, 
                PartialityNumber,
                amount: monto, //monto a abonar
                previousBalanceAmount: ventaAAbonar.saldo_credito_pendiente, //monto que debia antes de abono
                amountPaid: monto,// monto que esta abonando
                ImpSaldoInsoluto: ventaAAbonar.saldo_credito_pendiente - monto// lo que le resta por pagar
              }
            );
           
          }

         if (nuevoSaldoPendiente <= 0) {
            let cambio = {
              saldo_credito_pendiente: nuevoSaldoPendiente,
              credito_pagado: true,
            };
           
            await VentasModel.findByIdAndUpdate({ _id: venta.id_venta }, cambio);
            await ClientesModel.findByIdAndUpdate({_id: id_cliente}, {credito_disponible: sumaDeuda })
          } else {
            await VentasModel.findByIdAndUpdate(
              { _id: venta.id_venta },
              { saldo_credito_pendiente: nuevoSaldoPendiente }
            );
              await ClientesModel.findByIdAndUpdate({_id: id_cliente}, {credito_disponible: sumaDeuda })
          }
          
          const nuevoHistorial = new HistorialCaja({...input, empresa, sucursal});
          nuevoHistorial.montos_en_caja = montos_en_caja;
          nuevoHistorial.id_User = id_usuario;
          
          const nuevoAbono = new AbonosModel({...input, folio_venta: ventaAAbonar.folio, id_venta: venta.id_venta, 
            monto_total_abonado: (liquidar) ? ventaAAbonar.saldo_credito_pendiente: venta.monto_total_abonado});
          nuevoAbono.montos_en_caja = montos_en_caja;
          nuevoAbono.status = 'REALIZADO';
          nuevoAbono.empresa = empresa;
          nuevoAbono.sucursal = sucursal; 

        await nuevoHistorial.save();
          await nuevoAbono.save();  
        } 
       
      })); 
   
   
      return{ message:'Abono realizado.', xml:documentsFactura.xml, pdf: documentsFactura.pdf, success:true};
     
    
  } catch (error) {
    console.log("crear abono cliente",error);
    throw new Error('Error al realizar el abono');
  }
};

async function facturar({empresa, sucursal, PartialityNumber, id_venta, amount, previousBalanceAmount, amountPaid, ImpSaldoInsoluto}) {
  try {
 
    let respuesta =  await Facturacion.crearComplementoPago({empresa, sucursal,
      PartialityNumber,
      id_venta:  id_venta, 
      amount: amount, 
      previousBalanceAmount: previousBalanceAmount, 
      amountPaid: amountPaid,
      ImpSaldoInsoluto
    });

    return respuesta;
  } catch (error) {
    throw new Error(error);
  }
  
}


AbonosCtrl.cancelarAbonoProveedor = async( empresa, sucursal, input) =>{
  try {
   
    const {id_compra, id_cliente, id_abono, id_caja,monto_abono, numero_caja, horario_en_turno, numero_usuario_creador, id_usuario, nombre_usuario_creador, metodo_de_pago, caja_principal} = input
    
    const montos_en_caja =  {   
        monto_efectivo: {
            monto: metodo_de_pago === '01' ? monto_abono : 0,
            metodo_pago: "01"
        },
        monto_tarjeta_debito: {
            monto: metodo_de_pago === '28' ? monto_abono : 0,
            metodo_pago: "28"
        },
        monto_tarjeta_credito: {
            monto: metodo_de_pago === '04' ? monto_abono : 0,
            metodo_pago: "04"
        },
        monto_creditos: {
            monto: input.metodo_de_pago === '99' ? monto_abono : 0,
            metodo_pago: "99"
        },
        monto_monedero: {
            monto: metodo_de_pago === '05' ? monto_abono : 0,
            metodo_pago: "05"
        },
        monto_transferencia: {
            monto: metodo_de_pago === '03' ? monto_abono : 0,
            metodo_pago: "03"
        },
        monto_cheques: {
            monto: metodo_de_pago === '02' ? monto_abono : 0,
            metodo_pago: "02"
        },
        monto_vales_despensa: {
            monto: metodo_de_pago === '08' ? monto_abono : 0,
            metodo_pago: "08"
        },
    };
    /* const inputToHistorial = {
      tipo_movimiento: "ABONO_PROVEEDOR",
      concepto: "CANCELADO",
      numero_caja: numero_caja,
      id_Caja: id_caja,
      horario_turno: horario_en_turno,
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
        no_semana_year: moment().week().toString(),
        no_dia_year: moment().dayOfYear().toString(),
        completa: moment().locale("es-mx").format(),
      },
      id_User: id_usuario,
      numero_usuario_creador: numero_usuario_creador,
      nombre_usuario_creador: nombre_usuario_creador,
      montos_en_caja: montos_en_caja,
      empresa: mongoose.Types.ObjectId(empresa),
      sucursal: mongoose.Types.ObjectId(sucursal),
    };  */

    if(caja_principal){
      const cajaPrincipal = await CajasModel.findOne({
        empresa,
        sucursal,
        principal: true,
      });
      input.id_Caja = cajaPrincipal._id ;
      input.numero_caja = cajaPrincipal.numero_caja;
    }
      const compraAAbonar = await ComprasModel.findById({ _id: id_compra });
      
      let nuevoSaldoPendiente =
        compraAAbonar.saldo_credito_pendiente + monto_abono;
    
       
      let cambio = {
        saldo_credito_pendiente: nuevoSaldoPendiente,
        credito_pagado: false,
      };  

      const nuevoHistorial = new HistorialCaja({...input, empresa, sucursal});
      nuevoHistorial.montos_en_caja = montos_en_caja;


      await ComprasModel.findByIdAndUpdate({ _id: id_compra }, cambio);

      await AbonosModel.findByIdAndUpdate({ _id:mongoose.Types.ObjectId(id_abono)  }, {status:'CANCELADO'});

    await nuevoHistorial.save();  
    
    return { message: "Listo nuevo abono realizado." };

  } catch (error) {
    console.log(error);
  }
}

AbonosCtrl.cancelarAbonoCliente = async( empresa, sucursal, input) =>{
  try {
    
    const {id_abono, id_cliente, id_venta, id_caja,monto_abono, 
      numero_caja, credito_disponible, horario_en_turno, numero_usuario_creador, 
      id_usuario, nombre_usuario_creador, metodo_de_pago, caja_principal} = input

    //NuevoHistorial
    const ventaAAbonar = await VentasModel.findById({ _id: id_venta });
 
    const montos_en_caja =  {   
      monto_efectivo: {
          monto: metodo_de_pago === '01' ? monto_abono : 0,
          metodo_pago: "01"
      },
      monto_tarjeta_debito: {
          monto: metodo_de_pago === '28' ? monto_abono : 0,
          metodo_pago: "28"
      },
      monto_tarjeta_credito: {
          monto: metodo_de_pago === '04' ? monto_abono : 0,
          metodo_pago: "04"
      },
      monto_creditos: {
          monto: input.metodo_de_pago === '99' ? monto_abono : 0,
          metodo_pago: "99"
      },
      monto_monedero: {
          monto: metodo_de_pago === '05' ? monto_abono : 0,
          metodo_pago: "05"
      },
      monto_transferencia: {
          monto: metodo_de_pago === '03' ? monto_abono : 0,
          metodo_pago: "03"
      },
      monto_cheques: {
          monto: metodo_de_pago === '02' ? monto_abono : 0,
          metodo_pago: "02"
      },
      monto_vales_despensa: {
          monto: metodo_de_pago === '08' ? monto_abono : 0,
          metodo_pago: "08"
      },
  };

  if(caja_principal){
    const cajaPrincipal = await CajasModel.findOne({
      empresa,
      sucursal,
      principal: true,
    });
    input.id_Caja = cajaPrincipal._id ;
    input.numero_caja = cajaPrincipal.numero_caja;
  }
  /* const inputToHistorial = {
    tipo_movimiento: "ABONO_CLIENTE",
    concepto: "CANCELADO",
    numero_caja: numero_caja,
    id_Caja: id_caja,
    horario_turno: horario_en_turno,
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
      no_semana_year: moment().week().toString(),
      no_dia_year: moment().dayOfYear().toString(),
      completa: moment().locale("es-mx").format(),
    },
    id_User: id_usuario,
    numero_usuario_creador: numero_usuario_creador,
    nombre_usuario_creador: nombre_usuario_creador,
    montos_en_caja: montos_en_caja,
    empresa: mongoose.Types.ObjectId(empresa),
    sucursal: mongoose.Types.ObjectId(sucursal),
  };  */

  let nuevoSaldoPendiente =  ventaAAbonar.saldo_credito_pendiente + monto_abono;
  // Condicionar el monto total del abono para saber si este ha quedado en ceros
  let sumaDeuda =  credito_disponible + monto_abono;
  
  let cambio = {
    saldo_credito_pendiente: nuevoSaldoPendiente,
    credito_pagado: false,
  };

   const nuevoHistorial = new HistorialCaja({...input, empresa, sucursal});
    nuevoHistorial.montos_en_caja = montos_en_caja;
    nuevoHistorial.id_User = id_usuario;
    nuevoHistorial.numero_usuario_creador = numero_usuario_creador;
    nuevoHistorial.nombre_usuario_creador = nombre_usuario_creador;
 
    await VentasModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(id_venta)  }, cambio);
    await ClientesModel.findByIdAndUpdate({_id: mongoose.Types.ObjectId(id_cliente)}, {credito_disponible: sumaDeuda })

    //PonerEnEstatusCanceladoElAbono
   
    await AbonosModel.findByIdAndUpdate({ _id:mongoose.Types.ObjectId(id_abono)  }, {status:'CANCELADO'});
   

    await nuevoHistorial.save();  

    return {message: "Abono cancelado."}
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}
module.exports = AbonosCtrl;
