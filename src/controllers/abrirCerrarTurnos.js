const AbrirCerrarTurnoCtrl = {};
const AbrirCerrarTurno = require("../models/AbrirCerrarTurnos");
const UsuariosModel = require("../models/Usuarios");
const CajasModel = require("../models/Cajas");
const HistorialCajasModel = require("../models/HistorialCajas");
const moment = require("moment");
const mongoose = require("mongoose");
const { generateCode } = require("../middleware/reuser");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");

// Funcion creada para poder verificar los token de los usuarios al momento de iniciar turno
async function VerificarTokenTurnoUser(codigo) {
  try {
    const verificador = await AbrirCerrarTurno.find({
      token_turno_user: codigo,
    });
    if (verificador.length > 0) {
      return VerificarTokenTurnoUser();
    } else {
      return codigo;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Funcione especial creada para poder tomar en cuneta si la caja que quieren abrir no fue abierta ya en otro lugar
// Poder retornar que elija una nueva caja
async function VerficarCaja(caja, empresa, sucursal) {
  try {
    const filter = {
      empresa: empresa,
      sucursal: sucursal,
      _id: caja,
    };
    const cajaRecibida = await CajasModel.findOne().where(filter);
    // Para asi poder retornar un booleando del estado de la caja
    return cajaRecibida.activa;
  } catch (error) {
    console.log(error);
  }
}

// Crearemos el registro del turno correspondiente
AbrirCerrarTurnoCtrl.crearRegistroDeTurno = async (input, activa) => {
  moment.locale("es");
  try {
    // Anrtes verificamos el uso de la caja a abrir
    const cajaVerficada = await VerficarCaja(
      input.id_caja,
      input.empresa,
      input.sucursal
    );

    let datos = { ...input };

    if (cajaVerficada === true && datos.concepto === "ABRIR TURNO") {
      return null;
    } else {
      // En caso de ser lo contrario comienza con el registro del turno
      // Verificamos el token de turno de usuario
      const tokenTurno = await generateCode(20);
      const tokenTurnoUsuario = await VerificarTokenTurnoUser(tokenTurno);

      // El caso del token ser el correcto
      if (tokenTurnoUsuario) {
        if (datos.concepto === "ABRIR TURNO") {
          datos = { ...datos, token_turno_user: tokenTurnoUsuario };
        }

        // si hay un retiro de caja, haremos primero un historial de retiro
        const usuario = await UsuariosModel.findById({ _id: datos.id_usuario });
        /* if (datos.montoRetiro) {
          const nuevoRetiroHistorial = HistorialCajasModel({
            tipo_movimiento: "RETIRO",
            numero_caja: datos.numero_caja,
            concepto: "",
            rol_movimiento: "CAJA",
            id_Caja: datos.id_caja,
            horario_turno: datos.horario_en_turno,
            id_User: datos.id_usuario,
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
            numero_usuario_creador: usuario.numero_usuario,
            nombre_usuario_creador: usuario.nombre,
            montos_en_caja: {
              ...datos.montos_en_caja,
              monto_efectivo: {
                ...datos.montos_en_caja.monto_efectivo,
                monto: datos.montoRetiro * -1,
              },
            },
            metodo_pago: datos.metodo_pago,
            empresa: datos.empresa,
            sucursal: datos.sucursal,
          });
          await nuevoRetiroHistorial.save();
        } */

        /* function sleep(ms) {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        }
        await sleep(1000); */
        // Crearemos el nuevo registro de turno
        let nuevoRegistroTurno = datos;
        nuevoRegistroTurno.fecha_salida = {
          year: moment().locale("es-mx").format("YYYY"),
          mes: moment().locale("es-mx").format("MM"),
          dia: moment().locale("es-mx").format("DD"),
          no_semana_year: moment().week().toString(),
          no_dia_year: moment().dayOfYear().toString(),
          completa: moment().locale("es-mx").format("YYYY-MM-DD"),
        };
        nuevoRegistroTurno.fecha_movimiento = moment().locale("es-mx").format();
        const nuevoTurno =   new AbrirCerrarTurno(nuevoRegistroTurno);
     
        const turno = await nuevoTurno.save();

        const nuevoRegistroCaja = new HistorialCajasModel({
          id_movimiento: nuevoTurno._id,
          tipo_movimiento: datos.concepto,
          numero_caja: datos.numero_caja,
          concepto: "",
          rol_movimiento: "CAJA",
          id_Caja: datos.id_caja,
          horario_turno: datos.horario_en_turno,
          id_User: datos.id_usuario,
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
          numero_usuario_creador: usuario.numero_usuario,
          nombre_usuario_creador: usuario.nombre,
          montos_en_caja: input.montos_en_caja,
          metodo_pago: datos.metodo_pago,
          empresa: datos.empresa,
          sucursal: datos.sucursal,
        });
        await nuevoRegistroCaja.save();

        // Editaremos los campos correspondientes dentro de los registros como son las cajas
        // para poder cambiar su estado a activa y el del usuario de la misma manera
        let editarCaja = {
          activa: activa,
          usuario_en_caja: (activa) ? datos.id_usuario : null,
        };

        await UsuariosModel.findByIdAndUpdate(
          { _id: datos.id_usuario },
          { turno_en_caja_activo: activa }
        );
        await CajasModel.findByIdAndUpdate(
          { _id: datos.id_caja },
          editarCaja
        );
        
        saveTurnoCloud(
            turno, nuevoRegistroCaja, activa, true);
        return turno;
      } else {
        return [];
      }
    }
  } catch (error) {
    console.log(error);
    return { message: "Ocurrio un problema en el servidor" };
  }
};
AbrirCerrarTurnoCtrl.subirTurnoCloud = async(input, activa, isOnline) =>{
  try {
    
    if(!isOnline) return {message:'No fue posible guardar el turno', done:false}
    const nuevoRegistroCaja = new HistorialCajasModel({
      id_movimiento: input.id_movimiento,
      tipo_movimiento: input.concepto,
      numero_caja: input.numero_caja,
      concepto: "",
      rol_movimiento: "CAJA",
      id_Caja: input.id_caja,
      horario_turno: input.horario_en_turno,
      id_User: input.id_usuario,
      hora_moviento: input.hora_entrada,
      fecha_movimiento: input.fecha_entrada,
      numero_usuario_creador: input.numero_usuario,
      nombre_usuario_creador: input.nombre,
      montos_en_caja: input.montos_en_caja,
      metodo_pago: input.metodo_pago,
      empresa: input.empresa,
      sucursal: input.sucursal,
    });
    let respuesta = saveTurnoCloud(input, nuevoRegistroCaja,activa);
    return{message:'Se guardó correctamente el turno', done:respuesta}
  } catch (error) {
     return{message:'Ocurrió un error al guardar el turno', done:false}
    console.log(error);
  }
}; 

const saveTurnoCloud = async ( turno, historialCaja, activa ) => {
  try {
    
   let respuesta = await CloudFunctions.openTurno(turno, historialCaja, activa);
   
    return respuesta;
  } catch (error) {
    console.log(error);
    return false;

  }
}
// Controlador encargado de realizar los filtros de datos de los usuarios
AbrirCerrarTurnoCtrl.obtenerFiltroTurnos = async (
  input,
  empresa,
  sucursal,
  limit = 20,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    let filter = {
      empresa: empresa,
      sucursal: sucursal,
    };
    // destrucuturar los datos para comenzar a crear el objeto de datos a filtrar
    const {
      horario_en_turno,
      usuario_en_turno,
      fechaInicio,
      fechaFin,
      numero_caja,
    } = input;

    if (horario_en_turno !== "" && horario_en_turno !== undefined) {
      filter = { ...filter, horario_en_turno: horario_en_turno };
    }
    if (numero_caja !== "" && numero_caja !== undefined) {
      filter = { ...filter, numero_caja: numero_caja };
    }

    // condicionamos la query final para poder dar el filter a nuestro modelo de datos
    let query = AbrirCerrarTurno.find(filter)
      .populate("usuario_en_turno")
      .sort({ $natural: -1 })
      .limit(limit)
      .skip(limit * page);

    let totalDocs = AbrirCerrarTurno.find(filter)
      .populate("usuario_en_turno")
      .countDocuments();

    if (fechaInicio !== "" && fechaFin !== "") {
      var final = moment(fechaFin).add(1, "days");
      const fechaFinales = new Date(final);
      const fechaInicial = fechaInicio.concat("T00:00:00.000Z");
      query = AbrirCerrarTurno.find({
        $and: [
          { createdAt: { $gte: new Date(fechaInicial) } },
          { createdAt: { $lte: fechaFinales } },
          {empresa: mongoose.Types.ObjectId(empresa)},
          {sucursal: mongoose.Types.ObjectId(sucursal)}
        ],
      })
        .populate("usuario_en_turno")
        .sort({ $natural: -1 })
        .limit(limit)
        .skip(limit * page);

      totalDocs = AbrirCerrarTurno.find({
        $and: [
          { createdAt: { $gte: new Date(fechaInicial) } },
          { createdAt: { $lte: fechaFinales } },
        ],
      })
        .populate("usuario_en_turno")
        .countDocuments();
    }

    const historialCajas = await query.exec();

    // al momento de trabajar los datos de los usuarios debemos de condicionar con las coincidencias de palabras
    if (usuario_en_turno !== "") {
      const usuariosFilter = historialCajas.filter((usuario) => {
        if (
          usuario.usuario_en_turno.nombre
            .toLowerCase()
            .indexOf(usuario_en_turno.toLowerCase()) > -1 ||
          usuario.usuario_en_turno.email
            .toLowerCase()
            .indexOf(usuario_en_turno.toLowerCase()) > -1 ||
          usuario.usuario_en_turno.numero_usuario
            .toLowerCase()
            .indexOf(usuario_en_turno.toLowerCase()) > -1 ||
          usuario.usuario_en_turno.telefono
            .toLowerCase()
            .indexOf(usuario_en_turno.toLowerCase()) > -1
        ) {
          return usuario;
        }
      });
      return { docs: usuariosFilter, totalDocs };
    } else {
      return { docs: historialCajas, totalDocs };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = AbrirCerrarTurnoCtrl;
