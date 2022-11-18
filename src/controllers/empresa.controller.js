const EmpresaCtrl = {};
const EmpresaModel = require("../models/Empresa");
const SucursalModel = require("../models/Sucursal");
const AlmacenModel = require("../models/Almacen");
const Usuarios = require("../models/Usuarios");
const CajasModel = require("../models/Cajas");
const bcryptjs = require("bcryptjs");
const { createToken } = require("../middleware/token");
const { awsUploadImage, eliminarUnaImagen } = require("../middleware/aws_uploads");
const { toUpperConvert } = require("../middleware/reuser");

const accesos = {
	compras:{
		abrir_compra:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		compras_realizadas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		compras_espera:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	tesoreria:{
		cuentas_empresa:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		egresos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		abonos_proveedores:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		abonos_clientes:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		caja_principal: {
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	reportes:{
		reporte_historial_cajas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		reporte_turnos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		reporte_compras:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		reporte_ventas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		rerporte_almacen:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		reporte_corte_caja:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		reporte_tesoreria:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	ventas:{
		cancelar_venta:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		precios_productos: {
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		pre_corte:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		cotizaciones:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		administrador:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		eliminar_ventas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		producto_rapido:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	almacenes:{
		almacen:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		traspasos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		inventario_almacen:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	mi_empresa:{
		datos_empresa: {
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		informacion_fiscal: {
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	catalogos:{
		clientes:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		productos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		tallas_numeros:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		contabilidad:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		provedores:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		cajas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		usuarios:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		departamentos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		categorias:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		colores:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		marcas:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		centro_costos:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		conceptos_almacen:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	},
	facturacion:{
		generar_cdfi:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		cdfi_realizados:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		},
		registro_series_cdfi:{
			ver: true,
			agregar: true,
			editar: true,
			eliminar: true
		}
	}
}

async function loginEmpresa() {
  try {
    const { correo_empresa, password } = input;
    const empresaBase = await EmpresaModel.findOne({
      correo_empresa: correo_empresa.toLowerCase(),
    });
    if (!empresaBase)
      throw new Error("Error el email o contrasena son incorrectos.");
    const passwordSucess = await bcryptjs.compare(
      password,
      empresaBase.password
    );
    if (!passwordSucess)
      throw new Error("Error el email o contrasena son incorrectos.");
    return { token: createToken(empresaBase, "48h") };
  } catch (error) {
    console.log(error);
    return error;
  }
}

const genNumeroUser = () => {
    const max = 999999;
    const min = 100000;
    const numero_cliente = Math.floor(
      Math.random() * (max - min + 1) + min
    ).toString();
	return numero_cliente
  };

EmpresaCtrl.crearEmpresa = async (input) => {
  try {
    const {
      nombre_empresa,
      correo_empresa,
      nombre_dueno,
      telefono_dueno,
      password,
      //datos usuario
      usuario,
      sucursal,
    } = input;

    //encriptar password empresa
    const salt_empresa = bcryptjs.genSaltSync(10);
    const passEncrypted = await bcryptjs.hash(password, salt_empresa);
    //crear instancia para crear empresa
    const newEmpresa = new EmpresaModel({
      nombre_empresa,
      correo_empresa: correo_empresa.toLowerCase(),
      nombre_dueno,
      telefono_dueno,
      sucursales_activas: 1,
      limite_sucursales: 3,
      cuenta_empresa: {
        bancario: 0,
        efectivo: 0,
      },
      password: passEncrypted,
    });
    //creamos sucursal
    const newSucursal = new SucursalModel({
      nombre_sucursal: sucursal.nombre_sucursal,
      descripcion: sucursal.descripcion,
      usuario_sucursal: sucursal.usuario_sucursal.toLowerCase(),
      id_empresa: newEmpresa._id,
      direccion: {
        calle: sucursal.calle,
        no_ext: sucursal.no_ext,
        no_int: sucursal.no_int,
        codigo_postal: sucursal.codigo_postal,
        colonia: sucursal.colonia,
        municipio: sucursal.municipio,
        localidad: sucursal.localidad,
        estado: sucursal.estado,
        pais: sucursal.pais,
      },
      cuenta_sucursal: {
        dinero_actual: 0,
      },
    });

	//Crear un nuevo almacen principal
	const newAlmacen = new AlmacenModel({
		nombre_almacen: "PRINCIPAL",
		id_sucursal: newSucursal._id,
		empresa: newEmpresa._id,
		direccion: newSucursal.direccion,
		default_almacen: true,
	});

	//Creamos un usuario
	let user = toUpperConvert(usuario);
	if (user.password !== user.repeatPassword) {
		throw new Error("Las contraseñas no coinciden");
	}
	const salt_user = bcryptjs.genSaltSync(10);
    const pass_user = await bcryptjs.hash(user.password, salt_user);
    user.password = pass_user;
    user.eliminado = false;
	user.accesos = accesos;
    user.empresa = newEmpresa._id;
    user.sucursal = newSucursal._id;
	user.numero_usuario = genNumeroUser();
	const nuevo_usuario = new Usuarios(user);

	//Creamos una caja principal
	const new_caja = new CajasModel({
		numero_caja: 1,
		usuario_creador: nuevo_usuario._id,
		numero_usuario_creador: nuevo_usuario.numero_usuario,
		nombre_usuario_creador: nuevo_usuario.nombre.toLowerCase(),
		activa: false,
		cantidad_efectivo_actual: 0,
		dinero_en_banco: 0,
		principal: true,
		empresa: newEmpresa._id,
		sucursal: newSucursal._id
	});
    
    //Guardar todo en la BD

    await newEmpresa.save();
	await newSucursal.save();
	await newAlmacen.save();
	await nuevo_usuario.save();
	await new_caja.save();

	return {
		message: "Empresa registrada"
	}

  } catch (error) {
    console.log(error);
    return error;
  }
};

EmpresaCtrl.actualizarEmpresa = async (id, input) => {
  try {
    const empresaActualizada = input;
	const empresaBase = await EmpresaModel.findById(id);
	
    if (
      typeof empresaActualizada.imagen !== "string" &&
      empresaActualizada.imagen
    ) {
      const { createReadStream, mimetype } = await empresaActualizada.imagen;
      const extension = mimetype.split("/")[1];
      const imageName = `empresas/${Date.now().toString()}.${extension}`;
      const fileData = createReadStream();
      //console.log(fileData, imageName)
      const result = await awsUploadImage(fileData, imageName);
      empresaActualizada.imagen = result;
    }else{
		//no hay imagen
		if(empresaBase.imagen){
		  //eliminar de aws y de la bd
		  //obtener la key
		  const keyAws = empresaBase.imagen.split(".com/")[1];
		  await eliminarUnaImagen(keyAws);//elimnar de aws
		}
	  }
    const result = await EmpresaModel.findByIdAndUpdate(id, empresaActualizada);

    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

EmpresaCtrl.obtenerEmpresa = async (id) => {
  try {
    const empresa = await EmpresaModel.findById(id);
    return empresa;
  } catch (error) {
    console.log("ObtenerEmpresa", error);
    return error;
  }
};

EmpresaCtrl.otherFunctionEmpresa = async (id) => {
  try {
    console.log(id);
    const empresa = await EmpresaModel.findById(id);
    return empresa;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = EmpresaCtrl;
