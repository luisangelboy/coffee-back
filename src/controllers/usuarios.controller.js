const UsuariosCtrl = {};
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const Usuarios = require("../models/Usuarios");
const Empresa = require("../models/Empresa");
const Sucursal = require("../models/Sucursal");
const UsuariosCloud = require("../modelsCloud/Usuarios");
const EmpresaModel = require("../models/Empresa");
const SucursalModel = require("../models/Sucursal");
const AbrirCerrarTurnoModel = require("../models/AbrirCerrarTurnos");
const AbonosModel = require("../models/Abonos");
const HistorialCajaModel = require("../models/HistorialCajas");
const {
  awsUploadImage,
  eliminarUnaImagen,
} = require("../middleware/aws_uploads");
const { createToken } = require("../middleware/token");
const bcryptjs = require("bcryptjs");
const mongoose = require("mongoose");
const moment = require("moment");
const { toUpperConvert } = require("../middleware/reuser");

UsuariosCtrl.verifyUserName = async (username) => {
  try {
    const userName = await Usuarios.findOne({
      username_login: username.trim(),
    });
    if (userName) {
      throw new Error("Este username ya existe");
    }
    return {
      message: "Username disponible",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

UsuariosCtrl.crearUsuario = async (input) => {
  try {
    const Models = await CloudFunctions.getModels(["Usuarios"]);
    let username = "";
    if (input.username_login) {
      const usuario = await Models.Usuarios.findOne({
        username_login: input.username_login.trim(),
      });
      if (usuario) {
        throw new Error("Este username ya existe");
      }
      username = input.username_login.trim();
    }
    const nuevoUsuario = toUpperConvert(input);

    if (nuevoUsuario.imagen) {
      const { createReadStream, mimetype } = await nuevoUsuario.imagen;
      const extension = mimetype.split("/")[1];
      const imageName = `usuarios/${Date.now().toString()}.${extension}`;
      const fileData = createReadStream();
      const result = await awsUploadImage(fileData, imageName);
      nuevoUsuario.imagen = result;
    }
    if (nuevoUsuario.password !== nuevoUsuario.repeatPassword) {
      throw new Error("Las contraseñas no coinciden");
    }
    const salt = bcryptjs.genSaltSync(10);
    const newPass = await bcryptjs.hash(nuevoUsuario.password, salt);
    nuevoUsuario.password = newPass;
    nuevoUsuario.eliminado = false;
    nuevoUsuario.username_login = username;
    const usuario = new Models.Usuarios(nuevoUsuario);
   
    await usuario.save();

    await CloudFunctions.changeDateCatalogoUpdate(
      input.empresa,
      "Usuarios",
      moment(usuario.updatedAt).locale("es-mx").format()
    );
    await UsuariosCtrl.actualizarBDLocal(input.empresa, input.sucursal);

    return usuario;
  } catch (error) {
    console.log(error);
    return error;
  }
};

UsuariosCtrl.obtenerUsuarios = async (empresa, sucursal, filtro, eliminado) => {
  try {
    if (!filtro) {
      const usuarios = await Usuarios.find({ empresa, sucursal, eliminado })
        .populate("empresa sucursal")
        .sort({ nombre: 1 });
      return usuarios;
    }
    const usuarios = await Usuarios.aggregate([
      { $sort: { nombre: 1 } },
      {
        $match: {
          $or: [
            { numero_usuario: parseInt(filtro) },
            { nombre: { $regex: ".*" + filtro + ".*", $options: "i" } },
            { email: { $regex: ".*" + filtro + ".*", $options: "i" } },
          ],
          $and: [
            {
              $or: [{ sucursal: mongoose.Types.ObjectId(sucursal), eliminado }],
            },
          ],
        },
      },
    ]);
    const populated_result = await Usuarios.populate(usuarios, {
      path: "empresa sucursal",
    });
    return populated_result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

UsuariosCtrl.actualizarUsuario = async (id, input, empresa, sucursal) => {
  try {
    const Models = await CloudFunctions.getModels([
      "Usuarios",
      "AbrirCerrarTurno",
      "Abonos",
      "HistorialCajas",
    ]);

    let username = "";

    const usuario = await Usuarios.findById(id);
    if (!usuario.username_login && input.username_login) {
      const usernameExistente = await Models.Usuarios.findOne({
        username_login: input.username_login.trim(),
      });
      if (usernameExistente) {
        throw new Error("Este username ya existe");
      }
      username = input.username_login.trim();
    }

    const nuevosDatos = toUpperConvert(input);

    nuevosDatos.username_login = username;
    const imagen = input.imagen;
    const userBase = await Models.Usuarios.findById(id);
    if (typeof imagen !== "string" && imagen) {
      const { createReadStream, mimetype } = await imagen;
      const extension = mimetype.split("/")[1];
      const imageName = `usuarios/${Date.now().toString()}.${extension}`;
      const fileData = createReadStream();
      const result = await awsUploadImage(fileData, imageName);
      nuevosDatos.imagen = result;
    } else {
      if (userBase.imagen) {
        //eliminar de aws y de la bd
        //obtener la key
        const keyAws = userBase.imagen.split(".com/")[1];
        await eliminarUnaImagen(keyAws); //elimnar de aws
      }
    }

    if (nuevosDatos.password && nuevosDatos.repeatPassword) {
      if (nuevosDatos.password !== nuevosDatos.repeatPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      const salt = bcryptjs.genSaltSync(10);
      const newPass = await bcryptjs.hash(nuevosDatos.password, salt);
      nuevosDatos.password = newPass;
    }
    const editUserTurno = {
      "usuario_en_turno.nombre": nuevosDatos.nombre,
      "usuario_en_turno.telefono": nuevosDatos.telefono,
      "usuario_en_turno.email": nuevosDatos.email,
    };
    const editUserModelos = {
      nombre_usuario_creador: nuevosDatos.nombre,
    };

    const query = { id_usuario: id };

    await Models.AbrirCerrarTurno.updateMany(query, editUserTurno);
    await Models.Abonos.updateMany(query, editUserModelos);
    await Models.HistorialCajas.updateMany({ id_User: id }, editUserModelos);

    await Models.Usuarios.findByIdAndUpdate({ _id: id }, nuevosDatos);

    const userActualizado = await Models.Usuarios.findById(id);

    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Usuarios",
      moment(userActualizado.updatedAt).locale("es-mx").format()
    );
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "AbrirCerrarTurno",
      moment(userActualizado.updatedAt).locale("es-mx").format()
    );
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Abonos",
      moment(userActualizado.updatedAt).locale("es-mx").format()
    );
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "HistorialCajas",
      moment(userActualizado.updatedAt).locale("es-mx").format()
    );

    await UsuariosCtrl.actualizarBDLocal(empresa, sucursal);
    return {
      message: "Usuario actualizado",
    };
  } catch (error) {
    return {
      message: "Ocurrio un error al actualizar Usuario",
    };
  }
};

UsuariosCtrl.logearUsuario = async (input) => {
  try {
    const { numero_usuario, password, isOnline } = input;
    let usuario = [];
    let user = {};
    let passwordSuccess = {};
    //Verifica si el modelo Empresa de la base de datos local ya tiene el registro
    const empresa = await Empresa.find();

    if (empresa.length) {
      //Si hay datos de empresa, ya hubo inicio de sesión antes
      const usuariofilter = await Usuarios.aggregate([
        {
          $match: {
            $and: [
              { estado_usuario: true },
              { eliminado: false },
              {
                $or: [
                  { numero_usuario: parseInt(numero_usuario) },
                  { username_login: numero_usuario },
                ],
              },
            ],
          },
        },
      ]);
      usuario = await Usuarios.populate(usuariofilter, {
        path: "sucursal empresa",
      });
      if (!usuario.length) {
        throw new Error("Este usuario no existe o está inactivo.");
      }

      //verificar que este la empresa y sucursal activa

      user = usuario[0];
      const empresaFind = await EmpresaModel.findById(user.empresa._id);

      const sucursalFind = await SucursalModel.findById(user.sucursal._id);

      if (!empresaFind.empresa_activa)
        throw new Error(
          "La empresa asociada con este usuario no tiene una licencia activa"
        );
      if (!sucursalFind.licencia_activa)
        throw new Error(
          "La sucursal asociada con este usuario no tiene una licencia activa"
        );

      if (isOnline)
        await actualizarBDLocal(user.empresa._id, user.sucursal._id);
    } else {
      if (!isOnline) throw new Error("No se pudo continuar. Sin conexión");
      /* usuario = await Usuarios.populate(usuariofilter, {
      path: "sucursal empresa",
    }); */
      usuario = await CloudFunctions.GetUsuario(numero_usuario);

      if (!usuario.length) {
        throw new Error("Este usuario no existe o está inactivo.");
      }
      user = usuario[0];
      const dataCloud = await obtenerModelosBaseCloud(
        user.empresa._id,
        user.sucursal._id
      );
      //verificar que este la empresa y sucursal activa

      const empresaFind = dataCloud.empresa[0];

      const sucursalFind = dataCloud.sucursal[0];

      if (!empresaFind.empresa_activa)
        throw new Error(
          "La empresa asociada con este usuario no tiene una licencia activa"
        );
      if (!sucursalFind.licencia_activa)
        throw new Error(
          "La sucursal asociada con este usuario no tiene una licencia activa"
        );
      await guardarModelosBaseLocal(dataCloud.documentos);
    }

    passwordSuccess = await bcryptjs.compare(password, user.password);

    if (!passwordSuccess)
      throw new Error("El número de usuario o la contraseña son incorrectos");

    const data_user = {
      _id: user._id,
      numero_usuario: user.numero_usuario,
      nombre: user.nombre,
      telefono: user.telefono,
      email: user.email,
      estado: user.estado_usuario,
      imagen: user.imagen,
      sucursal: user.sucursal,
      empresa: user.empresa,
      accesos: user.accesos,
      turno_en_caja_activo: user.turno_en_caja_activo,
    };
    return { token: createToken(data_user, "48h") };
  } catch (error) {
    console.log(error);
    return error;
  }
};

UsuariosCtrl.eliminarUsuario = async (id) => {
  try {
    const usuario = await Usuarios.findById(id);

    if (!usuario) {
      throw new Error("Este usuario no existe");
    }

    await Usuarios.findByIdAndUpdate(id, { eliminado: true });
    return {
      message: "Usuario inhabilitado",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

// Asinar accesos a los usuarios, solemnte editando por medio de su id y con el input
UsuariosCtrl.asignarAccesosUsuario = async (input, id) => {
  try {
    // Dentro del modelo de datos del usuario hacer el update de los datos correspondientes
    await Usuarios.findByIdAndUpdate({ _id: id }, { accesos: input });
    return {
      message: "Permisos asignados",
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Ocurrio un error al eliminar Cliente",
    };
  }
};

// Permiso
UsuariosCtrl.obtenerAccesoPermiso = async (input) => {
  try {
    // Comenzamos a distructurar los datos lanzados por el input
    const {
      numero_usuario,
      password,
      departamento,
      subDepartamento,
      tipo_acceso,
    } = input;

    // Debemos de buscar el usuario que verificaremos los permisos
    const usuario = await Usuarios.findOne({ numero_usuario });
    // Debemos de verificar el usuario exista
    if (!usuario)
      throw new Error(
        "Error, el numero de usuario o la contrasena son incorrectos"
      );
    // De igual manera la contrasena debemos de verificar que sea la correcta
    const passwordSuccess = await bcryptjs.compare(password, usuario.password);
    if (!passwordSuccess)
      throw new Error(
        "Error, el numero de usuario o la contrasena son incorrectos"
      );

    // Debemos de tomar de de que permiso estaremos verificando con el departamento y sub que se ha mandado
    const permisoSeleccionado =
      usuario.accesos[departamento][subDepartamento][tipo_acceso];
    // verificaremos que el permiso que se desea verificar en especifico este activado en true
    if (!permisoSeleccionado) throw new Error("Permiso no autorizado.");
    return {
      permiso_concedido: permisoSeleccionado,
      departamento: departamento,
      subDepartamento: subDepartamento,
    };
  } catch (error) {
    return error;
  }
};

const obtenerModelosBaseCloud = async (empresa, sucursal) => {
  //Consulta MODELOSBASE en la BD Cloud
  return await CloudFunctions.GetInitialData(empresa, sucursal);
};

UsuariosCtrl.actualizarBDLocal = async (empresa, sucursal) => {
  try {
    let respuesta = "";

    respuesta = await updateLocalDataBase(empresa, sucursal);

    return { message: respuesta };
  } catch (error) {
    console.log(error);
  }
};
const actualizarBDLocal = async (empresa, sucursal) => {
  try {
    let respuesta = "";

    respuesta = await updateLocalDataBase(empresa, sucursal);

    return { message: respuesta };
  } catch (error) {
    console.log(error);
  }
};

const updateLocalDataBase = async (empresa, sucursal) => {
  try {
    let sucFind = await Sucursal.findById({ _id: sucursal });
    let response = await CloudFunctions.GetUpdates(
      empresa,
      sucFind._id,
      sucFind.fecha_updated_bd_local
    );

    const conLocal = mongoose.connections[0];
    let doChanges = false;
    for (const objectsCloudByModel of response.updatesArray) {
      for (const documentObject of objectsCloudByModel.data) {
        let checkExistDocument =
          await objectsCloudByModel.model.findByIdAndUpdate(
            {
              _id: documentObject._id,
            },
            documentObject
          );
        if (checkExistDocument === null) {
          objectsCloudByModel.model.collection.insertOne(documentObject);
        }
        doChanges = true;
      }
    }

    if (doChanges) {
      await Sucursal.findByIdAndUpdate(
        {
          _id: sucursal,
        },
        { fecha_updated_bd_local: moment().locale("es-mx").format() }
      );
    }
    return response.updatesArray.length === 0
      ? "Su base de datos local está actualizada."
      : "La base de datos local se actualizó correctamente.";
  } catch (error) {
    console.log(error);
    return error;
  }
};

const guardarModelosBaseLocal = async (datosCloud) => {
  //Guarda en la BD Local
  const conLocal = mongoose.connections[0];
  const conCloud = mongoose.connections[1];
  //const models = mongoose.models;
  const schemas = conCloud.base.modelSchemas;

  for (const [key, schema] of Object.entries(schemas)) {
    if (conLocal.models[key] != null) {
      conLocal.deleteModel(key);
    }
    const ModelCloud = conLocal.model(key, schema);

    for (const objectsCloudByModel of datosCloud) {
      if (key === objectsCloudByModel.key) {
        if (key === "Sucursal") {
        }
        ModelCloud.insertMany(objectsCloudByModel.data);
        //console.log(objectsCloudByModel.data);

        //const newRegistro = new ModelCloud(datosCloud.data);
        //newRegistro.save();
      }
    }
  }

  return "guardarModelosBaseLocal";
};

module.exports = UsuariosCtrl;
