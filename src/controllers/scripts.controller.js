const ScriptsCtrl = {};
const ProductoModel = require("../models/Producto");
const TraspasosModel = require("../models/Traspasos");
const ProductosAlamacen = require("../models/Productos_almacen");
const ProductoMovimiento = require("../models/ProductoMovimiento");
const ComprasModel = require("../models/Compras");


const AbonosModel = require("../models/Abonos");
const UnidadVentaModel = require("../models/Unidad_venta_producto");
const VentasModel = require("../models/Ventas");
const HistorialCajasModel = require("../models/HistorialCajas");
const AbrirCerrarTurnosModel = require("../models/AbrirCerrarTurnos");
const Almacen = require("../models/Almacen");

const Cajas = require("../models/Cajas");
const Categorias = require("../models/Categorias");
const Clientes = require("../models/Clientes");
const CodigosProductosSat = require("../models/CodigosProductosSat");
const Colores = require("../models/Colores");

const CompraEnEspera = require("../models/CompraEnEspera");
const ConceptoAlmacen = require("../models/ConceptoAlmacen");
const Contabilidad = require("../models/Contabilidad");
const Cotizacion = require("../models/Cotizacion");
const Cuentas = require("../models/Cuentas");
const Departamentos = require("../models/Departamentos");
const Egresos = require("../models/Egresos");
const Empresa = require("../models/Empresa");
const Factura = require("../models/Factura");
const Marcas = require("../models/Marcas");
const SerieCFDI = require("../models/SerieCFDI");
const Sucursal = require("../models/Sucursal");
const Tallas = require("../models/Tallas");
const Usuarios = require("../models/Usuarios");

ScriptsCtrl.someWhereOverTheRainbow = async (empresa, sucursal) =>{
    
    try {
  
       
     /*   await ProductoModel.collection.drop();
       await  UnidadVentaModel.collection.drop();
       await ProductosAlamacen.collection.drop();
       await ProductoMovimiento.collection.drop();
       await TraspasosModel.collection.drop(); 
       await  ComprasModel.collection.drop();
       await  VentasModel.collection.drop();
       await  HistorialCajasModel.collection.drop();
       await  AbrirCerrarTurnosModel.collection.drop();
       await  AbonosModel.collection.drop(); 
       await  Almacen.collection.drop(); 
       await  Cajas.collection.drop();  
       await  Categorias.collection.drop();   
       await  Clientes.collection.drop(); 
       await  CodigosProductosSat.collection.drop();  
       await  Colores.collection.drop();  
      
       await  CompraEnEspera.collection.drop();   
       await  ConceptoAlmacen.collection.drop();  
       await  Contabilidad.collection.drop(); 
       await  Cotizacion.collection.drop(); 
       await  Cuentas.collection.drop(); 
       await  Departamentos.collection.drop(); 
       await  Egresos.collection.drop(); 
       await  Empresa.collection.drop(); 
       await  Factura.collection.drop();  
       await  Marcas.collection.drop();  
       await  SerieCFDI.collection.drop();  
       await  Sucursal.collection.drop();  
       await  Tallas.collection.drop();  
       await  Usuarios.collection.drop();  */

       return {message:'SomeWhereOverTheRainbow Congratulations! New Collections '}
    } catch (error) {
        console.log(error)
        return {message:'SomeWhereOverTheRainbow Congratulations! New Collections '}
    }
}

module.exports = ScriptsCtrl;