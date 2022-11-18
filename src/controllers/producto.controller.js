const ProductoCtrl = {};
const ProductoModel = require("../models/Producto");
const {
  awsUploadImageMultiple,
  eliminarImagenesAWS,
} = require("../middleware/aws_uploads");
const categoriasModel = require("../models/Categorias");
const departamentoModel = require("../models/Departamentos");
const marcasModel = require("../models/Marcas");
const coloresModel = require("../models/Colores");
const medidasModel = require("../models/Tallas");
const AlmacenModel = require("../models/Almacen");
/* const TraspasosModel = require("../models/Traspasos"); */
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const CatalogoContableModel = require("../models/Cuentas");
const mongoose = require("mongoose");
const ProductoAlmacenes = require("../models/Productos_almacen");
const moment = require("moment");
const ProductoMovimiento = require("../models/ProductoMovimiento");
const CodigosProducto = require("../models/CodigosProductosSat");
const { toUpperConvert } = require("../middleware/reuser");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");

ProductoCtrl.obtenerProductos = async (empresa,sucursal,filtro,almacen,existencias,limit = 0, offset = 0) => {
  try {
    
    let almacenSucursal = {};

    if (almacen) {
      almacenSucursal._id = almacen;
    } else {
      almacenSucursal = await AlmacenModel.findOne().where({
        id_sucursal: sucursal,
        default_almacen: true,
      });
    }

    if (!almacenSucursal) return [];

    //Traer el Almacen principal de esa sucursal para hacer el filtro.
    let filtro_match = {};
    let page = Math.max(0, offset);
    //Agregar la condicion de las tallas y unidades de venta normal
    if (filtro) {
      filtro_match = {
        $match: {
          $or: [
            {
              "datos_generales.codigo_barras": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.clave_alterna": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.tipo_producto": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.nombre_comercial": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.nombre_generico": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.categoria": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.subcategoria": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
            {
              "datos_generales.marca": {
                $regex: ".*" + filtro + ".*",
                $options: "i",
              },
            },
          ],
          $and: [
            { empresa: mongoose.Types.ObjectId(empresa) },
            //{sucursal: mongoose.Types.ObjectId(sucursal)},
            /* {eliminado: false} */
          ],
        },
      };
    } else {
      filtro_match = {
        $match: {
          empresa: mongoose.Types.ObjectId(empresa),
          //sucursal: mongoose.Types.ObjectId(sucursal),
          /* eliminado: false */
        },
      };
    }
    const paginate_conf = [
      { $skip: limit * page }
    ];

    if(limit){
      paginate_conf.push({ $limit: limit })
    }

    //Hacer la consulta de las tallas a la base de datos.
    const productosBaseDos = await ProductoModel.aggregate([
      filtro_match,
      {
        $lookup: {
          from: "unidadesventas",
          let: {
            id: "$_id",
            empresa: `${empresa}`,
            //sucursal: `${sucursal}`,
            concepto: "unidades",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id_producto", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    //{ $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$concepto", "$$concepto"] },
                  ],
                },
              },
            },
          ],
          as: "unidades_de_venta",
        },
      },
      {
        $lookup: {
          from: "unidadesventas",
          let: {
            id: "$_id",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            concepto: "medidas",
            almacen: `${almacenSucursal._id}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id_producto", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$concepto", "$$concepto"] },
                    { $eq: ["$almacen", { $toObjectId: "$$almacen" }] },
                  ],
                },
              },
            },
          ],
          as: "medidas_producto",
        },
      },
      {
        $lookup: {
          from: "productoalmacens",
          let: {
            id: "$_id",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            almacen: `${almacenSucursal._id}`,
            eliminado: false,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$id_almacen", { $toObjectId: "$$almacen" }] },
                    { $eq: ["$eliminado", "$$eliminado"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: "$producto._id",
                cantidad_existente: { $first: "$cantidad_existente" },
                unidad_inventario: { $first: "$unidad_inventario" },
                codigo_unidad: { $first: "$codigo_unidad" },
                cantidad_existente_maxima: {
                  $first: "$cantidad_existente_maxima",
                },
                unidad_maxima: { $first: "$unidad_maxima" },
                id_almacen_general: { $first: "$_id" },
                eliminado: { $first: "$eliminado" },
              },
            },
          ],
          as: "inventario_general",
        },
      },
      { $sort: { "datos_generales.nombre_comercial": 1 } },
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

    let prodRet = [];
    
    if (existencias) {
      const productosExistencias = productosBaseDos[0].docs.filter(
        (p) => p.inventario_general.length == 1
      );
      prodRet =  productosExistencias;
    } else {
      prodRet = productosBaseDos[0].docs;
    }

 
    return prodRet.length
    ? { docs: prodRet, totalDocs: productosBaseDos[0].totalDocs[0].count }
    : { docs: [], totalDocs: 0 };  

 
  } catch (error) {
    console.log(error);
    return error;
  }
};

/* ProductoCtrl.obtenerProductosInactivos = async (empresa, sucursal) => {
	try {
		const productos = await ProductoModel.find().where({eliminado: true,empresa,sucursal});
		return productos;
	} catch (error) {
		console.log(error);
		return error;
	}
} */

/* ProductoCtrl.activarProducto = async (id) => {
	try {
		await ProductoModel.findByIdAndUpdate(id,{ eliminado: false });
		return {
			message: "Producto activado"
		}
	} catch (error) {
		console.log(error);
		return error;
	}
} */

ProductoCtrl.obtenerProductosInactivos = async (empresa, sucursal) => {
  try {
    const productos = await ProductoAlmacenes.find().where({
      eliminado: true,
      empresa,
    });
    
    return productos;
  } catch (error) {
    console.log(error);
    return error;
  }
};

ProductoCtrl.activarProducto = async (id, empresa, sucursal) => {
  try {
   
    const Models =  await CloudFunctions.getModels(['ProductoAlmacen', 'Productos']);

    await Models.ProductoAlmacen.findByIdAndUpdate(id, { eliminado: false });

    const productoAlm = await Models.ProductoAlmacen.findById(id); 
    await Models.Productos.findByIdAndUpdate(productoAlm.producto._id, { eliminado: false });
    
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(productoAlm.updatedAt).locale("es-mx").format());
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(productoAlm.updatedAt).locale("es-mx").format());  

    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    
    return {
      message: "Producto activado",
    };

  } catch (error) {
    console.log(error);
    return error;
  }
};

async function RegistroUnidadesBase(unidades,empresa,sucursal,id_producto,idAlmacenFrom,UnidadVentaModelCloud,ProductosModelCloud) {
  try {
 
    const idAlmacen = (idAlmacenFrom === '') ? undefined : idAlmacenFrom;
    
    let unidadesBase = [];
    for (i = 0; i < unidades.length; i++) {
      const {
        unidad_de_venta,
        precio,
        cantidad,
        unidad,
        codigo_unidad,
        unidad_principal,
        codigo_barras,
        precio_unidad,
      } = unidades[i];

      if (codigo_barras === undefined) {
        const newDate = new UnidadVentaModelCloud({
          codigo_barras: "",
          unidad_de_venta,
          precio,
          unidad,
          codigo_unidad,
          cantidad,
          unidad_principal,
          id_producto,
          empresa,
          sucursal,
          precio_unidad,
          almacen: idAlmacen,
          default: unidades[i].default,
          concepto: "unidades",
        });
        unidadesBase.push(newDate);
      } else {
        const unidad_venta = await UnidadVentaModelCloud.findOne({
          codigo_barras: codigo_barras,
          empresa: empresa,
          sucursal: sucursal,
        });
        if (unidad_venta && unidad_venta.codigo_barras)
          throw new Error("Producto duplicado en unidad de venta.");
        const newDate = new UnidadVentaModelCloud({
          unidad_de_venta,
          precio,
          unidad,
          codigo_unidad,
          codigo_barras,
          cantidad,
          unidad_principal,
          id_producto,
          precio_unidad,
          almacen: idAlmacen,
          empresa,
          sucursal,
          default: unidades[i].default,
          concepto: "unidades",
        });
        unidadesBase.push(newDate);
      }
    }
      
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   moment(unidadesBase[0].updatedAt).locale("es-mx").format()); 
    if (unidadesBase.length !== unidades.length) return false;
    return unidadesBase;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function generarProductosMedida(arrayMedida, productoBase, idAlmacen, UnidadVentaModelCloud, empresa, sucursal) {
  try {
    let arrayFinal = [];
    let cantidad_total_medida = 0;
    for (i = 0; i < arrayMedida.length; i++) {
      const {
        cantidad,
        codigo_barras,
        color,
        unidad,
        codigo_unidad,
        existencia,
        medida,
        nombre_comercial,
        precio,
        precio_unidad,
      } = arrayMedida[i];

      const newProducto = new UnidadVentaModelCloud({
        id_producto: productoBase._id,
        codigo_barras,
        unidad,
        codigo_unidad,
        color,
        existencia,
        nombre_comercial,
        medida,
        precio,
        cantidad,
        precio_unidad,
        almacen: idAlmacen,
        concepto: "medidas",
        empresa,
        sucursal,
        eliminado: false,
      });
      cantidad_total_medida = cantidad_total_medida + parseInt(cantidad);
      arrayFinal.push(newProducto);
    }
    const fechaModificacion = moment().locale("es-mx").format();
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   fechaModificacion); 
    return {
      array_medidas: arrayFinal,
      cantidad_total: cantidad_total_medida,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

ProductoCtrl.crearProducto = async (input) => {
  try {
    const Models =  await CloudFunctions.getModels(['ProductoAlmacen', 'Productos', 'Unidadesventa']);
    const datos_generales = toUpperConvert(input.datos_generales);
    const {
      precios,
      imagenes,
      almacen_inicial,
      centro_de_costos,
      precio_plazos,
      empresa,
      sucursal,
      usuario,
      unidades_de_venta,
    } = input;
    //Verificamos los filtros del producto (Que todos los campos esten completos)
    if (
      !datos_generales.clave_alterna ||
      !datos_generales.tipo_producto ||
      !datos_generales.nombre_comercial ||
      !datos_generales.nombre_generico ||
      !precios.unidad_de_compra.unidad ||
      !precios.unidad_de_compra.codigo_unidad ||
      !precios.unidad_de_compra.cantidad ||
      !precios.unidad_de_compra.precio_unitario_sin_impuesto ||
      !precios.unidad_de_compra.precio_unitario_con_impuesto
    )
      throw new Error("Datos incompletos.");
    //Verificar que no se repita la clave alterna TODO: Verificar si solo por almacen o general.
    let productoClaveAlterna = [];
    if (almacen_inicial.id_almacen !== "") {
      productoClaveAlterna = await Models.ProductoAlmacen.find().where({
        "producto.datos_generales.clave_alterna": datos_generales.clave_alterna,
        empresa,
        sucursal,
        id_almacen: almacen_inicial.id_almacen,
      });
    } else {
      productoClaveAlterna = await Models.ProductoAlmacen.find().where({
        "producto.datos_generales.clave_alterna": datos_generales.clave_alterna,
        empresa,
        sucursal,
      });
    }
    if (productoClaveAlterna.length > 0)
      throw new Error("Clave alterna registrada");
    //Inicializamos las variables que nesesitaremos despues
    let imagenesGuardadas = [];
    let productos_almacen_inventario = {};
    //Guardamos producto inicial
    const hoy = moment();
    const newProductoBase = new Models.Productos({
      datos_generales: datos_generales,
      precios: precios,
      centro_de_costos: centro_de_costos ? centro_de_costos : {},
      precio_plazos: precio_plazos,
      empresa: empresa,
      sucursal: sucursal,
      usuario: usuario,
      eliminado: false,
      medidas_registradas: false,
      year_registro: hoy.year(),
      numero_semana_year: hoy.week(),
      fecha_registro: moment().locale("es-mx").format(),
    });

    if (almacen_inicial.id_almacen !== "") {
      switch (precios.unidad_de_compra.unidad) {
        case "Pz":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: almacen_inicial.cantidad,
            unidad_inventario: precios.unidad_de_compra.unidad,
            codigo_unidad: precios.unidad_de_compra.codigo_unidad,
            // cantidad_existente_minima: existencias.cantidad_existente_minima,
            // unidad_minima: existencias.unidad_minima,
            // cantidad_existente_maxima: existencias.cantidad_existente_maxima,
            // unidad_maxima: existencias.unidad_maxima,
            empresa,
            sucursal,
            id_almacen: almacen_inicial.id_almacen,
            almacen: {
              _id: almacen_inicial.id_almacen,
              nombre_almacen: almacen_inicial.almacen,
              default_almacen: true,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Caja":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente:
              parseFloat(almacen_inicial.cantidad) *
              parseFloat(precios.unidad_de_compra.cantidad),
            unidad_inventario: "Pz",
            codigo_unidad: "H87",
            // cantidad_existente_minima: almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
            // unidad_minima: 'Pz',
            cantidad_existente_maxima: almacen_inicial.cantidad,
            unidad_maxima: precios.unidad_de_compra.unidad,
            empresa,
            sucursal,
            id_almacen: almacen_inicial.id_almacen,
            almacen: {
              _id: almacen_inicial.id_almacen,
              nombre_almacen: almacen_inicial.almacen,
              default_almacen: true,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Kg":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: almacen_inicial.cantidad,
            unidad_inventario: "Kg",
            codigo_unidad: "KGM",
            cantidad_existente_minima: almacen_inicial.cantidad * 1000,
            unidad_minima: "g",
            // cantidad_existente_maxima: almacen_inicial.cantidad ,
            // unidad_maxima: 'Kg',
            empresa,
            sucursal,
            id_almacen: almacen_inicial.id_almacen,
            almacen: {
              _id: almacen_inicial.id_almacen,
              nombre_almacen: almacen_inicial.almacen,
              default_almacen: true,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Costal":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente:
              almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
            unidad_inventario: "Kg",
            codigo_unidad: "KGM",
            cantidad_existente_minima:
              almacen_inicial.cantidad *
              precios.unidad_de_compra.cantidad *
              1000,
            unidad_minima: "g",
            cantidad_existente_maxima: almacen_inicial.cantidad,
            unidad_maxima: precios.unidad_de_compra.unidad,
            empresa,
            sucursal,
            id_almacen: almacen_inicial.id_almacen,
            almacen: {
              _id: almacen_inicial.id_almacen,
              nombre_almacen: almacen_inicial.almacen,
              default_almacen: true,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        default:
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: almacen_inicial.cantidad,
            unidad_inventario: "Lt",
            codigo_unidad: "LTR",
            cantidad_existente_minima: almacen_inicial.cantidad * 1000,
            unidad_minima: "ml",
            empresa,
            sucursal,
            id_almacen: almacen_inicial.id_almacen,
            almacen: {
              _id: almacen_inicial.id_almacen,
              nombre_almacen: almacen_inicial.almacen,
              default_almacen: true,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
      }
    }
    
    //Guardamos unidad de venta en un objeto
    //console.log({almacen_inicial})
    const unidadesDeVenta = await RegistroUnidadesBase(
      unidades_de_venta,
      empresa,
      sucursal,
      newProductoBase._id,
      almacen_inicial.id_almacen,
      Models.Unidadesventa,
      Models.Productos

    );

    //Verificamos si hay unidades de venta
    if (unidadesDeVenta === false) throw new Error("Error de registro.");
    //Subir imagenes a AWS
    if (imagenes.length > 0) {
      const result = await awsUploadImageMultiple(imagenes, 0);
      imagenesGuardadas = result;
    }
    //Guardar las imagenes en el aobjeto de producto
    newProductoBase.imagenes = imagenesGuardadas;
    //Guardamos producto.
    await newProductoBase.save();
    //Guardar almacenes
    if (almacen_inicial.id_almacen !== "")
      await productos_almacen_inventario.save();

    /* //crear traspaso
      const traspasoInicial = new TraspasosModel({
        usuario,
        concepto_traspaso: {
			nombre_concepto: "SALDO_INICIAL",
			origen: "N/A",
			destino: "SUMA"
		},
        almacen_origen: null,
        almacen_destino: almacen_inicial.id_almacen,
        datosTransporte: {
			transporte: "",
			placas: "",
			nombre_encargado: ""  
		 },
        empresa,
        sucursal,
        year_registro: moment().locale("es-mx").year(),
        numero_semana_year: moment().locale("es-mx").week(),
        numero_mes_year: moment().locale("es-mx").month(),
        fecha_registro: moment().locale("es-mx").format(),
      });
	  //crear producto movimiento
	  const productoMovimiento = new ProductoMovimiento({
		id_traspaso: traspasoInicial._id,
		id_producto: newProductoBase._id,
		producto: {
		  almacen_inicial: almacen_inicial,
		  datos_generales: newProductoBase.datos_generales,
		  precios: newProductoBase.precios,
		  unidades_de_venta: unidadesDeVenta
		},
		concepto: "traspasos",
		almacen_origen: null,
		almacen_destino: {
			_id: almacen_inicial.id_almacen,
			nombre_almacen: almacen_inicial.almacen,
			default_almacen: true
		},
		cantidad: productos_almacen_inventario.cantidad_existente,
		cantidad_durante_mov_origen: 0,
		cantidad_durante_mov_destino: 0,
		concepto_traspaso: "SALDO INICIAL",
		empresa,
		sucursal,
		usuario,
		year_registro: moment().locale("es-mx").year(),
		numero_semana_year: moment().locale("es-mx").week(),
		numero_mes_year: moment().locale("es-mx").month(),
		fecha_registro: moment().locale("es-mx").format()
	  });
	  await traspasoInicial.save();
	  await productoMovimiento.save(); */
    //Guardamos las unidades de venta.
    unidadesDeVenta.map(async (unidad) => await unidad.save());
    
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    
    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    
    return {
      message: "Producto registrado.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

//Exportar esta funcion
ProductoCtrl.crearProductoRapido = async (input) => {

  try {
    const Models =  await CloudFunctions.getModels(['ProductoAlmacen', 'Productos', 'Unidadesventa']);
    const datos_generales = toUpperConvert(input.datos_generales);
    const {
      precios,
      empresa,
      sucursal,
      cantidad,
      usuario,
      unidades_de_venta,
      presentaciones,
    } = input;
    //Verificamos los filtros del producto (Que todos los campos esten completos)
    if (
      !datos_generales.clave_alterna ||
      !datos_generales.tipo_producto ||
      !datos_generales.nombre_comercial ||
      !datos_generales.nombre_generico ||
      !precios.unidad_de_compra.unidad ||
      !precios.unidad_de_compra.codigo_unidad ||
      !precios.unidad_de_compra.cantidad ||
      !precios.unidad_de_compra.precio_unitario_sin_impuesto ||
      !precios.unidad_de_compra.precio_unitario_con_impuesto
    )
      throw new Error("Datos incompletos.");

    if (datos_generales.tipo_producto === "OTROS" && cantidad < 1)
      throw new Error("Datos incompletos.");

    const almacenDefault = await AlmacenModel.findOne({
      id_sucursal: sucursal,
    }).where({ default_almacen: true });

    // Verificar que no se repita la clave alterna TODO: Verificar si solo por almacen o general.
    // let productoClaveAlterna = [];

    const productoClaveAlterna = await Models.ProductoAlmacen.find().where({
      "producto.datos_generales.clave_alterna": datos_generales.clave_alterna,
      empresa,
      sucursal,
    });

    // if(almacenDefault){
    // 	productoClaveAlterna = await ProductoAlmacenes.find().where({'producto.datos_generales.clave_alterna': datos_generales.clave_alterna, empresa, sucursal, id_almacen: almacenDefault._id });
    // }else{
    // 	productoClaveAlterna =
    // }

    if (productoClaveAlterna.length > 0)
      throw new Error("Clave alterna registrada");

    //Inicializamos las variables que nesesitaremos despues
    let productos_almacen_inventario = {};
    //Guardamos producto inicial
    const hoy = moment();
    const newProductoBase = new Models.Productos({
      datos_generales: datos_generales,
      precios: precios,
      empresa: empresa,
      sucursal: sucursal,
      usuario: usuario,
      eliminado: false,
      medidas_registradas: false,
      year_registro: hoy.year(),
      numero_semana_year: hoy.week(),
      fecha_registro: moment().locale("es-mx").format(),
    });
    if (almacenDefault) {
      switch (precios.unidad_de_compra.unidad) {
        case "Pz":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: cantidad,
            unidad_inventario: precios.unidad_de_compra.unidad,
            codigo_unidad: precios.unidad_de_compra.codigo_unidad,
            // cantidad_existente_minima: existencias.cantidad_existente_minima,
            // unidad_minima: existencias.unidad_minima,
            // cantidad_existente_maxima: existencias.cantidad_existente_maxima,
            // unidad_maxima: existencias.unidad_maxima,
            empresa,
            sucursal,
            id_almacen: almacenDefault._id,
            almacen: {
              _id: almacenDefault._id,
              nombre_almacen: almacenDefault.nombre_almacen,
              default_almacen: almacenDefault.default_almacen,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Caja":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente:
              parseFloat(cantidad) *
              parseFloat(precios.unidad_de_compra.cantidad),
            unidad_inventario: "Pz",
            codigo_unidad: "H87",
            // cantidad_existente_minima: almacen_inicial.cantidad * precios.unidad_de_compra.cantidad,
            // unidad_minima: 'Pz',
            cantidad_existente_maxima: cantidad,
            unidad_maxima: precios.unidad_de_compra.unidad,
            empresa,
            sucursal,
            id_almacen: almacenDefault._id,
            almacen: {
              _id: almacenDefault._id,
              nombre_almacen: almacenDefault.nombre_almacen,
              default_almacen: almacenDefault.default_almacen,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Kg":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: cantidad,
            unidad_inventario: "Kg",
            codigo_unidad: "KGM",
            cantidad_existente_minima: cantidad * 1000,
            unidad_minima: "g",
            // cantidad_existente_maxima: almacen_inicial.cantidad ,
            // unidad_maxima: 'Kg',
            empresa,
            sucursal,
            id_almacen: almacenDefault._id,
            almacen: {
              _id: almacenDefault._id,
              nombre_almacen: almacenDefault.nombre_almacen,
              default_almacen: almacenDefault.default_almacen,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        case "Costal":
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: cantidad * precios.unidad_de_compra.cantidad,
            unidad_inventario: "Kg",
            codigo_unidad: "KGM",
            cantidad_existente_minima:
              cantidad * precios.unidad_de_compra.cantidad * 1000,
            unidad_minima: "g",
            cantidad_existente_maxima: cantidad,
            unidad_maxima: precios.unidad_de_compra.unidad,
            empresa,
            sucursal,
            id_almacen: almacenDefault._id,
            almacen: {
              _id: almacenDefault._id,
              nombre_almacen: almacenDefault.nombre_almacen,
              default_almacen: almacenDefault.default_almacen,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
        default:
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: newProductoBase._id,
              datos_generales: newProductoBase.datos_generales,
              precios: newProductoBase.precios,
            },
            cantidad_existente: cantidad,
            unidad_inventario: "Lt",
            codigo_unidad: "LTR",
            cantidad_existente_minima: cantidad * 1000,
            unidad_minima: "ml",
            empresa,
            sucursal,
            id_almacen: almacenDefault._id,
            almacen: {
              _id: almacenDefault._id,
              nombre_almacen: almacenDefault.nombre_almacen,
              default_almacen: almacenDefault.default_almacen,
            },
            year_registro: newProductoBase.year_registro,
            numero_semana_year: newProductoBase.numero_semana_year,
            fecha_registro: newProductoBase.fecha_registro,
            eliminado: false,
          });
          break;
      }
    }

    //Guardamos unidad de venta en un objeto
    const unidadesDeVenta = await RegistroUnidadesBase(
      unidades_de_venta,
      empresa,
      sucursal,
      newProductoBase._id,  
      almacenDefault._id,
      Models.Unidadesventa,
      Models.Productos
    );

    //Verificamos si hay unidades de venta
    if (unidadesDeVenta === false) throw new Error("Error de registro.");

    /* **FAVOR DE ELIMINAR ESTO ⇩⇩⇩⇩⇩⇩⇩⇩⇩⇩⇩⇩⇩⇩  */
    if (presentaciones.length > 0) {
      productosMedidaBase = await generarProductosMedida(
        presentaciones,
        newProductoBase,
        almacenDefault._id,
        Models.Unidadesventa,
        empresa,
        sucursal
      );
      newProductoBase.medidas_registradas = true;
      const productos_almacen_inventario = new Models.ProductoAlmacen({
        producto: {
          _id: newProductoBase._id,
          datos_generales,
          precios,
        },
        concepto: "Almacen",
        cantidad_agregada: productosMedidaBase.cantidad_total,
        cantidad_existente: productosMedidaBase.cantidad_total,
        empresa,
        sucursal,
        id_almacen: almacenDefault._id,
        almacen: {
          _id: almacenDefault._id,
          nombre_almacen: almacenDefault.nombre_almacen,
          default_almacen: almacenDefault.default_almacen,
        },
        unidad_inventario: "Pz",
        codigo_unidad: "H87",
        year_registro: hoy.year(),
        numero_semana_year: hoy.week(),
        fecha_registro: moment().locale("es-mx").format(),
        eliminado: false,
      });
      await productos_almacen_inventario.save();
    }

    //Guardamos producto.
    await newProductoBase.save();

    if (presentaciones.length > 0) {
      productosMedidaBase.array_medidas.map(
        async (producto) => await producto.save()
      );
    } else {
      await productos_almacen_inventario.save();
    }

    //Guardar almacenes
    // if(almacenDefault._id !== '') await productos_almacen_inventario.save();
    //Guardamos las unidades de venta.
    unidadesDeVenta.map(async (unidad) => await unidad.save());

    await CloudFunctions.changeDateCatalogoUpdate(newProductoBase.empresa, 'ProductoAlmacen',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(newProductoBase.empresa, 'Productos',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(newProductoBase.empresa, 'Unidadesventa',   moment(unidadesDeVenta[0].updatedAt).locale("es-mx").format()); 
    await (newProductoBase.empresa, newProductoBase.sucursal);
    return {
      message: "Producto registrado.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};
//datosProducto is Object
//datos_extra is Objeto
ProductoCtrl.editarUnidadesDeMedida = async ({empresa, sucursal, arrayMedida,productoBase,idAlmacen,fromCompra,id_compra,datosProducto,datos_extra,Models}) => {
  try {
    let cantidad_total_medida = 0;
    let unidadVenta_registrar = [];
    /* let nuevoProductoMovimiento = []; */
    let productosMovimientos = [];
    let unidadVenta_actualizar = [];
    for (var i = 0; i < arrayMedida.length; i++) {
      const {
        _id,
        cantidad,
        cantidad_nueva,
        existencia,
        precio,
        codigo_barras,
        color,
        medida,
        nombre_comercial,
        descuento,
        descuento_activo,
        precio_unidad,
        unidad,
        codigo_unidad,
      } = arrayMedida[i];

      if (_id && !fromCompra) {
     
        await Models.Unidadesventa.findByIdAndUpdate(_id, {
          cantidad,
          unidad,
          codigo_unidad,
          existencia,
          precio,
          descuento,
          descuento_activo,
          nombre_comercial: productoBase.datos_generales.nombre_comercial,
          precio_unidad,
        });
        cantidad_total_medida = cantidad_total_medida + parseInt(cantidad);
      } else if (!_id && !fromCompra) {
       
        const newMedidaProducto = new Models.Unidadesventa({
          id_producto: productoBase._id,
          codigo_barras,
          color,
          existencia,
          nombre_comercial,
          medida,
          precio,
          cantidad,
          unidad,
          codigo_unidad,
          precio_unidad,
          almacen: idAlmacen,
          concepto: "medidas",
          empresa,
          sucursal,
          eliminado: false,
        });
        await newMedidaProducto.save();
        cantidad_total_medida = cantidad_total_medida + parseInt(cantidad);
      } else if (_id && fromCompra) {
        //si es de compra y existe presentacion, madar los datos a actualizar y sumar la cantidad
        let new_cantidad = cantidad;
        if (cantidad_nueva && cantidad_nueva > 0)
          new_cantidad = cantidad + cantidad_nueva;
        /* let unidad_venta = {
					_id,
					cantidad: new_cantidad,
					existencia, 
					precio, 
					nombre_comercial: productoBase.datos_generales.nombre_comercial
				} */
        /* if(descuento_activo === true || descuento_activo === false){
					unidad_venta.descuento = descuento;
					unidad_venta.descuento_activo = descuento_activo;
				} */

        unidadVenta_actualizar.push({
          ...arrayMedida[i],
          cantidad_nueva: 0,
          cantidad: new_cantidad,
          id_producto: datosProducto.id_producto,
        });

        if (new_cantidad > 0) {
          

          const nuevoProductoMovimiento = new Models.ProductosMovimientos({
            folio_compra: datos_extra.folio_compra,
            id_compra: id_compra,
            id_producto: datosProducto.id_producto,
            id_proveedor: datos_extra.proveedor.id_proveedor,
            id_almacen: datos_extra.almacen.id_almacen,
            almacen: {
              id_almacen: datos_extra.almacen.id_almacen,
              nombre_almacen: datos_extra.almacen.nombre_almacen,
              default_almacen: datos_extra.almacen.default_almacen,
            },
            proveedor: {
              _id: datos_extra.proveedor.id_proveedor,
              clave_cliente: datos_extra.proveedor.clave_cliente,
              numero_cliente: datos_extra.proveedor.numero_cliente,
              nombre_cliente: datos_extra.proveedor.nombre_cliente,
            },
            producto: {
              almacen_inicial: datosProducto.producto.almacen_inicial,
              datos_generales: datosProducto.producto.datos_generales,
              precios: datosProducto.producto.precios,
              unidades_de_venta: datosProducto.producto.unidades_de_venta,
            },
            concepto: "compras",
            cantidad: datosProducto.cantidad,
            cantidad_regalo: datosProducto.cantidad_regalo,
            unidad_regalo: datosProducto.unidad_regalo,
            cantidad_total: datosProducto.cantidad_total,
            costo: datosProducto.costo,
            descuento_porcentaje: datosProducto.descuento_porcentaje,
            descuento_precio: datosProducto.descuento_precio,
            compra_credito: datos_extra.compra_credito,
            forma_pago: datos_extra.forma_pago,
            iva_total: datosProducto.iva_total,
            ieps_total: datosProducto.ieps_total,
            impuestos: datosProducto.impuestos,
            mantener_precio: datosProducto.mantener_precio,
            subtotal: datosProducto.subtotal,
            total: datosProducto.total,
            medida: {
              id_medida: medida._id,
              medida: medida.talla,
              tipo: medida.tipo,
            },
            color: { id_color: color._id, color: color.nombre, hex: color.hex },
            unidad: datosProducto.producto.precios.unidad_de_compra.unidad,
            codigo_unidad:
              datosProducto.producto.precios.unidad_de_compra.codigo_unidad,
            /* id_unidad_venta: datosProducto.producto.unidades_de_venta[0]._id, */
            empresa,
            sucursal,
            usuario: datos_extra.usuario,
            year_registro: moment().year(),
            numero_semana_year: moment().week(),
            numero_mes_year: moment().month(),
            fecha_registro: moment().locale("es-mx").format(),
          });
          productosMovimientos.push(nuevoProductoMovimiento);
        }
        cantidad_total_medida = cantidad_total_medida + parseInt(new_cantidad);
      } else if (!_id && fromCompra) {
        //si es de compra y no existe presentacion, crear instancia y sumar la cantidad
        let new_cantidad = cantidad;
        if (cantidad_nueva && cantidad_nueva > 0)
          new_cantidad = cantidad + cantidad_nueva;
        const newMedidaProducto = new Models.Unidadesventa({
          id_producto: datosProducto.id_producto,
          codigo_barras,
          color,
          existencia,
          nombre_comercial,
          medida,
          precio,
          cantidad: new_cantidad,
          unidad,
          codigo_unidad,
          precio_unidad,
          almacen: idAlmacen,
          concepto: "medidas",
          empresa,
          sucursal,
          eliminado: false,
        });
        if (new_cantidad > 0) {
          const nuevoProductoMovimiento = new Models.ProductosMovimientos({
            folio_compra: datos_extra.folio_compra,
            id_compra: id_compra,
            id_producto: datosProducto.id_producto,
            id_proveedor: datos_extra.proveedor.id_proveedor,
            id_almacen: datos_extra.almacen.id_almacen,
            almacen: {
              id_almacen: datos_extra.almacen.id_almacen,
              nombre_almacen: datos_extra.almacen.nombre_almacen,
              default_almacen: datos_extra.almacen.default_almacen,
            },
            proveedor: {
              _id: datos_extra.proveedor.id_proveedor,
              clave_cliente: datos_extra.proveedor.clave_cliente,
              numero_cliente: datos_extra.proveedor.numero_cliente,
              nombre_cliente: datos_extra.proveedor.nombre_cliente,
            },
            producto: {
              almacen_inicial: datosProducto.producto.almacen_inicial,
              datos_generales: datosProducto.producto.datos_generales,
              precios: datosProducto.producto.precios,
              unidades_de_venta: datosProducto.producto.unidades_de_venta,
            },
            concepto: "compras",
            cantidad: datosProducto.cantidad,
            cantidad_regalo: datosProducto.cantidad_regalo,
            unidad_regalo: datosProducto.unidad_regalo,
            cantidad_total: datosProducto.cantidad_total,
            costo: datosProducto.costo,
            descuento_porcentaje: datosProducto.descuento_porcentaje,
            descuento_precio: datosProducto.descuento_precio,
            compra_credito: datos_extra.compra_credito,
            forma_pago: datos_extra.forma_pago,
            iva_total: datosProducto.iva_total,
            ieps_total: datosProducto.ieps_total,
            impuestos: datosProducto.impuestos,
            mantener_precio: datosProducto.mantener_precio,
            subtotal: datosProducto.subtotal,
            total: datosProducto.total,
            medida: {
              id_medida: medida._id,
              medida: medida.talla,
              tipo: medida.tipo,
            },
            color: { id_color: color._id, color: color.nombre, hex: color.hex },
            unidad: datosProducto.producto.precios.unidad_de_compra.unidad,
            codigo_unidad:
              datosProducto.producto.precios.unidad_de_compra.codigo_unidad,
            /* id_unidad_venta: datosProducto.producto.unidades_de_venta[0]._id, */
            empresa,
            sucursal,
            usuario: datos_extra.usuario,
            year_registro: moment().year(),
            numero_semana_year: moment().week(),
            numero_mes_year: moment().month(),
            fecha_registro: moment().locale("es-mx").format(),
          });
          productosMovimientos.push(nuevoProductoMovimiento);
        }

        unidadVenta_registrar.push(newMedidaProducto);

        cantidad_total_medida = cantidad_total_medida + parseInt(new_cantidad);
      }
    }

    return {
      cantidad_total_medida,
      unidadVenta_registrar,
      unidadVenta_actualizar,
      productosMovimientos,
    };
  } catch (error) {
    console.log(error);
  }
};

ProductoCtrl.actualizarProducto = async (input, id, empresa, sucursal) => {
  try {
    const Models =  await CloudFunctions.getModels(['ProductoAlmacen', 'Productos', 'Unidadesventa','ProductosMovimientos']);
    const datos_generales = toUpperConvert(input.datos_generales);
    const {
      centro_de_costos,
      imagenes,
      imagenes_eliminadas,
      precio_plazos,
      precios,
      unidades_de_venta,
      usuario,
      presentaciones,
      presentaciones_eliminadas,
      almacen_inicial,
    } = input;

    const updateProducto = {
      datos_generales,
      centro_de_costos,
      precio_plazos,
      precios,
      usuario,
      imagenes: [],
    };
    let productos_almacen_inventario = {};
    const productoBase = await Models.Productos.findById(id);
    let productosMedidaBase = [];

    const hoy = moment();
    // console.log(productoBase);

   

    //Si hay almacen es por que se tiene que guardar tallas
    if (presentaciones.length > 0) {
      //Verificamos si es la primera guardada
      const almacenInicial = await AlmacenModel.findOne().where({
        id_sucursal: sucursal,
        default_almacen: true,
      });
      if (!almacenInicial) throw Error("Almacén no encontrado");

      const producto_almacen = await Models.ProductoAlmacen.findOne().where({
        "producto._id": productoBase._id,
        id_almacen: almacenInicial._id,
      });

      if (producto_almacen) {
        //Alctualizar las memidas del producto
        
        const editarMedidas = await ProductoCtrl.editarUnidadesDeMedida(
          {  
            empresa, 
            sucursal,
            arrayMedida: presentaciones,
            productoBase,
            idAlmacen:almacenInicial._id,
            Models
          }
        );
        //actualizar la cantidad totdal del producto en el modelo de producto almacen

        await Models.ProductoAlmacen.findByIdAndUpdate(producto_almacen._id, {
          cantidad_existente: editarMedidas.cantidad_total_medida,
          "producto.datos_generales": datos_generales,
          "producto.precios": precios,
        });
      } else {
        /* console.log(almacenInicial, "<++++++"); */
        productosMedidaBase = await generarProductosMedida(
          presentaciones,
          productoBase,
          almacenInicial._id,
          Models.Unidadesventa,
          empresa,
          sucursal
        );
        productosMedidaBase.array_medidas.map(
          async (producto) => await producto.save()
        );

        if (productoBase.precios.unidad_de_compra.unidad === "Caja") {
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: id,
              datos_generales,
              precios,
            },
            concepto: "Almacen",
            cantidad_agregada: productosMedidaBase.cantidad_total,
            cantidad_existente: productosMedidaBase.cantidad_total,
            cantidad_existente_maxima:
              parseFloat(productosMedidaBase.cantidad_total) /
              parseFloat(productoBase.precios.unidad_de_compra.cantidad),
            unidad_maxima: "Caja",
            unidad_inventario: "Pz",
            codigo_unidad: "H87",
            empresa,
            sucursal,
            id_almacen: almacenInicial._id,
            almacen: {
              _id: almacenInicial._id,
              nombre_almacen: almacenInicial.nombre_almacen,
              default_almacen: almacenInicial.default_almacen,
            },
            year_registro: hoy.year(),
            numero_semana_year: hoy.week(),
            fecha_registro: moment().locale("es-mx").format(),
            eliminado: false,
          });
          await productos_almacen_inventario.save();
        } else {
          productos_almacen_inventario = new Models.ProductoAlmacen({
            producto: {
              _id: id,
              datos_generales,
              precios,
            },
            concepto: "Almacen",
            cantidad_agregada: productosMedidaBase.cantidad_total,
            cantidad_existente: productosMedidaBase.cantidad_total,
            unidad_inventario: "Pz",
            codigo_unidad: "H87",
            empresa,
            sucursal,
            id_almacen: almacenInicial._id,
            almacen: {
              _id: almacenInicial._id,
              nombre_almacen: almacenInicial.nombre_almacen,
              default_almacen: almacenInicial.default_almacen,
            },
            year_registro: hoy.year(),
            numero_semana_year: hoy.week(),
            fecha_registro: moment().locale("es-mx").format(),
            eliminado: false,
          });
          await productos_almacen_inventario.save();
        }
      }
    } else {
      //ponerlo a 0 en producto almacen
      //Verificamos si es la primera guardada
      const almacenInicial = await AlmacenModel.findOne().where({
        id_sucursal: sucursal,
        default_almacen: true,
      });
      if (!almacenInicial) throw Error("Almacén no encontrado");

      const producto_almacen = await ProductoAlmacenes.findOne().where({
        "producto._id": productoBase._id,
        id_almacen: almacenInicial._id,
      });
      if (datos_generales.tipo_producto !== "OTROS") {
        if (producto_almacen) {
          await  Models.ProductoAlmacen.findByIdAndUpdate(producto_almacen._id, {
            //cantidad_existente: 0,
            "producto.datos_generales": datos_generales,
            "producto.precios": precios,
          });
        }
      }
    }
    //verificar si se han eliminado presentaciones
    if (presentaciones_eliminadas.length > 0)
      presentaciones_eliminadas.map(
        async (presentacion) =>
          await  Models.Unidadesventa.findByIdAndDelete(presentacion._id)
      );
    //se actualizan las unidades de venta
    if (unidades_de_venta.length > 0)
      await actualizarUnidadesDeVenta(unidades_de_venta, productoBase, Models, empresa, sucursal);
    //Se genera el nuevo arreglo de imagenes
    let imagenesFinales = productoBase.imagenes;
    if (imagenes.length > 0) {
      const result = await awsUploadImageMultiple(imagenes, 0);
      if (imagenes.length > 0 && productoBase.imagenes.length > 0) {
        imagenesFinales = await generateNewArrayImagenes(
          productoBase.imagenes,
          imagenes_eliminadas,
          result
        );
      } else {
        imagenesFinales = result;
      }
    }
    //Se eliminan las imagenes seleccionadas por el usuario
    if (imagenes_eliminadas.length > 0)
      await eliminarImagenesAWS(imagenes_eliminadas);
    //Guardamos las imagenes finales
    updateProducto.imagenes = imagenesFinales;
    //Se actualiza producto
    await  Models.Productos.findByIdAndUpdate(id, updateProducto);

    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductoAlmacen',   moment(productos_almacen_inventario.updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Productos',   moment(productos_almacen_inventario.updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Unidadesventa',   moment(productos_almacen_inventario.updatedAt).locale("es-mx").format()); 
    await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ProductosMovimientos',   moment(productos_almacen_inventario.updatedAt).locale("es-mx").format());
    await UsuariosController.actualizarBDLocal(empresa, sucursal);
    return {
      message: "Producto actualizado.",
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const actualizarUnidadesDeVenta = async (unidades, producto, Models, empresa, sucursal) => {
  try {
    // console.log(unidades);
    for (i = 0; i < unidades.length; i++) {
      const {
        _id,
        unidad_de_venta,
        precio,
        unidad,
        codigo_unidad,
        cantidad,
        unidad_principal,
        codigo_barras,
        precio_unidad,
        descuento,
        descuento_activo,
      } = unidades[i];

      if (!_id) {
        let array = {
          unidad_de_venta,
          precio,
          unidad,
          codigo_unidad,
          cantidad,
          unidad_principal,
          precio_unidad,
          id_producto: producto._id,
          empresa,
          sucursal,
          default: unidades[i].default,
          concepto: "unidades",
        };
        if (codigo_barras !== undefined && codigo_barras !== "")
          array = { ...array, codigo_barras };
        const newDate = new Models.Unidadesventa(array);
        await newDate.save();
      } else {
        const newObject = {
          cantidad,
          precio,
          unidad_principal,
          precio_unidad,
          codigo_barras,
          descuento,
          descuento_activo,
        };
        // console.log(unidades[i]);
        // if(descuento_activo){
        // 	console.log(unidades[i]);
        // 	const dinero_descontado = precio * descuento.porciento < 9 ? parseFloat(`0.0${descuento.porciento}`) : parseFloat(`0.${descuento.porciento}`);
        // 	const dinero_con_descuento = precio - dinero_descontado;
        // 	newObject.descuento_activo = true;
        // 	newObject.descuento = { ...descuento };
        // 	newObject.descuento.dinero_descontado = dinero_descontado;
        // 	newObject.descuento.precio_con_descuento = dinero_con_descuento;
        // }
        // console.log(newObject);
        await Models.Unidadesventa.findByIdAndUpdate(unidades[i]._id, newObject);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

//Funcion que junta los arreglos de las imagenes
const generateNewArrayImagenes = async (firstArray,secondArray,threeArray) => {
  //Declaramos la imagen final
  let final_array = [];
  //Verificamos si hay imagenes que se eliminaran
  if (secondArray.length > 0) {
    //Recorremos firstArray (EL array de las imagenes de la base)
    for (var i = 0; i < firstArray.length; i++) {
      //Declaramos una vandera para saber si la ireracion "i"
      let bandera_1 = false;
      //Declaramos la vandera para ver si se mete al array final
      let bandera_push = false;
      //Recorremos secondArray y comparamos si el dato existe en el firstArray si existe la bandera la ponemos en "true"
      for (var z = 0; z < secondArray.length; z++)
        if (secondArray[z].key_imagen === firstArray[i].key_imagen) {
          bandera_1 = true;
        }
      //Si la bandera es "false" significa que no se repite en el array
      if (!bandera_1) {
        //Verificamos si el array final tiene informacion
        if (final_array.length === 0) {
          //Agregamos al array final
          final_array.push(firstArray[i]);
          //Marcamos que ya se metio al array final
          bandera_push = true;
        } else {
          //Si no se a metido al array final se agrega
          if (!bandera_push) final_array.push(firstArray[i]);
        }
      }
    }
    //Se repite lo de arriba pero con el secondArray
    for (var i = 0; i < secondArray.length; i++) {
      let bandera_1 = false;
      let bandera_push = false;
      for (var z = 0; z < firstArray.length; z++)
        if (firstArray[z].key_imagen === secondArray[i].key_imagen)
          bandera_1 = true;
      if (!bandera_1) {
        if (final_array.length === 0) {
          final_array.push(secondArray[i]);
          bandera_push = true;
        } else {
          if (!bandera_push) final_array.push(secondArray[i]);
        }
      }
    }
  } else {
    //Si el secondArray no trae informacion solo metemos el firstArray al array final
    final_array = firstArray.length > 0 ? firstArray : [];
  }
  //Mezclamos el array final y el threeArray
  for (var u = 0; u < threeArray.length; u++) final_array.push(threeArray[u]);
  //Retornamos los objetos en un solo array y sin repetir
  return final_array;
};

ProductoCtrl.eliminarProducto = async (id) => {
  try {
    const Models =  await CloudFunctions.getModels(['ProductoAlmacen', 'Productos', 'Unidadesventa','ProductosMovimientos']);
    let productosObject = {};
    const productoBase = await ProductoModel.findById(id);
    const datosAlmacenes = await ProductoAlmacenes.find().where({
      "producto._id": id,
    });

    if (datosAlmacenes.length === 0) {
      throw new Error(`Este producto no existe en almacenes`);
    }

    if (
      productoBase.datos_generales.tipo_producto === "CALZADO" ||
      productoBase.datos_generales.tipo_producto === "ROPA"
    ) {
      const unidadesMedida = await UnidadVentaModel.find().where({
        id_producto: id,
        empresa: productoBase.empresa,
        sucursal: productoBase.sucursal,
        concepto: "medidas",
      });
      let cantidad_total = 0;
      for (var i = 0; i < unidadesMedida.length; i++) {
        if (unidadesMedida[i].cantidad > 0) {
          cantidad_total = cantidad_total + unidadesMedida[i].cantidad;
        }
      }
      for (var i = 0; i < datosAlmacenes.length; i++) {
        if (datosAlmacenes[i].cantidad_existente > 0) {
          cantidad_total =
            cantidad_total + datosAlmacenes[i].cantidad_existente;
        }
      }
      if (cantidad_total > 0) {
        throw new Error(
          `Este producto aun tiene ${cantidad_total} existencias`
        );
      } else {
        for (var i = 0; i < unidadesMedida.length; i++) {
          await Models.Unidadesventa.findByIdAndUpdate(unidadesMedida[i]._id, {
            eliminado: true,
          });
        }
        await Models.ProductoAlmacen.findByIdAndUpdate(datosAlmacenes[0]._id, {
          eliminado: true,
        });
        productosObject = await Models.Productos.findByIdAndUpdate(id,{
          eliminado: true
        });
        return {
          message: "Producto eliminado.",
        };
      }
    } else {
      let cantidad_total = 0;
      for (var i = 0; i < datosAlmacenes.length; i++) {
        if (datosAlmacenes[i].cantidad_existente > 0) {
          cantidad_total =
            cantidad_total + datosAlmacenes[i].cantidad_existente;
        }
      }
      if (cantidad_total > 0) {
        throw new Error(
          `Este producto aun tiene ${cantidad_total} existencias`
        );
      } else {
        await Models.ProductoAlmacen.findByIdAndUpdate(datosAlmacenes[0]._id, {
          eliminado: true,
        });
        await Models.Productos.findByIdAndUpdate(id,{
          eliminado: true
        });
        await CloudFunctions.changeDateCatalogoUpdate(productoBase.empresa, 'ProductoAlmacen',   moment(productosObject.updatedAt).locale("es-mx").format()); 
        await CloudFunctions.changeDateCatalogoUpdate(productoBase.empresa, 'Productos',   moment(productosObject.updatedAt).locale("es-mx").format()); 
        await CloudFunctions.changeDateCatalogoUpdate(productoBase.empresa, 'Unidadesventa',   moment(productosObject.updatedAt).locale("es-mx").format()); 
        await UsuariosController.actualizarBDLocal(productoBase.empresa, productoBase.sucursal);
        return {
          message: "Producto eliminado.",
        };
      }
    }
  } catch (error) {
    return error;
  }
};

/* ProductoCtrl.eliminarProducto = async (id) => {
	try {
		const productoBase = await ProductoModel.findById(id);
		const datosAlmacenes = await ProductoAlmacenes.find().where({'producto._id': id});
		
		if(productoBase.datos_generales.tipo_producto === 'CALZADO' || productoBase.datos_generales.tipo_producto === 'ROPA'){
			const unidadesMedida = await UnidadVentaModel.find().where({
				id_producto: id,
				empresa: productoBase,
				sucursal: productoBase,
				concepto: 'medidas'
			});
			let cantidad_total = 0;
			for(var i=0; i < unidadesMedida.length; i++){
				if(unidadesMedida[i].cantidad > 0){
					cantidad_total = cantidad_total + unidadesMedida[i].cantidad;
				}
			}
			for(var i=0; i < datosAlmacenes.length; i++){
				if(datosAlmacenes[i].cantidad_existente > 0){
					cantidad_total = cantidad_total + datosAlmacenes[i].cantidad_existente;
				}
			}
			console.log(cantidad_total);
			if(cantidad_total > 0){
				throw new Error(`Este producto aun tiene ${cantidad_total} existencias`);
			}else{
				for(var i=0; i < unidadesMedida.length; i++){
					await UnidadVentaModel.findByIdAndUpdate(unidadesMedida[i]._id,{eliminado: true});
				}
				await ProductoModel.findByIdAndUpdate(productoBase._id,{eliminado: true});
				return {
					message: "Producto eliminado."
				}
			}
		}else{
			let cantidad_total = 0;
			for(var i=0; i < datosAlmacenes.length; i++){
				if(datosAlmacenes[i].cantidad_existente > 0){
					cantidad_total = cantidad_total + datosAlmacenes[i].cantidad_existente;
				}
			}
			if(cantidad_total > 0){
				throw new Error(`Este producto aun tiene ${cantidad_total} existencias`);
			}else{
				await ProductoModel.findByIdAndUpdate(productoBase._id,{eliminado: true});
				return {
					message: "Producto eliminado."
				}
			}
		}
	} catch (error) {
		return error;
	}
} */

ProductoCtrl.obtenerConsultasProducto = async (empresa, sucursal) => {
  try {
    const categorias = await categoriasModel
      .find()
      .where({ empresa });
    const departamentos = await departamentoModel
      .find()
      .where({ empresa });
    const marcas = await marcasModel.find().where({ empresa });
    const colores = await coloresModel.find().where({ empresa });
    const tallas = await medidasModel.find().where({ empresa, tipo: "ROPA" });
    const centro_costos = await CatalogoContableModel.find().where({ empresa });
    const almacenes = await AlmacenModel.find().where({
      id_sucursal: sucursal,
    });
    const calzados = await medidasModel
      .find()
      .where({ empresa, tipo: "CALZADO" });
    const codigos = await CodigosProducto.find().where({ empresa });

    return {
      categorias,
      departamentos,
      marcas,
      colores,
      tallas,
      centro_costos,
      almacenes,
      calzados,
      codigos,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = ProductoCtrl;
