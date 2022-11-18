const ProductoModel = require("../../modelsCloud/Producto");
const TraspasosModel = require("../../modelsCloud/Traspasos");
const ProductosAlamacen = require("../../modelsCloud/Productos_almacen");
const ProductoMovimiento = require("../../modelsCloud/ProductoMovimiento");
const ComprasModel = require("../../modelsCloud/Compras");
const AbonosModel = require("../../modelsCloud/Abonos");
const UnidadVentaModel = require("../../modelsCloud/Unidad_venta_producto");
const VentasModel = require("../../modelsCloud/Ventas");
const HistorialCajasModel = require("../../modelsCloud/HistorialCajas");
const AbrirCerrarTurnosModel = require("../../modelsCloud/AbrirCerrarTurnos");
const Almacen = require("../../modelsCloud/Almacen");
const Cajas = require("../../modelsCloud/Cajas");
const Categorias = require("../../modelsCloud/Categorias");
const Clientes = require("../../modelsCloud/Clientes");
const CodigosProductosSat = require("../../modelsCloud/CodigosProductosSat");
const Colores = require("../../modelsCloud/Colores");
const CompraEnEspera = require("../../modelsCloud/CompraEnEspera");
const ConceptoAlmacen = require("../../modelsCloud/ConceptoAlmacen");
const Contabilidad = require("../../modelsCloud/Contabilidad");
const Cotizacion = require("../../modelsCloud/Cotizacion");
const Cuentas = require("../../modelsCloud/Cuentas");
const Departamentos = require("../../modelsCloud/Departamentos");
const Egresos = require("../../modelsCloud/Egresos");
const Empresa = require("../../modelsCloud/Empresa");
const Factura = require("../../modelsCloud/Factura");
const Marcas = require("../../modelsCloud/Marcas");
const SerieCFDI = require("../../modelsCloud/SerieCFDI");
const Sucursal = require("../../modelsCloud/Sucursal");
const Tallas = require("../../modelsCloud/Tallas");
const UsuariosModelCloud = require("../../modelsCloud/Usuarios");
const UsuariosModelLocal = require("../../models/Usuarios");
const UpdatedModel = require("../../modelsCloud/Updated");
const moment = require("moment");
const mongoose = require("mongoose");
const { generateCode } = require("../../middleware/reuser");


