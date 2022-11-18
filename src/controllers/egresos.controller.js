const EgresosCtrl = {};
const EgresosModel = require("../models/Egresos");
const moment = require('moment');


// Controlador encargado para poder crear un registro nuevo de un egreso
EgresosCtrl.crearEgreso = async (input, empresa, sucursal) => {
    try {
        // Inicializamos un nuevo documentos con el modelo correspondiente
        const nuevoEgreso = new EgresosModel(input);

        // Tomaremos los datos correspondientes faltantes a llenar
        nuevoEgreso.empresa = empresa;
        nuevoEgreso.sucursal = sucursal;
        nuevoEgreso.sucursal = sucursal;
        nuevoEgreso.fecha_registro = moment().locale('es-mx').format(); 

        // Buscaremos que no exista ya ese cidigo de folio
        let codigoFolioEgreso = [];
        
		codigoFolioEgreso = await EgresosModel.find().where({folio_egreso: input.folio_egreso, empresa, sucursal });
		if(codigoFolioEgreso.length > 0) throw new Error("Clave alterna registrada");
        
        // Registramos el nuevo documentos dentro del modelo
        await nuevoEgreso.save();
        return ({message: "Listo nuevo registro realizado."});

    } catch (error) {
        console.log(error);
        return error;
    }
}

EgresosCtrl.obtenerHistorialEgresos = async (input, empresa, sucursal) => {
    try {
        // Inicializamos el filtro correspondiente con los datos de base
        let filter = { 
            empresa:empresa,
            sucursal: sucursal,
        };
        // Iniciamos la query
        let query = [];

        // Destructuramos los datos traidos con el input
        const {usuario, tipo_movimiento, fecha_incio, fecha_fin} = input;

        // En este apartado comenzamos a formar el filtro correspondiente con los datos enviados
        // condicionando antes si es que estos datos existen
        if(tipo_movimiento !== '' && tipo_movimiento !== undefined && tipo_movimiento !== null && tipo_movimiento !== "TODOS"){
            filter = {...filter, compra_credito: tipo_movimiento};
        };


        // COnvertirmos las fechas al formato adecuado para poder buscar de la mejor manera
        const fechaInicio = moment(fecha_incio).locale('es-mx').format(); 
        const fechaFinal = moment(fecha_fin).add(1, 'days').locale('es-mx').format(); 

        if(fecha_incio !== "" && fecha_fin !== ""){
            query = EgresosModel.find({'fecha_compra': {$gte: fechaInicio, $lte: fechaFinal}}).where(filter).sort({$natural:-1});
        }else{
            query = EgresosModel.find().where(filter).sort({$natural:-1});
        };

        // Convertimos y extraemos los datos de la query
        const historialEgresos = await query.exec();

        // En caso de existir un usuario dentro del input 
        // crearemos un filtro correspondiente del filtro
        // para retornar los datos correspondientes o de ser lo contrario
        // solo retornar lo extraido con anterioridad
        if(usuario !== ""){
            const usuariosFilter = historialEgresos.filter((user) => {
                if (user.nombre_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.numero_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.id_User.toLowerCase().indexOf(usuario.toLowerCase()) > -1 
                ){
                    return user;
                }
            });
            return usuariosFilter;
        }else{
            return historialEgresos;
        };
    } catch (error) {
        console.log(error);
        return { message: error}
    }
};

module.exports = EgresosCtrl;