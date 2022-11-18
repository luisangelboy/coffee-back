const { crearTalla, actualizarTalla, eliminarTalla, obtenerTallas } = require('../controllers/tallas.controller');
const { crearColor, actualizarColor, eliminarColor, obtenerColores } = require('../controllers/colores.controller');
const { crearEmpresa, actualizarEmpresa, obtenerEmpresa } = require("../controllers/empresa.controller");
const { crearCliente, actualizarCliente, eliminarCliente, obtenerClientes } = require('../controllers/clientes.controller');
const { crearSucursal, crearMovimientoCuenta, obtenerHistorialCuenta, editarSucursal, obtenerSucursalesEmpresa, editarPasswordSucursal,sesionSucursal, obtenerDatosSucursal } = require("../controllers/sucursal.controller");
const { obtenerAlmacenes, crearAlmacen, actualizarAlmacen, eliminarAlmacen,obtenerProductosAlmacenes } = require("../controllers/almacen.controller");
const { verifyUserName, crearUsuario, obtenerAccesoPermiso, actualizarUsuario, eliminarUsuario, obtenerUsuarios, logearUsuario, asignarAccesosUsuario, actualizarBDLocal } = require('../controllers/usuarios.controller');
const { crearDepartamentos, obtenerDepartamentos, actualzarDepartamentos, eliminarDepartamento } = require("../controllers/departamentos.controller");
const { crearCategoria, crearSubcategoria, actualizarCategoria, actualizarSubcategoria, eliminarCategoria, eliminarSubcategoria, obtenerCategorias } = require("../controllers/categorias.controller");
const { eliminarMarca, actualzarMarcas, crearMarcas, obtenerMarcas } = require('../controllers/marcas.controller');
const { crearProducto, crearProductoRapido, actualizarProducto, eliminarProducto, obtenerProductos, obtenerConsultasProducto, obtenerProductosInactivos, activarProducto } = require('../controllers/producto.controller');
const { crearContabilidad, actualzarContabilidad, eliminarContabilidad, obtenerContabilidad } = require("../controllers/contabilidad.controller");
const { crearCuenta, crearSubcuenta, actualizarSubcuenta, eliminarCuenta, eliminarSubcuenta, obtenerCuentas, actualizarCuenta } = require("../controllers/cuentas.controller");
const { crearCaja, obtenerCajasSucursal, eliminarCaja, actualizarCaja, obtenerPreCorteCaja, obtenerCortesDeCaja, obtenerCorteCaja } = require("../controllers/caja.controller");
const { crearHistorialCaja, obtenerHistorialCaja } = require("../controllers/historialCajas.controller");
const { crearConceptoAlmacen, actualizarConceptoAlmacen, eliminarConceptoAlmacen, obtenerConceptosAlmacen } = require("../controllers/conceptosAlmacen.controller");
const { crearDescuentoUnidad, actualizarDescuentoUnidad, desactivarDescuentoUnidad, eliminarDescuentoUnidad } = require("../controllers/descuentos.controllers");
const { crearCompra, crearCompraEnEspera, obtenerConsultaGeneralCompras, obtenerComprasRealizadas, obtenerComprasEnEspera, eliminarCompraEnEspera, cancelarCompra } = require("../controllers/compras.controller");
const { obtenerConsultaGeneralVentas, obtenerUnProductoVentas, obtenerProductosVentas, obtenerClientesVentas, createVenta, obtenerVentasSucursal, cancelarVentasSucursal, obtenerVentasReportes, obtenerVentasByVentaReportes,  subirVentasCloud, addModelsUpdated } = require('../controllers/ventas.controller');
const { obtenerProductoMovimientos } = require('../controllers/productoMovimiento.controller');
const { crearRegistroDeTurno, obtenerFiltroTurnos, subirTurnoCloud } =  require('../controllers/abrirCerrarTurnos');
const { crearTraspaso, obtenerProductosPorEmpresa, obtenerTraspasos } =  require('../controllers/traspasos.controller');
const { crearFactura, crearComplementoPago, obtenerCatalogosSAT, obtenerProductosOServicios, obtenerCodigoPostal,obtenerCfdiUses, crearSerieCFDI,obtenerSeriesCdfi, modificarDefaultSerie, eliminarSerie, crearCSDS, eliminarCSD, obtenerFacturas, obtenerDocumentCfdi } =  require('../controllers/facturacion.controller');
const { crearCodigoProducto, obtenerCodigosProducto, eliminarCodigoProducto } = require('../controllers/codigosProductos.controller');
const { crearCotizacion, obtenerCotizaciones } = require('../controllers/cotizaciones.controller');
const { crearEgreso, obtenerHistorialEgresos } = require('../controllers/egresos.controller');
const { crearAbono, obtenerHistorialAbonos, historialVentasACredito, crearAbonoVentaCredito, cancelarAbonoCliente, cancelarAbonoProveedor, obtenerAbonosProveedores } = require('../controllers/abonos.controller');
const {  someWhereOverTheRainbow } = require('../controllers/scripts.controller');
const { crearNotaCredito } = require("../controllers/notacredito.controller");

