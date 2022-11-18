const HistorialCajaCtrl = {}; 
const HistorialCajas = require("../models/HistorialCajas");
const moment = require('moment');

// Para poder obtener el historial de datos correspondientes
HistorialCajaCtrl.obtenerHistorialCaja = async (input, id_Caja, empresa, sucursal, limit = 20, offset = 0) => {
    try {
        let page = Math.max(0, offset)
        // Iniclaizamos el filtro inicial con los paremetros a filtrar
        let filter = { 
            id_Caja:id_Caja,
            empresa:empresa,
            sucursal: sucursal,
            tipo_movimiento: {$in: ['DEPOSITO', 'RETIRO', 'VENTA', 'TRANSFERENCIA', 'COMPRA', 'CUENTA_DEPOSITO', 'CUENTA_RETIRO','ABONO_CLIENTE','ABONO_PROVEEDOR']}
        };
        let query = [];

        const {usuario, tipo_movimiento, fecha_incio, fecha_fin} = input;

        // Comenzar a contruir el filtro correspondiente con los datos existentes
        if(tipo_movimiento !== '' && tipo_movimiento !== undefined && tipo_movimiento !== "TODOS"){
            filter = {...filter, tipo_movimiento: tipo_movimiento};
        };

        const fechaInicio = moment(fecha_incio).locale('es-mx').format(); 
        const fechaFinal = moment(fecha_fin).add(1, 'days').locale('es-mx').format(); 

        let totalDocs = 0
        if(fecha_incio !== "" && fecha_fin !== ""){
            query =  HistorialCajas.find({'fecha_movimiento.completa': {$gte: fechaInicio, $lte: fechaFinal}}).where(filter).sort({$natural:-1}).limit(limit).skip(limit * page);
            totalDocs =  await HistorialCajas.find({'fecha_movimiento.completa': {$gte: fechaInicio, $lte: fechaFinal}}).where(filter).countDocuments();
        }else{
            query =  HistorialCajas.find().where(filter).sort({$natural:-1}).limit(limit).skip(limit * page);
            totalDocs =  await HistorialCajas.find().where(filter).countDocuments();
        };

        const historialCajas = await query.exec();
        // En caso de existir un usuario, tomarlos para poder filtrarlos
        if(usuario !== ""){
            const usuariosFilter = historialCajas.filter((historial) => {
                if (historial.nombre_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    historial.numero_usuario_creador.indexOf(usuario.toLowerCase()) > -1 ||
                    historial.id_User.toLowerCase().indexOf(usuario.toLowerCase()) > -1 
                ){
                    return historial;
                }
            });
            return {docs: usuariosFilter, totalDocs};
        }else{
            return {docs: historialCajas, totalDocs};
        };

    } catch (error) {
        console.log(error);
		return error;
    }
}

// Crear un nuevo documento dentro del modelo de historial
HistorialCajaCtrl.crearHistorialCaja = async (input, empresa, sucursal) => {
    try {
        // Destructurar algunos de los datos para poder condicionar dentro de ellos
        const { numero_caja, id_User, numero_usuario_creador, empresa, sucursal, tipo_movimiento, montos_en_caja } = input;

        // conndicionar algunos datos obligatorios
        if( !numero_caja || numero_caja === "" && 
            !id_User || id_User === "" && 
            !numero_usuario_creador || numero_usuario_creador === "" && 
            !empresa || empresa === "" && 
            !sucursal || sucursal === ""
        ){
            return ({message: "Lo siento los datos son obligatorios"});
        };

        let datos = {...input};
        // en caso de ser un movimiento de tipo retiro debemos de guardarlos como un datoo negativo para las cuentas
        if(tipo_movimiento === 'RETIRO'){
            datos = {...datos, montos_en_caja: {...datos.montos_en_caja, 'monto_efectivo.monto': (montos_en_caja.monto_efectivo.monto * -1)} }
        };

        datos.hora_moviento = {
            hora: moment().locale("es-mx").format("hh"),
            minutos: moment().locale("es-mx").format("mm"),
            segundos: moment().locale("es-mx").format("ss"),
            completa: moment().locale("es-mx").format("HH:mm:ss"),
          };
          datos.fecha_movimiento = {
            year: moment().locale("es-mx").format("YYYY"),
            mes: moment().locale("es-mx").format("DD"),
            dia: moment().locale("es-mx").format("MM"),
            no_semana_year: moment().week().toString(),
            no_dia_year: moment().dayOfYear().toString(),
            completa: moment().locale("es-mx").format(),
          };

        // Guardar el documento nuevo
        const nuevoHitorial = new HistorialCajas(datos);
        await nuevoHitorial.save();
        return ({message: "Listo nuevo registro realizado."});
        
        // CODIGO DE MI COMPANERO FUJI
        // const { nombre_usuario_creador, tipo_movimiento, cantidad_movimiento, id_Caja, id_User, origen_movimiento, id_caja_destino } = input; 
        // const {cantidad_efectivo_actual} = await CajasModel.findOne({_id: id_Caja});
        // let cantidadEf = 0;
        // if(tipo_movimiento == 'DEPOSITO'){
        //     cantidadEf = cantidad_efectivo_actual + cantidad_movimiento
        // }else{
        //     if(cantidad_efectivo_actual >  cantidad_movimiento ){
        //         cantidadEf  = cantidad_efectivo_actual - cantidad_movimiento
        //     }else{
        //         let err = new Error('Saldo insuficiente en caja.');
        //         err.mensaje = 'Saldo insuficiente en caja.';
        //         throw err;
        //     }
        // }
        // await CajasModel.findByIdAndUpdate({ _id: id_Caja }, {cantidad_efectivo_actual: cantidadEf});
        // if(tipo_movimiento == 'TRANSFERENCIA'){
        //     const cajaDestino = await CajasModel.findOne({_id: id_caja_destino});
        //     cantidadEf = cajaDestino.cantidad_efectivo_actual + cantidad_movimiento;
        //     await CajasModel.findByIdAndUpdate({ _id: id_caja_destino }, {cantidad_efectivo_actual: cantidadEf});
        // }
        // const model = 
        // {
        //     tipo_movimiento: tipo_movimiento,
        //     cantidad_movimiento: cantidad_movimiento,
        //     id_Caja: id_Caja,
        //     id_User: id_User,
        //     nombre_usuario_creador: nombre_usuario_creador,
        //     origen_movimiento: origen_movimiento,
        //     id_caja_destino: (id_caja_destino !== undefined ) ? id_caja_destino : null,
        //     empresa,
        //     sucursal
        // };
        // const new_historial = new HistorialCajas(model);
        // await new_historial.save();
        // CODIGO DE MI COMPANERO FUJI
       
    } catch (error) {
		return error;
    }
};




module.exports = HistorialCajaCtrl