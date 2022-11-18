const ClientesCtrl = {};
const Clientes = require("../models/Clientes");
const AbonosModel = require("../models/Abonos");
const {
  awsUploadImage,
  eliminarUnaImagen,
} = require("../middleware/aws_uploads");
const moment = require("moment");
const { toUpperConvert } = require("../middleware/reuser");

const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");

const mongoose = require("mongoose");

ClientesCtrl.crearCliente = async (input) => {
  try {
    const Models = await CloudFunctions.getModels(["Clientes"]);

    const {
      empresa,
      sucursal,
      numero_cliente,
      clave_cliente,
      tipo_cliente,
      imagen,
    } = input;

    const nuevo_cliente = { ...input };
    let cliente_valido = {};
    if (tipo_cliente === "CLIENTE") {
      cliente_valido = await Models.Clientes.findOne({
        empresa,
        sucursal,
        tipo_cliente,
      }).where({
        $or: [{ numero_cliente }, { clave_cliente }],
      });
    } else {
      cliente_valido = await Models.Clientes.findOne({
        empresa,
        sucursal,
        tipo_cliente,
      }).where({
        $or: [{ numero_cliente }],
      });
    }
    const clientes_number = await Models.Clientes.find().where({
      empresa,
      sucursal,
      tipo_cliente,
    });
    let get_number = 0;
    if (cliente_valido) throw new Error("La clave o el número ya existe.");
    if (clientes_number && clientes_number.length > 0)
      get_number = clientes_number[clientes_number.length - 1].numero_cliente;
    if (imagen) {
      const { createReadStream, mimetype } = await imagen;
      const extension = mimetype.split("/")[1];
      const imageName = `usuarios/${Date.now().toString()}.${extension}`;
      const fileData = createReadStream();
      const result = await awsUploadImage(fileData, imageName);
      nuevo_cliente.imagen = result;
    }
    nuevo_cliente.fecha_registro = moment().locale("es-mx").format();
    nuevo_cliente.numero_cliente = parseInt(get_number) + 1;
    nuevo_cliente.eliminado = false;
    nuevo_cliente.credito_disponible =
      nuevo_cliente.credito_disponible > 0
        ? nuevo_cliente.credito_disponible
        : 0;
    nuevo_cliente.limite_credito =
      nuevo_cliente.limite_credito > 0 ? nuevo_cliente.limite_credito : 0;

    nuevo_cliente.monedero_electronico = 0;

    const data = toUpperConvert(nuevo_cliente);
    const new_client = new Models.Clientes(data);
    const clienteBase = await new_client.save();
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Clientes",
      moment(clienteBase.updatedAt).locale("es-mx").format()
    );
    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    return clienteBase;
  } catch (error) {
    console.log(error);
    return error;
  }
};

ClientesCtrl.obtenerClientes = async (
  tipo,
  filtro,
  empresa,
  eliminado,
  limit = 0,
  offset = 0
) => {
  try {
    let totalDocs = 0;
    let page = Math.max(0, offset);

    if (!filtro) {
      const clientes = await Clientes.find({
          empresa,
          tipo_cliente: tipo,
          eliminado,
        })
          .populate("empresa sucursal")
          .limit(limit)
          .skip(limit * page)
          .sort({ nombre_cliente: 1 }),
        totalDocs = await Clientes.find({
          empresa,
          tipo_cliente: tipo,
          eliminado,
        }).countDocuments();

      //return clientes;
      return { docs: clientes, totalDocs };
    }

    const paginate_conf = [{ $skip: limit * page }];
    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const clientes = await Clientes.aggregate([
      {$sort: { nombre_cliente:1 }},
      {$match: {
          $or: [
            { numero_cliente: parseInt(filtro) },
            { clave_cliente: parseInt(filtro) },
            { nombre_cliente: { $regex: ".*" + filtro + ".*", $options: "i" } },
            { representante: { $regex: ".*" + filtro + ".*", $options: "i" } },
            { razon_social: { $regex: ".*" + filtro + ".*", $options: "i" } },
            { email: { $regex: ".*" + filtro + ".*", $options: "i" } },
          ],
          $and: [
            { tipo_cliente: tipo },
            { eliminado },
            { empresa: mongoose.Types.ObjectId(empresa) },
          ],
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
      { $unwind: { path: "$empresa" } },
      { $unwind: { path: "$sucursal" } },
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

    /* const populated_result = await Clientes.populate(clientes, {
      path: "empresa sucursal",
    }); */
    /*  return populated_result; */
    return clientes[0].docs.length
      ? { docs: clientes[0].docs, totalDocs: clientes[0].totalDocs[0].count }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
};

ClientesCtrl.actualizarCliente = async (input, id, empresa, sucursal) => {
  try {
    const Models = await CloudFunctions.getModels(["Clientes", "Abonos"]);
    const nuevosDatos = { ...input };

    const clienteBase = await Models.Clientes.findById(id);

    if (typeof nuevosDatos.imagen !== "string" && nuevosDatos.imagen) {
      const { createReadStream, mimetype } = await nuevosDatos.imagen;
      const extension = mimetype.split("/")[1];
      const imageName = `usuarios/${Date.now().toString()}.${extension}`;
      const fileData = createReadStream();
      const result = await awsUploadImage(fileData, imageName);
      if (result) {
        nuevosDatos.imagen = result;
      } else {
        return {
          status: false,
          urlAvatar: null,
        };
      }
    } else {
      //no hay imagen
      if (clienteBase.imagen) {
        //eliminar de aws y de la bd
        //obtener la key
        const keyAws = clienteBase.imagen.split(".com/")[1];
        await eliminarUnaImagen(keyAws); //elimnar de aws
      }
    }
    const data = toUpperConvert(nuevosDatos);
    const query = { id_cliente: id };
    const editCliente = {
      nombre_cliente: data.nombre_cliente,
      telefono_cliente: data.telefono,
      email_cliente: data.email,
    };
    await Models.Abonos.updateMany(query, editCliente);

    await Models.Clientes.findByIdAndUpdate({ _id: id }, data);
    const clienteNewDatos = await Models.Clientes.findById(id);

    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Clientes",
      moment(clienteNewDatos.updatedAt).locale("es-mx").format()
    );
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Abonos",
      moment(clienteNewDatos.updatedAt).locale("es-mx").format()
    );
    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    return {
      message: "Se ha actualizado correctamente",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

ClientesCtrl.eliminarCliente = async (id, empresa, sucursal) => {
  try {
    const Models = await CloudFunctions.getModels(["Clientes"]);
    const cliente = await Models.Clientes.findById(id);

    if (!cliente) {
      throw new Error("No existe registro con los datos proporcionados");
    }

    await Models.Clientes.findByIdAndUpdate(id, { eliminado: true });

    const clienteNewDatos = await Models.Clientes.findById(id);
    await CloudFunctions.changeDateCatalogoUpdate(
      empresa,
      "Clientes",
      moment(clienteNewDatos.updatedAt).locale("es-mx").format()
    );

    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    return {
      message: "Se eliminó correctamente.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = ClientesCtrl;