function  CloudFunctions  () {
  async function initialData(empresa, sucursal) {
try {
    const conCloud = mongoose.connections[1];
    const schemas = conCloud.base.modelSchemas;
    const resp = []
    let empresaObject = {};
    let sucursalObject = {};
       
    for (const [key, schema] of Object.entries(schemas)) {
      let ModelCloud;
      
      if (conCloud.models[key] != null) {
        conCloud.deleteModel(key);
      }
        ModelCloud = conCloud.model(key, schema)
       

            let datosFilterCloud = null;
            
            if(key === 'Sucursal'){
                datosFilterCloud = await ModelCloud.aggregate([
                    {
                    $match: {
                        $and: [
                        { id_empresa: mongoose.Types.ObjectId(empresa) },
                        ],
                    },
                    },
                ]);
                sucursalObject = datosFilterCloud;
                console.log(datosFilterCloud);
            }
          
            if(key === 'Almacen'){
                datosFilterCloud = await ModelCloud.aggregate([
                    {
                    $match: {
                        $and: [
                        { id_sucursal: sucursal },
                        ],
                    },
                    },
                ]);
            } 
            if(key === 'Empresa'){
                datosFilterCloud = await ModelCloud.aggregate([
                    {
                    $match: {
                        $and: [
                        { _id: empresa },
                        ],
                    },
                    },
                ]);
                empresaObject = datosFilterCloud; 
            } 
            if(key === 'Usuarios'){
              datosFilterCloud = await ModelCloud.aggregate([
                  {
                  $match: {
                      $and: [
                      { sucursal: sucursal },
                      ],
                  },
                  },
              ]);
             
          } 
            if(key !== 'Empresa' && key !== 'Sucursal'  && key !== 'Almacen' && key !== 'Usuarios'){
              
                datosFilterCloud = await ModelCloud.aggregate([
                    {
                    $match: {
                        $and: [
                        { empresa: empresa },
                        ],
                    },
                    },
                ]);
            }
                
            resp.push({key:key, data:datosFilterCloud})  
        };

    return {documentos : resp , empresa: empresaObject, sucursal: sucursalObject};
} catch (error) {
  console.log('ERROR',error)
}
    
  }
  async function doVenta(empresa, sucursal,cliente, new_venta, historialCajaInstance, productos, 
    puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,fecha_venta, credito, forma_pago, 
    tipo_venta, productos_base,montos_en_caja, haveInstance) {
  
    try {
      const conCloud = mongoose.connections[1];
      const schemas = conCloud.base.modelSchemas;
        //Instance models from Conection Cloud
        let Models = {};
        for (const [key, schema] of Object.entries(schemas)) {
            let ModelCloud;
         
            if (conCloud.models[key] != null) {
              conCloud.deleteModel(key);
            }  
            if(key === 'Venta' || key === 'Clientes' || key === 'HistorialCajas'|| key === 'ProductoAlmacen' ||
            key === 'Unidadesventa' || key === 'ProductosMovimientos') {
           
              Models[key] = conCloud.model(key, schema);
            } 
        }      
        const momentDate = fecha_venta ? moment(fecha_venta) : moment();
            //Crear instancia de historial caja model
            //Recorrer productos y guardarlos en modelo de producto movimiento
            for (let i = 0; i < productos.length; i++) {
            const producto_venta = productos[i];
            let unidadVentaProducto = {};
            let cantidadARestarGranel = 0;
            //Obtener el producto de producto almacen
            
            const productoAlmacen = await Models.ProductoAlmacen.findOne({
                empresa,
                sucursal,
                id_almacen: almacenPrincipal._id,
                "producto._id": producto_venta.id_producto._id,
            });
            if (!productoAlmacen)   return {done: false , message:"Error de registro"};
            //Si el producto es a granel sacamos la cantidad en gramos
            if (
                (producto_venta.granel_producto.granel === true &&
                producto_venta.unidad === "Kg") ||
                (producto_venta.granel_producto.granel === true &&
                producto_venta.unidad === "Costal") ||
                (producto_venta.granel_producto.granel === true &&
                producto_venta.unidad === "Lt")
            ) {
                let cantidadGramos = producto_venta.cantidad_venta;
                if (producto_venta.unidad === "Costal")
                cantidadGramos =
                    producto_venta.cantidad_venta * producto_venta.cantidad;

                const valorVentaGramos = parseFloat(cantidadGramos) * 1000;
                cantidadARestarGranel = valorVentaGramos; /* * parseFloat(producto_venta.granel_producto.valor); */
            } else {
                cantidadARestarGranel =
                parseFloat(producto_venta.cantidad_venta) * 1000;
            }
            //Verificar que la cantidad en almacen sea mayor a la de compra
            const verificationUnidad = await verificationUnidades({
                unidadProducto: producto_venta.unidad,
                productoAlmacen: productoAlmacen,
                cantidadARestarGranel: cantidadARestarGranel,
                productoVenta: producto_venta,
            });
            if (verificationUnidad === false)
            return {done: false , message:"No hay cantidad suficinte en almacen."}
             
            if (producto_venta.medida !== null) {
                //Verificar si tiene presentaciones (Obtener la presentacion de unidad de venta)
                unidadVentaProducto = await Models.Unidadesventa.findById(
                producto_venta._id
                );
               
                return {done: false , message:"Error de registro"}
                //Verificar que en presentaciones haya la cantidad correcta
                if (unidadVentaProducto.cantidad < producto_venta.cantidad_venta)
                return {done: false , message:"No hay cantidad suficinte en almacen."}
                
            }
            /* const cantidadARestarProductoAlmacen =
                (producto_venta.granel_producto.granel === true &&
                producto_venta.unidad === "Kg") ||
                (producto_venta.granel_producto.granel === true &&
                producto_venta.unidad === "lt")
                ? cantidadARestarGranel / 1000
                : producto_venta.cantidad_venta; */

            const cantidadARestarProductoAlmacen = producto_venta.cantidad_venta;
            //Restar medidas
            if (producto_venta.medida !== null) {
                /* console.log("Es medida"); */
                const medidaProductoAlmacen = await Models.Unidadesventa.findById(
                producto_venta._id
                );
                if (!medidaProductoAlmacen)
                return {done: false , message:"No hay cantidad suficinte en almacen."}
              
                /* console.log("medida base >>>> ", medidaProductoAlmacen);
                console.log("Cantidad venta >>> ", producto_venta.cantidad_venta); */
                await Models.ProductoAlmacen.findByIdAndUpdate(
                {
                    _id: productoAlmacen._id,
                },
                {
                    cantidad_existente:
                    parseFloat(productoAlmacen.cantidad_existente) -
                    parseFloat(producto_venta.cantidad_venta),
                }
                );
                const newMedida = await Models.Unidadesventa.findByIdAndUpdate(
                { _id: medidaProductoAlmacen._id },
                {
                    cantidad:
                    parseInt(medidaProductoAlmacen.cantidad) -
                    parseInt(producto_venta.cantidad_venta),
                }
                );
                /* console.log("Medida update >>> ", newMedida); */
                if (!newMedida) return {done: false , message:"Ups algo salió mal."};
            } else {
                //Restar de presentaciones si tiene medida y almacenes del producto
                const objectModifi = await restarCantidadAlmacen({
                is_unidad_maxima:
                    producto_venta.unidad === "Caja" ||
                    producto_venta.unidad === "Costal"
                    ? true
                    : false,
                cantidad_a_restar: cantidadARestarProductoAlmacen,
                factor_producto:
                    producto_venta.unidad === "Caja" ||
                    producto_venta.unidad === "Costal"
                    ? parseInt(producto_venta.cantidad)
                    : 1,
                almacen_origen_datos: productoAlmacen,
                unidad_de_compra: producto_venta.unidad,
                unidad_maxima_producto_almacen: productoAlmacen.unidad_maxima
                    ? productoAlmacen.unidad_maxima
                    : null,
                    ProductosAlmacen: Models.ProductoAlmacen
                });
                if (!objectModifi) return {done: false , message:"Ups algo salió mal."};
            }   
            }
            //Editar cliente
            if (credito) {
            await Models.Clientes.findByIdAndUpdate(cliente._id, {
                dias_credito: cliente.dias_credito,
                limite_credito: cliente.limite_credito,
                credito_disponible: cliente.credito_disponible - new_venta.total,
            });
            }
            /*  console.log("Puntos totales >>> ", puntos_totales_venta);
            console.log(
            "Puntos pagados >> ",
            parseFloat(montos_en_caja.monto_monedero.monto)
            ); */
            const puntosRestaVentas =
            parseFloat(puntos_totales_venta) -
            parseFloat(montos_en_caja.monto_monedero.monto);
            /* console.log("Puntos restantes >>>> ", puntosRestaVentas); */
            await Models.Clientes.findByIdAndUpdate(cliente._id, {
            monedero_electronico: puntosRestaVentas,
            });
            //ModelCloud.insertMany(objectsCloudByModel.data);
            
           
            //models.HistorialCajas.insert(historialCajaInstance);
            //TOD:Guardar cambio de valores en almacen producto (En un actualizacion se tiene que modificar aqui y no en el for del producto_venta)
            //Guardar todo venta
          
              const newVentaCloud = new Models.Venta(new_venta)
              await newVentaCloud.save();
              const historialCajaCloud = new Models.HistorialCajas(historialCajaInstance);
              await historialCajaCloud.save();     
              ProductosMovimientosCloud.insertMany(productos_base);
          
            //const ProductosMovimientos = new ProductosMovimientos()
           // models.Venta.insert(new_venta);
            //Guardar productos en producto movimiento
            //productos_base.map(async (p) => await p.save());
         
          
        return {done: true , message:"El registro en la nube se realió correctamente."};   
        } catch (error) {
            console.log(error)
           
            return {done: false , message:"No se pudo realizar el registro en la nube."};   
        }
  }

  async function makeStaticModels(empresa){
  
    const conCloud = mongoose.connections[1];
    const schemas = conCloud.base.modelSchemas;
    const models = [];
    const fecha =  moment().locale("es-mx").format();

    for (const [key, schema] of Object.entries(schemas)) {
      const ModelCloud = conCloud.model(key, schema);
        if(key === 'Unidadesventa' || key === 'Colores' || key === 'SerieCFDI' 
        || key === 'Clientes' || key === 'Abonos' || key === 'Productos'
        || key === 'Departamentos' || key === 'Categorias' || key === 'Marcas'
        || key === 'Cuentas' || key === 'CodigosProductos' || key === 'Contabilidades'
        || key === 'Tallas'|| key === 'ProductoAlmacen'|| key === 'ConceptoAlmacen'
        || key === 'Usuarios'   ){
         
           models.push({catalogo: key, fecha_updated: fecha, empresa:empresa})
        }
       
      //
      
    }; 
   
    const Updated = conCloud.model('Update', UpdatedModel);  
    Updated.insertMany(models);  
   
    return 'makeStaticModels';
  }
 
  async function getUpdates(empresa,sucursal, fecha_updated_bd_local){
    try {
      const conCloud = mongoose.connections[1];
      const conLocal = mongoose.connections[0];
      const Updated = conCloud.model('Update', UpdatedModel); 
      let updates = [];
      let resp = [];
      updates = await Updated.find({empresa});

      const schemas = conCloud.base.modelSchemas;
     
        for (const ind in updates){
          const modelUpdated = updates[ind];
         
          const ModelCloud = conCloud.model(modelUpdated.catalogo, schemas[modelUpdated.catalogo]);
          const ModelLocal = conLocal.model(modelUpdated.catalogo, schemas[modelUpdated.catalogo]);
        
          let checkDateIsBetween = moment(modelUpdated.fecha_updated).isAfter( fecha_updated_bd_local,undefined,'minutes'); 
 
          if(checkDateIsBetween ){
            
            const fecha1 = new Date(fecha_updated_bd_local);
            const key = modelUpdated.catalogo;
          
            let documentos = await ModelCloud.find({
              $and: [
                {updatedAt: { $gte: fecha1 } },
                {empresa: mongoose.Types.ObjectId(empresa)},
              
              ],
            }); 
            if(documentos.length) resp.push({key:key, data:documentos, model: ModelLocal})  
            
            //Buscar si de los siguiente catalogos se eliminaron documentos  en la base datos nube 
            //para elimnarlos de la base de datos local

            if(key === 'Tallas'  || key === 'Departamentos' || key === 'Categorias' ||
              key === 'Colores' || key === 'Marcas' || key === 'Cuentas'  || key === 'ConceptoAlmacen'){
                  
                const docCatFromLocalDb =  await ModelLocal.find({
                    $and: [
                      {empresa: mongoose.Types.ObjectId(empresa)},
                    
                    ],
                  }); 
                const doctCatFromCloudDb =  await ModelCloud.find({
                  $and: [
                    {empresa: mongoose.Types.ObjectId(empresa)},
                  
                  ],
                }); 
               
              if(docCatFromLocalDb.length > doctCatFromCloudDb.length){
                
               

                //Trying with filter  
                docCatFromLocalDb.filter(async documentLocalDb  => {
                  let ifExist = doctCatFromCloudDb.find(
                     documentCloudDb => documentCloudDb._id.toString() === documentLocalDb._id.toString()
                  )
                 
                  if(ifExist === undefined) {
                  
                    await ModelLocal.findByIdAndDelete({ _id: documentLocalDb._id.toString()})
                  }
                });
               /*  for (const documentLocalDb in docCatFromLocalDb) {
                  let ifExist = false;
                  let idDocumentLocal =docCatFromLocalDb[documentLocalDb]._id.toString();
                  
                  for (const documentCloudDb in doctCatFromCloudDb) {
                    let idDocumentCloud =doctCatFromCloudDb[documentCloudDb]._id.toString();
                  
                    ifExist = idDocumentLocal === idDocumentCloud;
                    
                    }
                    if(!ifExist) {
                      console.log(idDocumentLocal.toString())
                      await ModelLocal.findByIdAndDelete({ _id: idDocumentLocal.toString()});
                    }
                } */
              }
              //Verifica SubCategorias,Subcuentas
              /* if(key === 'Categorias' || key === 'Cuentas'){
                let subKey = (key === 'Categorias') ? 'subcategorias' : 'subcuentas';

                docCatFromLocalDb.filter(async documentLocalDb  => {
                  doctCatFromCloudDb.find(async documentCloudDb  => {
                    
                    if(documentCloudDb._id.toString() === documentLocalDb._id.toString()){
                      let arraySubCloud = documentCloudDb[subKey]
                      let arraySubLocal = documentLocalDb[subKey]
                   
                      if(arraySubLocal.length > arraySubCloud.length){
                        console.log(documentLocalDb[(key === 'Categorias') ? 'categoria' : 'cuenta'], arraySubLocal.length ,arraySubCloud.length)
                       //Comparar las subcategoriass
                     
                        await ModelLocal.updateOne(
                          {
                            _id: documentLocalDb._id.toString(),
                          },
                          {
                            $addToSet: {
                              [subKey]: arraySubCloud,
                            },
                          },
                        )
                      }
                    }
                  })
                })
              } */
            }
          }
        }
      return {updatesArray: resp}; 
    } catch (error) {
      console.log(error)
      return [];
      
    }
  }

  async function getUsuario( numero_usuario){
    try {

      const conCloud = mongoose.connections[1];
      if (conCloud.base.models['Usuarios'] != null) {
        conCloud.deleteModel('Usuarios');
      }
      const UsersCloud = conCloud.model('Usuarios', UsuariosModelCloud);
      const usuariofilterCloud = await UsersCloud.aggregate([
        {
          $match: {
            $and: [
              { estado_usuario: true },
              { eliminado: false },
              {
                $or: [
                  { numero_usuario: parseInt(numero_usuario)},
                  { username_login: numero_usuario },
                ],
              },
            ],
          },
        },
      ]);

      let usuario =  await UsersCloud.populate(usuariofilterCloud, {
        path: "sucursal empresa",
      });
      return usuario; 
    } catch (error) {
      console.log(error)
    }
  }
  async function verificationUnidades({
    unidadProducto,
    productoAlmacen,
    productoVenta,
    cantidadARestarGranel,
    }) {
    try {
       
      switch (unidadProducto) {
        case "Pz":
          if (productoAlmacen.cantidad_existente < productoVenta.cantidad_venta)
            return false;
          return true;
  
        case "Caja":
          if (
            productoAlmacen.cantidad_existente_maxima <
            productoVenta.cantidad_venta
          )
            return false;
          return true;
  
        case "kg":
          if (productoAlmacen.cantidad_existente_minima < cantidadARestarGranel)
            return false;
          return true;
  
        case "Costal":
          if (
            productoAlmacen.cantidad_existente_maxima <
            productoVenta.cantidad_venta
          )
            return false;
          return true;
        default:
          if (productoAlmacen.cantidad_existente_minima < cantidadARestarGranel)
            return false;
          return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function restarCantidadAlmacen ({
    is_unidad_maxima,
    cantidad_a_restar,
    factor_producto,
    unidad_maxima_producto_almacen,
    unidad_de_compra,
    almacen_origen_datos,
    ProductosAlmacen
    }) {
    try {
       
        //async function restarCantidad({ is_unidad_maxima, cantidad_a_restar, factor_producto, unidad_maxima_producto_almacen, unidad_de_compra,  almacen_origen_datos}){
        productoAlmacenAdd = null;
        let cantidad_existente_minima = 0;
        //{ is_unidad_maxima, cantidad_a_restar, factor_producto, unidad_maxima,  almacen_origen_datos}
        //is_unidad_maxima es un dato boolean que dice si se está restando por unidad máxima
        //factor_producto  este dato dice el factor
        //unidad_maxima_producto_almacen de producto almacen
      
        //producto.product_selected.precios.unidad_de_compra.cantidad
        let inventario_general = await get_inventario_general_origen(
          is_unidad_maxima,
          almacen_origen_datos,
          cantidad_a_restar,
          factor_producto,
          unidad_maxima_producto_almacen
        );
        switch (unidad_de_compra) {
          case "Pz":
            productoAlmacenAdd = await ProductosAlmacen.findByIdAndUpdate(
              {
                _id: almacen_origen_datos._id,
              },
              { cantidad_existente: inventario_general.cantidad_existente }
            );
            break;
          case "Caja":
            productoAlmacenAdd = await ProductosAlmacen.findByIdAndUpdate(
              {
                _id: almacen_origen_datos._id,
              },
              {
                cantidad_existente: inventario_general.cantidad_existente,
                cantidad_existente_maxima:
                  inventario_general.cantidad_existente_maxima,
              }
            );
      
            break;
          case "Kg":
            cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
            productoAlmacenAdd = await ProductosAlmacen.findByIdAndUpdate(
              {
                _id: almacen_origen_datos._id,
              },
              {
                cantidad_existente: inventario_general.cantidad_existente,
                cantidad_existente_minima: cantidad_existente_minima,
              }
            );
      
            break;
          case "Costal":
            cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
            productoAlmacenAdd = await ProductosAlmacen.findByIdAndUpdate(
              {
                _id: almacen_origen_datos._id,
              },
              {
                cantidad_existente: inventario_general.cantidad_existente,
                cantidad_existente_maxima:
                  inventario_general.cantidad_existente_maxima,
                cantidad_existente_minima: cantidad_existente_minima,
              }
            );
      
            break;
          default:
            cantidad_existente_minima = inventario_general.cantidad_existente * 1000;
            productoAlmacenAdd = await ProductosAlmacen.findByIdAndUpdate(
              {
                _id: almacen_origen_datos._id,
              },
              {
                cantidad_existente: inventario_general.cantidad_existente,
                cantidad_existente_minima: cantidad_existente_minima,
              }
            );
            break;
        }

        return productoAlmacenAdd;  
    } catch (error) {
        console.log(error)
    }
  };
  
  const get_inventario_general_origen = (
    unidad_maxima,
    almacen_origen_datos,
    cantidad_total,
    cantidadUnidadCompra,
    inventario_general_unidad_maxima
  ) => {
    let cantidad_existente_maxima = null,
      cantidad_existente = 0;
    if (unidad_maxima) {
      //cantidad_existente = parseFloat(cantidad_total) * parseFloat(producto.product_selected.precios.unidad_de_compra.cantidad)
      cantidad_existente =
        almacen_origen_datos.cantidad_existente -
        parseFloat(cantidad_total) * parseFloat(cantidadUnidadCompra);
      cantidad_existente_maxima =
        almacen_origen_datos.cantidad_existente_maxima - cantidad_total;
    } else {
      cantidad_existente =
        almacen_origen_datos.cantidad_existente - cantidad_total;
      if (inventario_general_unidad_maxima) {
        cantidad_existente_maxima =
          almacen_origen_datos.cantidad_existente_maxima -
          parseFloat(cantidad_total) / parseFloat(cantidadUnidadCompra);
        // console.log('inventario_general_unidad_maxima:',cantidad_existente_maxima)
      }
    }
  
    return { cantidad_existente_maxima, cantidad_existente };
  };

    async function openTurno(turno, historialCaja, activa){
        try {
          const Models = getModelsToTurno();
           
                Models.AbrirCerrarTurnoModel.collection.insertOne(turno);
                Models.HistorialCajasModel.collection.insertOne(historialCaja);
          
                  // Editaremos los campos correspondientes dentro de los registros como son las cajas
                  // para poder cambiar su estado a activa y el del usuario de la misma manera
                
                    let editarCaja = {
                      activa: activa,
                      usuario_en_caja: (activa) ? turno.id_usuario : null,
                    };

                    await Models.UsuariosModel.findByIdAndUpdate(
                      { _id: turno.id_usuario },
                      { turno_en_caja_activo: activa }
                    );

                    await Models.CajasModel.findByIdAndUpdate(
                      { _id: turno.id_caja },
                      editarCaja
                    );
                
                  return true;
               
              
            } catch (error) {
              console.log(error);
              return false;
              
            }
    }
    async function VerficarCaja(caja, empresa, sucursal, CajasCloud) {
        try {
          const filter = {
            empresa: empresa,
            sucursal: sucursal,
            _id: caja,
          };
         

          const cajaRecibida = await CajasCloud.findOne().where(filter);
          // Para asi poder retornar un booleando del estado de la caja
          return cajaRecibida.activa;
        } catch (error) {
        
          console.log(error);
          return '';
        }
    }

    async function VerificarTokenTurnoUser(codigo, AbrirCerrarTurno) {
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
        return '';
      }
    }
    function getModelsToTurno(){
      let models ={};
      try {
        const conCloud = mongoose.connections[1];
        if (conCloud.base.models['Cajas'] != null) {
          conCloud.deleteModel('Cajas');
          const CajasModel = conCloud.model('Cajas', Cajas);  
          models = {...models, CajasModel: CajasModel}
        }
        if (conCloud.base.models['AbrirCerrarTurno'] != null) {
          conCloud.deleteModel('AbrirCerrarTurno');
          const AbrirCerrarTurnoModel = conCloud.model('AbrirCerrarTurno', AbrirCerrarTurnosModel);  
          models = {...models, AbrirCerrarTurnoModel: AbrirCerrarTurnoModel}
        }
        if (conCloud.base.models['Usuarios'] != null) {
          conCloud.deleteModel('Usuarios');
          const UsuariosModel = conCloud.model('Usuarios', UsuariosModelCloud);  
          models = {...models, UsuariosModel: UsuariosModel}
        }
        if (conCloud.base.models['HistorialCajas'] != null) {
          conCloud.deleteModel('HistorialCajas');
          const HistorialCajaModel = conCloud.model('HistorialCajas', HistorialCajasModel);  
          models = {...models, HistorialCajasModel: HistorialCajaModel}
        }
       
        return models;
      } catch (error) {
        console.log(error);
        return {};
      }
      
    }
    async function getModels(arrayKeysModel){
      try {
        let models ={};

        const conCloud = mongoose.connections[1];
       
        const schemas = conCloud.base.modelSchemas;
       
        arrayKeysModel.forEach(key => {
          if (conCloud.base.models[key] != null) {
            conCloud.deleteModel(key);
           
          }
          const ModelCloud = conCloud.model(key, schemas[key]);  
          models = {...models, [key] : ModelCloud}
          
        });
        
        return models;
      } catch (error) {
        
      }
    }

    async function changeDateCatalogoUpdate(empresa, catalogo, fecha_updated){
      try {
      
      
        const conCloud = mongoose.connections[1];
     
        if (conCloud.base.models['Update'] != null) {
          conCloud.deleteModel('Update');
        }
        const UpdatedModelCloud = conCloud.model('Update', UpdatedModel);  
        await UpdatedModelCloud.findOneAndUpdate({empresa: empresa, catalogo: catalogo},{fecha_updated: fecha_updated});
        return true; 
      } catch (error) {
        console.log(error)
        return false;
      
      }
    }
   var responseReturn = {
       GetInitialData:
       async function  (empresa, sucursal, conCloud, data) {
        
            return await initialData(empresa, sucursal, data);
        },
        DoVenta:
        async function  (empresa, sucursal, cliente, new_venta, historialCajaInstance, productos, puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,fecha_venta, credito, forma_pago, tipo_venta, productos_base,montos_en_caja, haveInstance) {
             
          let resp = await doVenta(empresa, sucursal, cliente, new_venta, historialCajaInstance, productos, puntos_totales_venta,userCaja,almacenPrincipal, cajaActual,fecha_venta, credito, forma_pago, tipo_venta, productos_base,montos_en_caja, haveInstance);
          return resp;
        },
        MakeStaticModels:
        async function(empresa){
          return await makeStaticModels(empresa);
        },
        GetUpdates:
        async function(empresa, sucursal,fecha_updated_bd_local){
        
          return await getUpdates(empresa, sucursal,fecha_updated_bd_local);
        },
        GetUsuario:
        async function  (numero_usuario) {
            return await getUsuario(numero_usuario);
        },
        openTurno:
        async function  (turno, historialCaja, activa) {
            return await openTurno(turno, historialCaja, activa);
        },
        changeDateCatalogoUpdate:
        async function  (empresa, catalogo, fecha_updated) {
            return await changeDateCatalogoUpdate(empresa, catalogo, fecha_updated);
        },
        getModels:
        async function (arrayKeysModel){
          return await getModels(arrayKeysModel);
        }
    
   };

    return responseReturn;
};

module.exports =  CloudFunctions();