const resolvers = {
    Query: {
        //Datos Empresa
        obtenerEmpresa: (_, { id }) => obtenerEmpresa(id),
        //Sucursales Empresa
        obtenerDatosSucursal : (_, { id }) => obtenerDatosSucursal(id),
        obtenerSucursalesEmpresa: (_, { id }) => obtenerSucursalesEmpresa(id),
        obtenerHistorialCuenta: (_, { empresa, sucursal, input, tipo, limit, offset }) => obtenerHistorialCuenta(empresa, sucursal, input, tipo, limit, offset),
        //Almacen Sucursales
        obtenerAlmacenes: (_, { id, filter }) => obtenerAlmacenes(id, filter),
        obtenerProductosAlmacenes: (_, { input, limit, offset  }) => obtenerProductosAlmacenes(input, limit, offset ),
        //Tallas
        obtenerTallas: (_, { empresa, tipo  }) => obtenerTallas(empresa, tipo),
        //Colores
        obtenerColores: (_, { empresa }) => obtenerColores(empresa),
        //Clientes
        obtenerClientes: (_, { tipo, filtro, empresa, eliminado, limit, offset }) => obtenerClientes(tipo, filtro, empresa, eliminado, limit, offset),
        //Usuarios
        obtenerUsuarios: (_, { empresa, sucursal, filtro, eliminado }) => obtenerUsuarios(empresa, sucursal, filtro, eliminado),
        //Departamentos
        obtenerDepartamentos: (_, { empresa, sucursal }) => obtenerDepartamentos(empresa, sucursal),
        //Contabilidad
        obtenerContabilidad: (_, { empresa, sucursal }) => obtenerContabilidad(empresa, sucursal),
        //Marcas
        obtenerMarcas: (_, { empresa, sucursal }) => obtenerMarcas(empresa, sucursal),
        //Categorias
        obtenerCategorias: (_, { empresa, sucursal }) => obtenerCategorias(empresa, sucursal),
        //Productos
        obtenerProductos: (_, { empresa, sucursal, filtro, almacen, existencias,limit, offset }) => obtenerProductos(empresa, sucursal, filtro, almacen, existencias, limit, offset),
        obtenerConsultasProducto: (_,{ empresa, sucursal }) => obtenerConsultasProducto(empresa, sucursal),
        obtenerProductosInactivos: (_,{ empresa, sucursal, id_almacen }) => obtenerProductosInactivos(empresa, sucursal, id_almacen),
        //Costos
        obtenerCuentas: (_, { empresa, sucursal }) => obtenerCuentas(empresa, sucursal),
        //Cajas
        obtenerCajasSucursal: (_, { empresa, sucursal }) => obtenerCajasSucursal(empresa, sucursal),
        obtenerPreCorteCaja: (_, { empresa, sucursal, input, cajaPrincipal }) => obtenerPreCorteCaja(empresa, sucursal, input, cajaPrincipal),
        obtenerCortesDeCaja: (_, { empresa, sucursal, input, limit, offset }) => obtenerCortesDeCaja(empresa, sucursal, input, limit, offset),
        obtenerCorteCaja: (_, { empresa, sucursal, input }) => obtenerCorteCaja(empresa, sucursal, input),
         //HistorialCajas
        obtenerHistorialCaja: (_, { input, id_Caja, empresa, sucursal, limit, offset }) => obtenerHistorialCaja( input, id_Caja, empresa, sucursal, limit, offset),
        //ConceptosAlmacen
        obtenerConceptosAlmacen: (_, { empresa, sucursal }) => obtenerConceptosAlmacen(empresa, sucursal),
        //Compras
        obtenerConsultaGeneralCompras: (_,{ empresa, sucursal }) => obtenerConsultaGeneralCompras(empresa, sucursal),
        obtenerComprasRealizadas: (_, { empresa, sucursal, filtro, fecha, limit, offset }) => obtenerComprasRealizadas(empresa, sucursal, filtro, fecha, limit, offset),
        obtenerComprasEnEspera: (_,{ empresa, sucursal, filtro, limit, offset }) => obtenerComprasEnEspera(empresa, sucursal, filtro, limit, offset),
        //Ventas
        obtenerConsultaGeneralVentas: (_,{empresa, sucursal}) => obtenerConsultaGeneralVentas(empresa, sucursal),
        obtenerUnProductoVentas: (_,{ empresa, sucursal, datosProductos }) => obtenerUnProductoVentas(empresa, sucursal, datosProductos),
        obtenerProductosVentas: (_,{ empresa, sucursal, input, limit, offset}) => obtenerProductosVentas(empresa, sucursal, input, limit, offset),
        obtenerClientesVentas: (_, { empresa, sucursal, limit, offset, filtro  }) => obtenerClientesVentas(empresa, sucursal, limit, offset, filtro),
        obtenerVentasSucursal: (_,{ empresa, sucursal, filtros, limit, offset }) => obtenerVentasSucursal(empresa, sucursal, filtros, limit, offset),
        obtenerVentasReportes: (_,{ empresa, sucursal, filtros, limit, offset }) => obtenerVentasReportes(empresa, sucursal, filtros, limit, offset),
        obtenerVentasByVentaReportes: (_,{ empresa, sucursal, filtros, limit, offset }) => obtenerVentasByVentaReportes(empresa, sucursal, filtros, limit, offset),
        //ProductoMovimietos
        obtenerProductoMovimientos: (_,{ empresa, sucursal, input, limit, offset }) => obtenerProductoMovimientos(empresa, sucursal, input, limit, offset),
        // Historial de Turnos
        obtenerFiltroTurnos: (_, { input, empresa, sucursal, limit, offset }) => obtenerFiltroTurnos( input, empresa, sucursal, limit, offset),
        //Traspasos
        obtenerProductosPorEmpresa: (_, { empresa, filtro, limit, offset}) => obtenerProductosPorEmpresa( empresa, filtro, limit, offset),
        obtenerTraspasos : (_, {input, limit, offset}) => obtenerTraspasos(input, limit, offset),
        //Codigos Productos SAT
        obtenerCodigosProducto: (_,{ empresa, sucursal }) => obtenerCodigosProducto(empresa, sucursal),
        //Facturacion
        obtenerCatalogosSAT: (_, {input}) => obtenerCatalogosSAT(input),
        obtenerProductosOServicios: (_, {input}) => obtenerProductosOServicios(input),
        obtenerCodigoPostal: (_, {input}) => obtenerCodigoPostal(input),
        obtenerCfdiUses: (_, {input}) => obtenerCfdiUses(input),
        obtenerSeriesCdfi: (_,{ empresa, sucursal }) => obtenerSeriesCdfi(empresa, sucursal),
        obtenerFacturas: (_, { empresa, sucursal, filtros, limit, offset }) => obtenerFacturas(empresa, sucursal, filtros, limit, offset),
        obtenerDocumentCfdi: (_, { id }) => obtenerDocumentCfdi(id),
        // Egresos Tesoreria
        obtenerHistorialEgresos: (_,{ input, empresa, sucursal }) => obtenerHistorialEgresos(input, empresa, sucursal),
        //Abonos
        obtenerAbonosProveedores: (_, { empresa, sucursal, filtro, limit, offset }) => obtenerAbonosProveedores(empresa, sucursal, filtro, limit, offset),
        obtenerHistorialAbonos: (_, { empresa, sucursal, input }) => obtenerHistorialAbonos(empresa, sucursal, input),
        historialVentasACredito: (_, { empresa, sucursal, idCliente,limit, offset }) => historialVentasACredito(empresa, sucursal, idCliente, limit, offset),
        
        // Permisos Accesos
        obtenerAccesoPermiso: (_, { input }) => obtenerAccesoPermiso(input),
        //Cotizaciones
        obtenerCotizaciones: (_, { empresa, sucursal }) => obtenerCotizaciones(empresa, sucursal),
    },
    Mutation: { 
        //Datos Empresa
        crearEmpresa: (_, { input }) => crearEmpresa(input),
		actualizarEmpresa: (_, { id, input }) => actualizarEmpresa(id, input),
        //Sucursales
        sesionSucursal: (_,{ input }) => sesionSucursal(input),
        crearSucursal: (_, { input, id }) => crearSucursal(input, id),
		editarSucursal: (_, { input, id }) => editarSucursal(input, id),
		editarPasswordSucursal: (_, { input, id }) => editarPasswordSucursal(input, id),
        crearMovimientoCuenta: (_, { input, empresa, sucursal, tipo}) => crearMovimientoCuenta(input, empresa, sucursal, tipo),
        //Almacen
        crearAlmacen: (_,{ input, id, empresa }) => crearAlmacen(input, id, empresa),
        actualizarAlmacen: (_,{ input, id }) => actualizarAlmacen(input, id),
        eliminarAlmacen: (_,{ id }) => eliminarAlmacen(id),
        //Departamentos
        crearDepartamentos: (_,{ input, empresa, sucursal }) => crearDepartamentos(input, empresa, sucursal),
        actualzarDepartamentos: (_,{ input, id, empresa, sucursal }) => actualzarDepartamentos(input, id,empresa, sucursal),
        eliminarDepartamento: (_,{ id, empresa, sucursal }) => eliminarDepartamento(id, empresa, sucursal),
        //Contabilidad
        crearContabilidad: (_,{ input, empresa, sucursal, usuario }) => crearContabilidad(input, empresa, sucursal, usuario),
        actualzarContabilidad: (_,{ input, id }) => actualzarContabilidad(input, id),
        eliminarContabilidad: (_,{ id }) => eliminarContabilidad(id),
       
        //Marcas
        crearMarcas: (_,{ input, empresa, sucursal }) => crearMarcas(input, empresa, sucursal),
        actualzarMarcas: (_,{ input, id, empresa, sucursal  }) => actualzarMarcas(input, id, empresa, sucursal ),
        eliminarMarca: (_,{ id, empresa, sucursal }) => eliminarMarca(id, empresa, sucursal),
		
        //Tallas
		crearTalla: (_, { input }) => crearTalla(input),
		actualizarTalla: (_, { input, id, empresa, sucursal }) => actualizarTalla(input, id, empresa, sucursal ),
		eliminarTalla: (_, { input, id, empresa, sucursal   }) => eliminarTalla(input, id, empresa, sucursal  ),

        //Colores
		crearColor: (_, { input }) => crearColor(input),
		actualizarColor: (_, { input, id,  empresa, sucursal }) => actualizarColor(input, id,  empresa, sucursal ),
		eliminarColor: (_, { id,  empresa, sucursal  }) => eliminarColor(id,  empresa, sucursal ),

        //Clientes
		crearCliente: (_, { input}) => crearCliente(input),
		actualizarCliente: (_, { input, id, empresa, sucursal}) => actualizarCliente(input, id, empresa, sucursal),
		eliminarCliente: (_, { id, empresa, sucursal }) => eliminarCliente(id, empresa, sucursal),
        //Usuarios
        verifyUserName: (_, { username }) => verifyUserName(username),
		crearUsuario: (_, { input }) => crearUsuario(input),
		actualizarUsuario: (_, {  id, input, empresa, sucursal }) => actualizarUsuario(id, input,empresa, sucursal),
		eliminarUsuario: (_, { id }) => eliminarUsuario(id),
        logearUsuario: (_, { input }) => logearUsuario(input),
        asignarAccesosUsuario: (_, {input, id }) => asignarAccesosUsuario(input, id),
        actualizarBDLocal: (_, {empresa, sucursal }) => actualizarBDLocal(empresa, sucursal),
        //Categorias
		crearCategoria: (_, { input }) => crearCategoria(input),
        crearSubcategoria: (_, { input, idCategoria,empresa, sucursal }) => crearSubcategoria(input, idCategoria,empresa, sucursal),
		actualizarCategoria: (_, { input, idCategoria,empresa, sucursal}) => actualizarCategoria(input, idCategoria,empresa, sucursal),
        actualizarSubcategoria: (_, { input, idCategoria, idSubcategoria,empresa, sucursal }) => actualizarSubcategoria(input, idCategoria, idSubcategoria,empresa, sucursal),
		eliminarCategoria: (_, { idCategoria,empresa, sucursal }) => eliminarCategoria(idCategoria,empresa, sucursal),
        eliminarSubcategoria: (_, { idCategoria, idSubcategoria,empresa, sucursal }) => eliminarSubcategoria(idCategoria, idSubcategoria,empresa, sucursal),
        //Productos
		crearProducto: (_, { input }) => crearProducto(input),
        crearProductoRapido: (_, { input }) => crearProductoRapido(input),
		actualizarProducto: (_, { input, id, empresa, sucursal }) => actualizarProducto(input, id, empresa, sucursal),
		eliminarProducto: (_, { id, empresa, sucursal}) => eliminarProducto(id,empresa, sucursal),
        activarProducto: (_,{ id, empresa, sucursal }) => activarProducto(id, empresa, sucursal),
        //Costos
		crearCuenta: (_, { input }) => crearCuenta(input),
        crearSubcuenta: (_, { input, idCuenta, empresa, sucursal }) => crearSubcuenta(input, idCuenta, empresa, sucursal),
		actualizarCuenta: (_, { input, idCuenta, empresa, sucursal}) => actualizarCuenta(input, idCuenta, empresa, sucursal),
        actualizarSubcuenta: (_, { input, idCuenta, idSubcuenta, empresa, sucursal }) => actualizarSubcuenta(input, idCuenta, idSubcuenta, empresa, sucursal),
		eliminarCuenta: (_, { id, empresa, sucursal }) => eliminarCuenta(id, empresa, sucursal),
        eliminarSubcuenta: (_, { idCuenta, idSubcuenta, empresa, sucursal }) => eliminarSubcuenta(idCuenta, idSubcuenta, empresa, sucursal),
        //Cajes
        crearCaja:(_,{input, empresa, sucursal}) => crearCaja(input, empresa, sucursal),
        actualizarCaja: (_, { input, id }) => actualizarCaja(input, id),
        eliminarCaja: (_, { id }) => eliminarCaja(id),
        //HistorialCajas
        crearHistorialCaja:(_,{input, empresa, sucursal}) => crearHistorialCaja(input, empresa, sucursal),
        //Contabilidad
        crearConceptoAlmacen: (_,{ input, empresa, sucursal, usuario }) => crearConceptoAlmacen(input, empresa, sucursal, usuario),
        actualizarConceptoAlmacen: (_,{ input, id, empresa, sucursal}) => actualizarConceptoAlmacen(input, id, empresa, sucursal),
        eliminarConceptoAlmacen: (_,{ id, empresa, sucursal }) => eliminarConceptoAlmacen(id, empresa, sucursal),
        //Descuentos
        crearDescuentoUnidad: (_, { input, empresa, sucursal }) => crearDescuentoUnidad(input, empresa, sucursal),
        actualizarDescuentoUnidad: (_, { input, empresa, sucursal }) => actualizarDescuentoUnidad(input, empresa, sucursal),
        desactivarDescuentoUnidad: (_,{ input, id, empresa, sucursal }) => desactivarDescuentoUnidad(input, id, empresa, sucursal),
        eliminarDescuentoUnidad: (_,{ id, empresa, sucursal}) => eliminarDescuentoUnidad( id, empresa, sucursal),
        //Compras
        crearCompra: (_,{ input, empresa, sucursal, usuario }) => crearCompra(input, empresa, sucursal, usuario),
        crearCompraEnEspera: (_,{ input, empresa, sucursal, usuario }) => crearCompraEnEspera(input, empresa, sucursal, usuario),
        eliminarCompraEnEspera: (_,{ id }) => eliminarCompraEnEspera( id),
        cancelarCompra: (_, {empresa, sucursal, id_compra, data_sesion}) => cancelarCompra(empresa, sucursal, id_compra, data_sesion),
        //Abrir Cerrar Turno
        crearRegistroDeTurno: (_,{ input, activa}) => crearRegistroDeTurno(input, activa),
        subirTurnoCloud: (_,{ input, activa, isOnline}) => subirTurnoCloud(input, activa, isOnline),
        //Traspasos
        crearTraspaso : (_,{ input, empresa, usuario }) => crearTraspaso(input, empresa,  usuario),
        //Facturacion
        crearFactura : (_,{ input }) => crearFactura(input),
        crearComplementoPago : (_,{ input }) => crearComplementoPago(input),
        crearSerieCFDI : (_,{ input }) => crearSerieCFDI(input),
        modificarDefaultSerie : (_,{ id, empresa, sucursal }) => modificarDefaultSerie( id, empresa, sucursal ),
        eliminarSerie : (_,{ id }) => eliminarSerie( id),
        crearCSDS : (_,{ input }) => crearCSDS(input),
        eliminarCSD: (_,{ rfc, empresa }) => eliminarCSD(rfc, empresa),
        //Codigos Productos SAT
        crearCodigoProducto: (_,{ input }) => crearCodigoProducto(input),
        eliminarCodigoProducto: (_,{ id }) => eliminarCodigoProducto( id),
        //Ventas
        // createVenta: (_,{ input, empresa, sucursal, usuario }) => console.log(input, empresa, sucursal, usuario),
        createVenta: (_,{ input, empresa, sucursal, usuario, caja, isOnline }) => createVenta(input, empresa, sucursal, usuario,caja, isOnline),
        cancelarVentasSucursal: (_,{ empresa, sucursal, folio, input }) => cancelarVentasSucursal(empresa, sucursal, folio, input),
        subirVentasCloud: (_,{ arrayVentasCloud }) => subirVentasCloud( arrayVentasCloud ),
        addModelsUpdated: (_,{ empresa }) => addModelsUpdated(empresa),
        // Cotizaciones
        crearCotizacion: (_, {input, empresa, sucursal, usuario, caja}) => crearCotizacion(input, empresa, sucursal, usuario, caja),
        // Egresos Tesoreria
        crearEgreso: (_, {input, empresa, sucursal}) => crearEgreso(input, empresa, sucursal),
        //Abonos
        crearAbono: (_, {  empresa, sucursal, input }) => crearAbono( empresa, sucursal, input),
        crearAbonoVentaCredito: (_, {  empresa, sucursal, input }) => crearAbonoVentaCredito( empresa, sucursal, input),
        cancelarAbonoCliente : (_, {  empresa, sucursal, input }) => cancelarAbonoCliente( empresa, sucursal, input),
        cancelarAbonoProveedor : (_, {  empresa, sucursal, input }) => cancelarAbonoProveedor( empresa, sucursal, input),
        //Script
        someWhereOverTheRainbow: (_, {  empresa, sucursal }) => someWhereOverTheRainbow( empresa, sucursal),
        //nota credito
        crearNotaCredito: (_,{ input, empresa, sucursal, turno }) => crearNotaCredito(input, empresa, sucursal, turno),
    }
};

module.exports = resolvers;



