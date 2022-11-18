const SucursalCtrl = {};
const SucursalModel = require("../models/Sucursal");
const HistorialCaja = require("../models/HistorialCajas");
const CajasModel = require("../models/Cajas");
const EmpresaModel = require("../models/Empresa");
const AlmacenModel = require("../models/Almacen");
const { obtenerPreCorteCaja } = require("../controllers/caja.controller");
const moment = require("moment");

const bcryptjs = require("bcryptjs");
const { createToken } = require("../middleware/token");

SucursalCtrl.crearSucursal = async (input, id) => {
  try {
    const {
      nombre_sucursal,
      descripcion = "",
      usuario_sucursal,
      password_sucursal,
      calle,
      no_ext,
      no_int,
      codigo_postal,
      colonia,
      municipio,
      localidad,
      estado,
      pais,
    } = input;
    const empresaBase = await EmpresaModel.findById(id);
    if (empresaBase) {
      if (empresaBase.sucursales_activas < empresaBase.limite_sucursales) {
        const newSucursal = new SucursalModel({
          nombre_sucursal,
          descripcion,
          usuario_sucursal: usuario_sucursal.toLowerCase(),
          id_empresa: id,
          direccion: {
            calle,
            no_ext,
            no_int,
            codigo_postal,
            colonia,
            municipio,
            localidad,
            estado,
            pais,
          },
          cuenta_sucursal: {
            dinero_actual: 0,
          },
        });
        const salt = bcryptjs.genSaltSync(10);
        const encryptPass = await bcryptjs.hash(password_sucursal, salt);
        newSucursal.password_sucursal = encryptPass;
        const savingSucursal = await newSucursal.save();
        const newAlmacen = new AlmacenModel({
          nombre_almacen: "Principal",
          id_sucursal: savingSucursal._id,
          empresa: empresaBase._id,
          direccion: savingSucursal.direccion,
          default_almacen: true,
        });
        //crear caja principal
        const new_caja = new CajasModel({
          numero_caja: 1,
          usuario_creador: null,
          numero_usuario_creador: null,
          nombre_usuario_creador: usuario_sucursal.toLowerCase(),
          activa: false,
          cantidad_efectivo_actual: 0,
          dinero_en_banco: 0,
          principal: true,
          empresa,
          sucursal,
        });

        await newAlmacen.save();
        await new_caja.save();
        const newEmpresa = empresaBase;
        await EmpresaModel.findByIdAndUpdate(empresaBase._id, {
          sucursales_activas: (newEmpresa.sucursales_activas += 1),
        });
        const sucursalCreada = await SucursalModel.findById(
          savingSucursal._id
        ).populate("id_empresa");
        return sucursalCreada;
      } else {
        throw new Error("Limite de sucursales alcanzado.");
      }
    } else {
      throw new Error("Esta empresa no existe.");
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

SucursalCtrl.editarSucursal = async (input, id) => {
  try {
    const cambiosSucursal = input;
    SucursalModel.findByIdAndUpdate(id, cambiosSucursal);
    return { message: "Sucursal editada" };
  } catch (error) {
    console.log(error);
    return error;
  }
};

SucursalCtrl.obtenerSucursalesEmpresa = async (id) => {
  try {
    const sucursalesEmpresa = await SucursalModel.find({
      id_empresa: id,
    }).populate("id_empresa");
    return sucursalesEmpresa;
  } catch (error) {
    console.log(error);
    return error;
  }
};

SucursalCtrl.editarPasswordSucursal = async (input, id) => {
  try {
    const {
      password_actual,
      password_sucursal,
      repeat_password_sucursal,
    } = input;
    const sucursalBase = await SucursalModel.findById(id);
    const passwordSucess = await bcryptjs.compare(
      password_actual,
      sucursalBase.password_sucursal
    );
    if (!passwordSucess) throw new Error("La contrasena actual es incorrecta.");
    if (password_sucursal !== repeat_password_sucursal)
      throw new Error("La contrasenas no coinsiden.");
    const salt = bcryptjs.genSaltSync(10);
    const encryptPass = await bcryptjs.hash(password_sucursal, salt);
    await SucursalModel.findByIdAndUpdate(id, {
      password_sucursal: encryptPass,
    });
    return { message: "Contrasena actualizada." };
  } catch (error) {
    console.log(error);
    return error;
  }
};
SucursalCtrl.obtenerDatosSucursal = async (id) => {
  try {
    const datosSucursal = await SucursalModel.find({ _id: id });

    return datosSucursal;
  } catch (error) {
    console.log(error);
    return error;
  }
};

SucursalCtrl.sesionSucursal = async (input) => {
  try {
    const { usuario_sucursal, password_sucursal } = input;
    const sucursalBase = await SucursalModel.findOne({
      usuario_sucursal: usuario_sucursal.toLowerCase(),
    });
    if (!sucursalBase) throw new Error("Usuario o contrasena incorrectos.");
    const passwordSucess = await bcryptjs.compare(
      password_sucursal,
      sucursalBase.password_sucursal
    );
    if (!passwordSucess) throw new Error("Usuario o contrasena incorrectos.");
    return { token: createToken(sucursalBase, "48h") };
  } catch (error) {
    console.log(error);
    return error;
  }
};

SucursalCtrl.crearMovimientoCuenta = async (input, empresa, sucursal, tipo) => {
  //Generar movimiento, retiro o deposito que afecta la caja principal( de modelo caja) de la sucursal
  //Y afecta la cuenta de la sucursal en el modelo sucursal
  try {
    const SucursalElegida = await SucursalModel.findById(sucursal);
    //const empresaElegida = await EmpresaModel.findById(empresa);

    const filterCajaPrincipal = {
      empresa: empresa,
      sucursal: sucursal,
      principal: true,
    };

    const cajaPrincipal = await CajasModel.findOne().where(filterCajaPrincipal);

    let inputTo = {
      ...input,
      empresa,
      sucursal,
      numero_caja: cajaPrincipal.numero_caja,
      id_Caja: cajaPrincipal._id,
    };

    //IMPORTANTE ponerle el id_movimiento al historial
    const nuevoHistorial = new HistorialCaja(inputTo);

    let dineroEntrante = input.montos_en_caja.monto_efectivo.monto;
    let nuevaCantidad = 0;

    const inputPrecorte = {
      id_caja: cajaPrincipal._id,
      id_usuario: "",
    };

    const dineroEnCaja = await obtenerPreCorteCaja(
      empresa,
      sucursal,
      inputPrecorte,
      true
    );
    console.log(input.tipo_movimiento, dineroEnCaja, dineroEntrante);
    if (input.tipo_movimiento === "CUENTA_RETIRO") {
      if (
        !dineroEnCaja.monto_efectivo_precorte ||
        dineroEnCaja.monto_efectivo_precorte <= dineroEntrante
      ) {
        throw new Error(
          "Lo sentimos el total de efectivo de la caja principal no puede quedar en 0."
        );
      }
    }

    //await CajasModel.findByIdAndUpdate(cajaPrincipal._id, {'cantidad_efectivo_actual': nuevaCantidad});
    //await SucursalModel.findByIdAndUpdate(sucursal, {'cuenta_sucursal.efectivo': nuevaCantidad});
    await nuevoHistorial.save();
    return { message: "Operación realizada con éxito" };

    /*	
		if(tipo === true){
			let dineroEnCaja = empresaElegida.cuenta_empresa.dinero_actual;
			let dineroEntrante =  input.montos_en_caja.monto_efectivo;

			if (input.tipo_movimiento === 'CUENTA-RETIRO') {
				if(dineroEnCaja <= dineroEntrante){
					return {message: "Lo sentimos la caja no puede quedar en ceros"}
				}else{
					let nuevaCantidad = (dineroEnCaja - dineroEntrante);
					await EmpresaModel.findByIdAndUpdate(empresa, {'cuenta_empresa.dinero_actual': nuevaCantidad});

					await nuevoHistorial.save();
					return {message: "Operación realizada con exito"};
				}
			}else if(input.tipo_movimiento === 'CUENTA-DEPOSITO'){
				let nuevaCantidad = (dineroEnCaja + dineroEntrante);
				await EmpresaModel.findByIdAndUpdate(empresa, {'cuenta_empresa.dinero_actual': nuevaCantidad});
				await nuevoHistorial.save();
				return {message: "Operación realizada con exito"};
			};

		}else{
			let dineroEnCaja = SucursalElegida.cuenta_sucursal.dinero_actual;
			let dineroEntrante =  input.montos_en_caja.monto_efectivo;

			if (input.tipo_movimiento === 'CUENTA-RETIRO') {
				if(dineroEnCaja <= dineroEntrante){
					return {message: "Lo sentimos la caja no puede quedar en ceros"}
				}else{
					let nuevaCantidad = (dineroEnCaja - dineroEntrante);
					await SucursalModel.findByIdAndUpdate(sucursal, {'cuenta_sucursal.dinero_actual': nuevaCantidad});
					await nuevoHistorial.save();
					return {message: "Operación realizada con exito"};
				}
			}else if(input.tipo_movimiento === 'CUENTA-DEPOSITO'){
				let nuevaCantidad = (dineroEnCaja + dineroEntrante);
				await SucursalModel.findByIdAndUpdate(sucursal, {'cuenta_sucursal.dinero_actual': nuevaCantidad});
				await nuevoHistorial.save();
				return {message: "Operación realizada con exito"};
			};

		} */
  } catch (error) {
    console.log(error);
    return { message: error };
  }
};

SucursalCtrl.obtenerHistorialCuenta = async (
  empresa,
  sucursal,
  input,
  tipo, limit = 0, offset = 0
) => {
  try {
    let filter = {};
	let page = Math.max(0, offset);
    if (tipo === false) {
      filter = {
        empresa: empresa,
        sucursal: sucursal,
        rol_movimiento: "CAJA_PRINCIPAL",
      };
    }
    let query = [];

    const { usuario, tipo_movimiento, fecha_inicio } = input;

    if (
      tipo_movimiento !== "" &&
      tipo_movimiento !== undefined &&
      tipo_movimiento !== "TODOS"
    ) {
      filter = { ...filter, tipo_movimiento: tipo_movimiento };
    }

    const fechaInicio = moment(fecha_inicio).locale("es-mx").format();
    const fechaFinal = moment().add(1, "days").locale("es-mx").format();

	let totalDocs = 0
    if (input.fecha_inicio !== "") {
      query = HistorialCaja.find({
        "fecha_movimiento.completa": { $gte: fechaInicio, $lte: fechaFinal },
      })
        .where(filter)
        .sort({ $natural: -1 }).limit(limit).skip(limit * page);
		totalDocs = HistorialCaja.find({
			"fecha_movimiento.completa": { $gte: fechaInicio, $lte: fechaFinal },
		  })
			.where(filter).countDocuments();
    } else {
      query = HistorialCaja.find().where(filter).sort({ $natural: -1 }).limit(limit).skip(limit * page);
	  totalDocs = HistorialCaja.find().where(filter).countDocuments();
    }

    const historialCuentas = await query.exec();

    const cajaPrincipal = await CajasModel.findOne({
      empresa,
      sucursal,
      principal: true,
    });

    const inputPrecorte = {
      id_caja: cajaPrincipal._id,
      id_usuario: "",
    };

    const dineroEnCaja = await obtenerPreCorteCaja(
      empresa,
      sucursal,
      inputPrecorte,
      true
    );

    let respReturn = {
      docs: historialCuentas,
	  totalDocs,
      saldo_en_caja: dineroEnCaja.monto_efectivo_precorte,
    };

    return respReturn;
    /* 	if(usuario === '' || usuario === undefined || usuario === null){
            return historialCuentas;
        }else{
            const usuariosFilter = historialCuentas.filter((user) => {
                if (user.nombre_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.numero_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.id_User.toLowerCase().indexOf(usuario.toLowerCase()) > -1 
                ){
                    return user;
                }
            });
            return usuariosFilter;
        }; */
  } catch (error) {
    console.log(error);
  }
};

/* 
Save this code for dashBoardAdmin
SucursalCtrl.obtenerHistorialCuenta = async (empresa, sucursal, input, tipo) =>{
	try {
		let filter = {}

		if ( tipo === false) {
			filter = { 
				empresa: empresa,
				sucursal: sucursal,
				rol_movimiento: 'CUENTA'
			};
		}else{
			filter = { 
				empresa: empresa,
				rol_movimiento: 'CUENTA-EMPRESA'
			};
		}

        let query = [];

        const {usuario, tipo_movimiento, fecha_inicio, fecha_fin} = input;

        if(tipo_movimiento !== '' && tipo_movimiento !== undefined && tipo_movimiento !== "TODOS"){
            filter = {...filter, tipo_movimiento: tipo_movimiento};
        };

        const fechaInicio = moment(fecha_inicio).locale('es-mx').format(); 
        const fechaFinal = moment(fecha_fin).add(1, 'days').locale('es-mx').format(); 

        if(fecha_inicio !== "" && fecha_fin !== ""){
            query = HistorialCaja.find({'fecha_movimiento.completa': {$gte: fechaInicio, $lte: fechaFinal}}).where(filter).sort({$natural:-1});
        }else{
            query = HistorialCaja.find().where(filter).sort({$natural:-1});
        }

        const historialCuentas = await query.exec();

		if(usuario === '' || usuario === undefined || usuario === null){
            return historialCuentas;
        }else{
            const usuariosFilter = historialCuentas.filter((user) => {
                if (user.nombre_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.numero_usuario_creador.toLowerCase().indexOf(usuario.toLowerCase()) > -1 ||
                    user.id_User.toLowerCase().indexOf(usuario.toLowerCase()) > -1 
                ){
                    return user;
                }
            });
            return usuariosFilter;
        };

	} catch (error) {
		console.log(error);
	}
}; */

module.exports = SucursalCtrl;
