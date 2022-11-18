const AlmacenCtrl = {};
const AlmacenModel = require("../models/Almacen");
const ProductoModel = require("../models/Producto");
// const { generateNumCertifictate } = require("../middleware/reuser");
 const ProductosAlmacen = require("../models/Productos_almacen");
const mongoose = require('mongoose');

AlmacenCtrl.obtenerAlmacenes = async (id) => {
    try {
        const almacenesSucursal = await AlmacenModel.find({id_sucursal: id}).populate("id_sucursal id_usuario_encargado");
       //console.log(almacenesSucursal)
        return almacenesSucursal;
    } catch (error) {
        console.log(error);
		return error;
    }
}
//Función que obtiene todos los productos.}
AlmacenCtrl.obtenerProductosAlmacenes = async (input, limit = 10, offset = 0) => {
    try {
    let { filtro, empresa, sucursal } = input;
    let filtro_match = {};
    let page = Math.max(0, offset);  
    
    //Agregar la condicion de las tallas y unidades de venta normal
   
		if(filtro){
			filtro_match = 
			{
				$match: {
					$or: [
						{ 'datos_generales.codigo_barras': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.clave_alterna': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.tipo_producto': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.nombre_comercial': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.nombre_generico': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.categoria': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.subcategoria': { $regex: '.*' + filtro + '.*', $options: 'i' } },
						{ 'datos_generales.marca': { $regex: '.*' + filtro + '.*', $options: 'i' } }
					],
					$and: [ 
						{empresa: mongoose.Types.ObjectId(empresa),},
						/* {eliminado: false} */
					],
					
				}
			};
		}else{
			filtro_match = 
			{
				$match: {
					empresa: mongoose.Types.ObjectId(empresa),
					
					/* eliminado: false */
				}
			};
		} 

      const paginate_conf = [
        { $skip: limit * page }
      ];

      if(limit){
        
        paginate_conf.push({ $limit: limit })
      }
    
        const data = await ProductoModel.aggregate([
            filtro_match,
            {
                $lookup: {
                  from: "unidadesventas",
                  let: { id: "$_id", empresa: `${empresa}`, sucursal: `${sucursal}`, concepto: 'medidas' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$id_producto", { $toObjectId: "$$id" }] },
                            { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                            { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                            { $eq: ["$concepto", "$$concepto" ] }
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
                  let: { id: "$_id", empresa: `${empresa}`, sucursal: `${sucursal}`},
                  pipeline: [
                    {
                      $match: {
                        $expr: { 
                          $and: [
                            { $eq: ["$producto._id", { $toObjectId: "$$id" }] },
                            { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                            { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] }
                          ],
                        },
                      },
                    },
                    {
                        $group: { 
                            _id: {
                                
                                producto: "$producto._id",
                                almacen: "$id_almacen"
                            },
                            unidad_inventario: { $first: '$unidad_inventario' },
                            cantidad_existente_maxima : { $sum: '$cantidad_existente_maxima'},
                            unidad_maxima: { $first:"$unidad_maxima"},
                            cantidad_existente: { $sum: '$cantidad_existente' }
                        } 
                    }
                  ],
                  as: `existencia_almacenes`,
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
   
        const datos = await AlmacenModel.populate(data, {path: 'existencia_almacenes._id.almacen'});
        console.log("obtenerProductosAlmacenes",datos);
        

        return datos[0].docs.length
        ? { docs: datos[0].docs, totalDocs: datos[0].totalDocs[0].count }
        : { docs: [], totalDocs: 0 };
        //return datos;
    
        } catch (error) {
            console.log("obtenerProductosAlmacenes:", error);
            return error;
        }
}

AlmacenCtrl.crearAlmacen = async (input, id, empresa) => {
    try {
        const { 
            nombre_almacen, 
            id_usuario_encargado,
            direccion
        } = input;

        const newAlmacen = new AlmacenModel({
            nombre_almacen,
            id_usuario_encargado,
            id_sucursal: id,
            empresa: empresa._id,
            direccion: direccion,
            default_almacen: false
        });
		const almacenBase = await newAlmacen.save();
        return almacenBase
    } catch (error) {
        console.log(error);
		return error;
    }
}

AlmacenCtrl.actualizarAlmacen = async (input, id) => {
    try {
        const actualizarAlmacen = input;
        await AlmacenModel.findByIdAndUpdate(id,actualizarAlmacen);
        return { message: "Almacen actulizada" };
    } catch (error) {
        console.log(error);
		return error;
    }
}

AlmacenCtrl.eliminarAlmacen = async (id) => {
    try {
      const almacen = await AlmacenModel.findById(id);
      if(!almacen) throw new Error("Almacen no encontrado");
      const productos_almacen = await ProductosAlmacen.find({id_almacen: id});
      if(productos_almacen.length > 0) throw new Error("No se puede realizar esta acción, Este almacén tiene productos registrados");
      await AlmacenModel.findByIdAndDelete(id);
      return {
        message: "Almacen eliminado"
      }
    } catch (error) {
        console.log(error);
		return error;
    }
}

module.exports = AlmacenCtrl;