const CajaCtrl = {};
const CajasModel = require("../models/Cajas");
const UsuariosModel = require("../models/Usuarios");
const TurnosModel = require("../models/AbrirCerrarTurnos");
const HistorialCajasModel = require("../models/HistorialCajas");
const moment = require("moment");
const mongoose = require("mongoose");

CajaCtrl.obtenerCajasSucursal = async (empresa, sucursal) => {
  try {
    const cajasSucursal = await CajasModel.find({ empresa, sucursal }).populate(
      "usuario_en_caja usuario_creador"
    );
    return cajasSucursal;
  } catch (error) {
    console.log(error);
    return error;
  }
};

CajaCtrl.crearCaja = async (input, empresa, sucursal) => {
  try {
    const {
      usuario_creador,
      numero_usuario_creador,
      nombre_usuario_creador,
    } = input;
    const cajasSucursal = await CajasModel.find({ empresa, sucursal });
    let ultima_caja = 0;
    if (cajasSucursal.length > 0)
      ultima_caja = cajasSucursal[cajasSucursal.length - 1].numero_caja;
    ultima_caja = parseInt(ultima_caja) + 1;
    const new_caja = new CajasModel({
      numero_caja: ultima_caja,
      usuario_creador: usuario_creador,
      numero_usuario_creador: numero_usuario_creador,
      nombre_usuario_creador: nombre_usuario_creador,
      activa: false,
      cantidad_efectivo_actual: 0,
      dinero_en_banco: 0,
      empresa,
      sucursal,
    });
    await new_caja.save();
    return {
      message: "Caja agregada.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

CajaCtrl.actualizarCaja = async (input, id) => {
  try {
    let editarCaja = {
      activa: input.activa,
      usuario_en_caja: input.usuario_en_caja,
    };
    await UsuariosModel.findByIdAndUpdate(
      { _id: input.usuario_en_caja },
      { turno_en_caja_activo: input.turno_en_caja_activo }
    );
    await CajasModel.findByIdAndUpdate(id, editarCaja);
    const cajaEditada = await CajasModel.findById({ _id: id });
    return cajaEditada;
  } catch (error) {
    console.log(error);
    return error;
  }
};

CajaCtrl.eliminarCaja = async (id) => {
  try {
    const caja = await CajasModel.findById(id);
    console.log(caja);
    if (caja.activa) {
      throw new Error("No se pueden eliminar cajas ACTIVAS.");
    }
    await CajasModel.findByIdAndDelete({ _id: id });
    return {
      message: "Caja eliminada",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

// Controlador para poder obtenerr los datos de precorte de cajas dentro del sistema
CajaCtrl.obtenerPreCorteCaja = async (
  empresa,
  sucursal,
  input,
  cajaPrincipal
) => {
  try {
    const fechaActual = moment().locale("es-mx").format();
    /* console.log(input.id_caja) */

    // Haremos una query con el agregate que sera nuestro fiultro en el cual extraeremos
    // y agruparemos todos los montos en efectivo de nuestros registros dentro del modelo de
    // historial de cajas

    //filtro para traer solo el efectivo del turno o todo lo que hay

    let and_filter = [
      {
        rol_movimiento:
          !cajaPrincipal || cajaPrincipal === false ? "CAJA" : "CAJA_PRINCIPAL",
      },
      { id_Caja: mongoose.Types.ObjectId(input.id_caja) },
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
    ];

    if (!cajaPrincipal || cajaPrincipal === false) {
      const ultimoTurno = await TurnosModel.findOne({
        empresa: empresa,
        sucursal: sucursal,
        id_usuario: input.id_usuario,
        token_turno_user: input.token_turno_user,
      });
      const fechaInicio = ultimoTurno.fecha_movimiento;

      // Tomamos de referencia el ultimo turno abierto con los datos enviados
      and_filter.push(
        {
          "fecha_movimiento.completa": { $gte: fechaInicio, $lte: fechaActual },
        },
        { id_User: mongoose.Types.ObjectId(input.id_usuario) }
      );
    }

    const query = await HistorialCajasModel.aggregate([
      {
        $match: {
          $and: and_filter,
        },
      },
      {
        $group: {
          _id: null,
          monto_efectivo_precorte: {
            $sum: "$montos_en_caja.monto_efectivo.monto",
          },
        },
      },
    ]);
    // Para poder extrar el objeto con el monto en efectivo
    const monto_efectivo_precorte = query[0].monto_efectivo_precorte;

    // Retornamos el monto total
    return { monto_efectivo_precorte };
  } catch (error) {
    return {
      message: "Ocurrio un error al realizar precorte",
    };
  }
};

// Controlador adecuado para poder extraer los cortes de caja por medio del filtro
CajaCtrl.obtenerCortesDeCaja = async (
  empresa,
  sucursal,
  input,
  limit = 20,
  offset = 0
) => {
  try {
    const { fecha_consulta, usuario, numero_caja } = input;
    let page = Math.max(0, offset);
    // Comenzamos a crear el filtro que sera el encargado de tomar los datos
    let filter = {
      empresa: empresa,
      sucursal: sucursal,
      concepto: "CERRAR TURNO",
    };

    // Comenzamos a contruir nuestro filtro por medio de los datos que tenemos dentro del input
    if (fecha_consulta !== "" && fecha_consulta !== undefined) {
      filter = { ...filter, "fecha_salida.completa": fecha_consulta };
    }

    if (
      numero_caja !== "" &&
      numero_caja !== undefined &&
      numero_caja !== null
    ) {
      filter = { ...filter, numero_caja: numero_caja };
    }
    // Realizamos la query correspondiente para pdoer extraer los datos cone le filtro correspodiente formado
    let query = TurnosModel.find()
      .where(filter)
      .populate("sucursal")
      .sort({ $natural: -1 }).limit(limit).skip(limit * page);
    const turnosCerrados = await query.exec();
    let totalDocs = TurnosModel.find().where(filter).countDocuments();

    // Para poder pasar al ultimo filtro el encargado de poder tomar los datos de usuario, poder filtrar por usuario.
    if (usuario !== "") {
      let totalDocsFilter = 0;
      const usuariosFilter = turnosCerrados.filter((user) => {
        if (
          user.usuario_en_turno.nombre
            .toLowerCase()
            .indexOf(usuario.toLowerCase()) > -1 ||
          user.usuario_en_turno.numero_usuario
            .toLowerCase()
            .indexOf(usuario.toLowerCase()) > -1 ||
          user.usuario_en_turno.email
            .toLowerCase()
            .indexOf(usuario.toLowerCase()) > -1 ||
          user.usuario_en_turno.telefono
            .toLowerCase()
            .indexOf(usuario.toLowerCase()) > -1
        ) {
          totalDocsFilter += 1;
          return user;
        }
      });
      // Si existe campo de usuario filtrara por lo correspodiente para lanzar los datos
      return {docs: usuariosFilter, totalDocs: totalDocsFilter};
    } else {
      // De lo contrario solo dar los datos filtrados con anterioridad
      return {docs: turnosCerrados, totalDocs};
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

// Controlador para poder obtener el corte de caja seleccionado
CajaCtrl.obtenerCorteCaja = async (empresa, sucursal, input) => {
  try {
    const { usuario, caja, token_turno_user, number_user } = input;

    //  Creamos los dos filtros correspondientes para poder tomar desde donde inicia y desde donde termina el corte de caja
    let filterAbrir = {
      empresa: empresa,
      sucursal: sucursal,
      concepto: "ABRIR TURNO",
      id_usuario: usuario,
      id_caja: caja,
      token_turno_user: token_turno_user,
    };

    // Tomamos como referencia principal el hecho de la clave unica que se genera al momento de crear un turno la cual se guarda al
    // abrir y cerrar el turno correspondiente
    let filterCerrar = {
      empresa: empresa,
      sucursal: sucursal,
      concepto: "CERRAR TURNO",
      id_usuario: usuario,
      id_caja: caja,
      token_turno_user: token_turno_user,
    };

    // tomaremos los turnos encontrados dentro de los modelos, ya sea el turno iniciado y el tunro finalizado
    const turnoAbierto = await TurnosModel.findOne(filterAbrir);
    const turnoCerrado = await TurnosModel.findOne(filterCerrar);
    // Por medio de la siguiente query y con el metodo de agregate crearemos el filtro
    // para poder extraer lo correspondiente y agruopar los datos que necesitadoos de todo lo encontrado por medio el metodo
    // match,. agruparemos todos los montos que se encuentran dentro del modelo de historial cajas, del objeto de montos en caja

    const query = await HistorialCajasModel.aggregate([
      {
        $match: {
          $and: [
            {
              "fecha_movimiento.completa": {
                $gte: turnoAbierto.fecha_movimiento,
                $lt: turnoCerrado.fecha_movimiento,
              },
            },
            { rol_movimiento: "CAJA" },
            { empresa: mongoose.Types.ObjectId(empresa) },
            { sucursal: mongoose.Types.ObjectId(sucursal) },
            { id_User: mongoose.Types.ObjectId(usuario) },
            { id_Caja: mongoose.Types.ObjectId(caja) },
          ],
        },
      },
      {
        $group: {
          _id: null,
          monto_efectivo: {
            $sum: "$montos_en_caja.monto_efectivo.monto",
          },
          monto_tarjeta_credito: {
            $sum: "$montos_en_caja.monto_tarjeta_credito.monto",
          },
          monto_tarjeta_debito: {
            $sum: "$montos_en_caja.monto_tarjeta_debito.monto",
          },
          monto_creditos: {
            $sum: "$montos_en_caja.monto_creditos.monto",
          },
          monto_monedero: {
            $sum: "$montos_en_caja.monto_monedero.monto",
          },
          monto_transferencia: {
            $sum: "$montos_en_caja.monto_transferencia.monto",
          },
          monto_cheques: {
            $sum: "$montos_en_caja.monto_cheques.monto",
          },
          monto_vales_despensa: {
            $sum: "$montos_en_caja.monto_vales_despensa.monto",
          },
        },
      },
    ]);
    const montos_en_sistema = query[0];

    return { montos_en_sistema, fecha_inicio: turnoAbierto.fecha_movimiento, fecha_fin: turnoCerrado.fecha_movimiento };
  } catch (error) {
    console.log(error);
    return error;
  }
};

CajaCtrl.obtenerSaldoCajaPrincipal = async (empresa, sucursal, input) => {
  try {
    // Para poder extrar el objeto con el monto en efectivo
    const monto_efectivo_precorte = 0;

    // Retornamos el monto total
    return { monto_efectivo_precorte };
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = CajaCtrl;
