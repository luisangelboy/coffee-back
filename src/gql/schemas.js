const { gql } = require('apollo-server');

const typeDefs = gql`
    scalar Date 
    type Token {
        token: String
    }
    ################### Producto ##################
    type ConsultasProductoSelect {
        categorias: [Categorias]
        departamentos: [Departamentos]
        marcas: [Marcas]
        colores: [Colores]
        tallas: [Tallas]
        centro_costos: [Cuentas]
        almacenes: [Almacen]
        calzados: [Calzado]
        codigos: [CodigosProductosSat]
    }
    type Calzado {
        _id: ID
        talla: String
        tipo: TiposTallas
        empresa: Empresa
        sucursal: Sucursal
    }
    type Productos {
        docs: [ProductoObject]
        totalDocs: Int
    }
  
    type ProductoObject {
        _id: ID
        datos_generales: DatosGenerales
        precios: Precios
        imagenes: [ImagenesBase]
        centro_de_costos: CentroDeCostos
        precio_plazos: PrecioPlazos
        empresa: String
        sucursal: String
        usuario: String
        unidades_de_venta: [UnidadesDeVenta]
        inventario_general: [InventarioGeneral]
        medidas_producto: [MedidaProductos]
        medidas_registradas: Boolean
    }
    type ProductoAlmacenEliminado {
        _id: ID
        producto: ProductosEliminado
        cantidad_existente: Float
        unidad_de_inventario: String
        codigo_unidad: String
        id_almacen: String
        eliminado: Boolean
        empresa: ID
        sucursal: ID
    }
    type ProductosEliminado {
        _id: ID
        datos_generales: DatosGenerales
        precios: Precios
    }
    type MedidaProductos {
        _id: ID
        unidad: String,
        codigo_unidad: String,
        cantidad: Int
        cantidad_nueva: Int
        almacen: ID
        codigo_barras: String
        color: ColorMedidaEditar
        descuento: DescuentoProductos
        descuento_activo: Boolean
        existencia: Boolean
        medida: MedidaMedidaEditar
        nombre_comercial: String
        precio: Float
        precio_unidad: PrecioProductos
    }
    type ColorMedidaEditar {
        hex: String
        nombre: String
        _id: ID
    }
    type MedidaMedidaEditar {
        talla: String
        tipo: String
        _id: ID
    }
    type InventarioGeneral {
        _id: String
        cantidad_existente: Float 
        unidad_inventario: String
        codigo_unidad: String
        cantidad_existente_maxima: Float
        unidad_maxima: String
        id_almacen_general: String
        eliminado: Boolean
    }
    type UnidadesDeVenta {
        _id: ID
        precio: Float
        cantidad: Int
        concepto: String
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        unidad_activa: Boolean,
        codigo_barras: String
        id_producto:String
        empresa: String
        sucursal: String
        descuento: DescuentoProductos
        descuento_activo: Boolean
        default: Boolean
        createdAt: Date
        updatedAt: Date
        precio_unidad: PrecioProductos
    }
    type ImagenesBase {
        url_imagen: String
        location_imagen: String
        key_imagen: String
        extencion_imagen: String
    }
    type PrecioPlazos {
        precio_cajas: [PrecioGeneralPlazos]
        precio_costales: [PrecioGeneralPlazos]
        precio_piezas: [PrecioGeneralPlazos]
        precio_tarimas: [PrecioGeneralPlazos]
    }
    type PrecioGeneralPlazos {
        plazo: String
        unidad: String
        codigo_unidad: String
        precio: Float
    }
    type CentroDeCostos {
        cuenta: String
        id_cuenta: String
        id_subcuenta: String
        subcuenta: String
    }
    type ClaveProductoSat {
        Name: String
        Value: String
    }
    type DatosGenerales {
        codigo_barras: String
        clave_alterna: String
        tipo_producto: String
        nombre_comercial: String
        nombre_generico: String
        descripcion: String
        id_categoria: ID
        categoria: String
        subcategoria: String
        id_subcategoria: ID
        id_departamento: ID
        departamento: String
        id_marca: ID
        marca: String
		clave_producto_sat: ClaveProductoSat
		receta_farmacia: Boolean
    }
    type Precios {
        ieps: Float
		ieps_activo: Boolean
        inventario: InventarioProducto
        iva: Float
        iva_activo: Boolean
        monedero: Boolean
        monedero_electronico: Float
        precio_de_compra: PrecioDeCompra
        precios_producto: [PrecioProductos]
        unidad_de_compra: UnidadDeCompraProducto
        granel: Boolean
        litros: Boolean
    }
    type PrecioDeCompra {
        precio_con_impuesto: Float
        precio_sin_impuesto: Float
        iva: Float
        ieps: Float
    }
    type InventarioProducto {
        inventario_minimo: Int
		inventario_maximo: Int
		unidad_de_inventario: String
        codigo_unidad: String
    }
    type UnidadDeCompraProducto {
        cantidad: Int
        precio_unitario_con_impuesto: Float
        precio_unitario_sin_impuesto: Float
        unidad: String
        codigo_unidad: String
    }
    type PrecioProductos {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }
    type ImagenesProducto {
        _id: ID
        url_imagen: String
        key_imagen: String
    }
################### Registro de producto ###################
    input CrearProductoInput {
        almacen_inicial: AlmacenInicialInput 
        centro_de_costos: CentroDeCostosInput
        datos_generales: DatosGeneralesInput
        empresa: String
        imagenes: [Upload]
        imagenes_eliminadas: [ImagenesEliminadasInput]
        precio_plazos: PrecioPlazosInput
        precios: PreciosInput
        presentaciones: [MedidaProductosInput]
        sucursal: String
        unidades_de_venta: [UnidadDeVentaProductoInput]
        usuario: String
        presentaciones_eliminadas: [MedidaProductosInput]
    }
    input CrearProductoRapidoInput {
        datos_generales: DatosGeneralesInput
        empresa: String
        precios: PreciosInput
        presentaciones: [MedidaProductosInput]
        sucursal: String
        unidades_de_venta: [UnidadDeVentaProductoInput]
        usuario: String
        presentaciones_eliminadas: [MedidaProductosInput]
        cantidad: Int
    }
    input PrecioPlazosInput {
        precio_cajas: [PrecioGeneralPlazosInput]
        precio_costales: [PrecioGeneralPlazosInput]
        precio_piezas: [PrecioGeneralPlazosInput]
    }
    input PrecioGeneralPlazosInput {
        plazo: String
        unidad: String
        codigo_unidad: String
        precio: Float
    }
    input CentroDeCostosInput {
        cuenta: String
        id_cuenta: ID
        id_subcuenta: ID
        subcuenta: String
    }
    input AlmacenInicialInput {
        id_almacen: ID
        almacen: String
        fecha_de_expiracion: Date
        cantidad: Int
    }
    input ClaveProductoSatInput {
        Name: String
        Value: String
    }
    input DatosGeneralesInput {
        codigo_barras: String
        clave_alterna: String
        tipo_producto: String
        nombre_comercial: String
        nombre_generico: String
        descripcion: String
        id_categoria: ID
        categoria: String
        subcategoria: String
        id_subcategoria: ID
        id_departamento: ID
        departamento: String
        id_marca: ID
        marca: String
		clave_producto_sat: ClaveProductoSatInput
		receta_farmacia: Boolean
    }
    input PreciosInput {
        ieps: Float
		ieps_activo: Boolean
        inventario: InventarioProdcutoInput
        iva: Float
        iva_activo: Boolean
        monedero: Boolean
        monedero_electronico: Float
        precio_de_compra: PrecioDeCompraInput
        precios_producto: [PrecioProductosInput]
        unidad_de_compra: UnidadDeCompraProductoInput
        granel: Boolean
        litros: Boolean
    }
    input PrecioDeCompraInput {
        ieps: Float
        iva: Float
        precio_con_impuesto: Float
        precio_sin_impuesto: Float
    }
    input InventarioProdcutoInput {
        inventario_maximo: Int
        inventario_minimo: Int
		unidad_de_inventario: String
        codigo_unidad: String
    }
    input UnidadDeCompraProductoInput {
        cantidad: Int
        precio_unitario_con_impuesto: Float
        precio_unitario_sin_impuesto: Float
        unidad: String
        codigo_unidad: String
    }
    input PrecioProductosInput {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }

    input UnidadDeVentaProductoInput {
        cantidad: Int
        default: Boolean
        precio: Float
        precio_unidad: PrecioProductosInput
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        codigo_barras: String
    }
    ################### Actualizar producto ###################
    input ActualizarProductoInput {
        almacen_inicial: EditarAlmacenInicialInput
        centro_de_costos: EditarCentroDeCostosInput
        datos_generales: EditarDatosGeneralesInput
        empresa: ID
        imagenes: [Upload]
        imagenes_eliminadas: [ImagenesEliminadasInput]
        precio_plazos: EditarPrecioPlazosInput
        precios: EditarPreciosInput
        sucursal: ID
        unidades_de_venta: [EditarUnidadDeVentaProductoInput]
        usuario: ID
        presentaciones: [MedidaProductosInput]
        presentaciones_eliminadas: [MedidaProductosInput]
    }
    
    input MedidaProductosInput {
        _id: ID
        unidad: String,
        codigo_unidad: String,
        cantidad: Int
        cantidad_nueva: Int
        codigo_barras: String
        almacen: ID
        color: ColorInputMedidaEditar
        existencia: Boolean
        medida: MedidaInputMedidaEditar
        nombre_comercial: String
        nuevo: Boolean
        precio: Float
        descuento: DescuentoProductosInput
        descuento_activo: Boolean
        precio_unidad: PrecioProductosInputEditar
    }
    input ColorInputMedidaEditar {
        hex: String
        nombre: String
        _id: ID
    }
    input MedidaInputMedidaEditar {
        talla: String
        tipo: String
        _id: ID
    }
    input EditarAlmacenInicialInput {
        id_almacen: ID
        almacen: String
        fecha_de_expiracion: Date
        cantidad: Int
        default_almacen: Boolean
    }
    input EditarCentroDeCostosInput {
        cuenta: String
        id_cuenta: ID
        id_subcuenta: ID
        subcuenta: String
    }
    input EditarDatosGeneralesInput {
        codigo_barras: String
        clave_alterna: String
        tipo_producto: String
        nombre_comercial: String
        nombre_generico: String
        descripcion: String
        id_categoria: ID
        categoria: String
        subcategoria: String
        id_subcategoria: ID
        id_departamento: ID
        departamento: String
        id_marca: ID
        marca: String
		clave_producto_sat: ClaveProductoSatInput
		receta_farmacia: Boolean
    }
    input ImagenesEliminadasInput {
        url_imagen: String
        location_imagen: String
        key_imagen: String
        extencion_imagen: String
    }
    input EditarPrecioPlazosInput {
        precio_cajas: [EditarPecioGeneralPlazosInput]
        precio_costales: [EditarPecioGeneralPlazosInput]
        precio_piezas: [EditarPecioGeneralPlazosInput]
    }
    input EditarPecioGeneralPlazosInput {
        _id: ID
        plazo: String
        unidad: String
        codigo_unidad: String
        precio: Float
    }
    input EditarPreciosInput {
        ieps: Float
		ieps_activo: Boolean
        inventario: InventarioProdcutoInput
        iva: Float
        iva_activo: Boolean
        monedero: Boolean
        monedero_electronico: Float
        precio_de_compra: PrecioDeCompraInput
        precios_producto: [PrecioProductosInputEditar]
        unidad_de_compra: UnidadDeCompraProductoInput
        granel: Boolean
        litros: Boolean
    }
    input PrecioProductosInputEditar {
        _id: ID
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }
    input EditarUnidadDeVentaProductoInput {
        _id: ID
        cantidad: Int
        codigo_barras: String
        unidad: String
        codigo_unidad: String
        default: Boolean
        id_producto: ID
        precio: Float
        unidad_principal: Boolean
        descuento: DescuentoProductosInput
        descuento_activo: Boolean
        precio_unidad: PrecioProductosInputEditar
    }
    ################### Codigo de catalogos productos SAT ###################
    type CodigosProductosSat {
        _id: ID
        Name: String
        Value: String
        empresa: Empresa
        sucursal: Sucursal
    }

    input CodigoCatalogoProductoInput {
        Name: String!
        Value: String!
        empresa: ID!
        sucursal: ID!
    }

    ################### Empresa ###################
    type Empresa {
        _id: ID
        nombre_empresa: String
        nombre_dueno: String
        telefono_dueno: String
        correo_empresa: String
        celular: String
        imagen: String
        nombre_fiscal: String
        rfc: String
        regimen_fiscal: String
        curp: String
        info_adicio: String
        valor_puntos: Float
        direccion: DireccionEmpresa
        direccionFiscal:DireccionFiscal
        datosBancarios: DatosBancarios
        sucursales_activas: Int
        limite_sucursales: Int
        limite_timbres: Int
        timbres_usados: Int
        cuenta_empresa: CuentaEmpresa
        sello_sat: Boolean
        nombre_cer: String
        nombre_key: String
        fecha_registro_sello_sat: String
        vender_sin_inventario: Boolean
        empresa_activa: Boolean
    }

    type CuentaEmpresa {
        efectivo: Float,
        bancario: Float
    }

    input IdEmpresa {
        id: Int
    }
    input CrearEmpresa {
        nombre_empresa: String
        nombre_dueno: String
        telefono_dueno: String
        correo_empresa: String
        celular: String
        imagen: Upload
        nombre_fiscal: String
        rfc: String
        regimen_fiscal: String
        curp: String
        info_adicio: String
        direccion: InputDireccionEmpresa
        direccionFiscal:InputDireccionFiscal
        datosBancarios: InputDatosBancarios
        password: String
        limite_timbres: Int
        timbres_usados: Int
        valor_puntos: Float
        sello_sat: Boolean
        nombre_cer: String
        nombre_key: String
        vender_sin_inventario: Boolean
        usuario: CrearUsuarioInput
        sucursal: CrearSucursal
        empresa_activa: Boolean
    }
  
    type DireccionEmpresa {
            calle: String
            no_ext: String
            no_int: String
            codigo_postal: String
            colonia: String
            municipio: String
            localidad: String
            estado: String
            pais: String
    }
     input InputDireccionEmpresa {
            calle: String
            no_ext: String
            no_int: String
            codigo_postal: String
            colonia: String
            municipio: String
            localidad: String
            estado: String
            pais: String
    }
    input EditarEmpresa {
        nombre_empresa: String
        nombre_dueno: String
        telefono_dueno: String
        correo_empresa: String
        celular: String
        imagen: Upload
        nombre_fiscal: String
        rfc: String
        regimen_fiscal: String
        curp: String
        info_adicio: String
        direccion: InputDireccionEmpresa
        direccionFiscal:InputDireccionFiscal
        datosBancarios: InputDatosBancarios
        valor_puntos: Float
        limite_timbres: Int
        timbres_usados: Int
        sello_sat: Boolean
        nombre_cer: String
        nombre_key: String
        vender_sin_inventario: Boolean
        empresa_activa: Boolean
		
    }
    input InputDireccionFiscal {
            calle: String
            no_ext: String
            no_int: String
            codigo_postal: String
            colonia: String
            municipio: String
            localidad: String
            estado: String
            pais: String
    }
    type DireccionFiscal {
            calle: String
            no_ext: String
            no_int: String
            codigo_postal: String
            colonia: String
            municipio: String
            localidad: String
            estado: String
            pais: String
    }
     input InputDatosBancarios {
        cuenta:String
        sucursal: String
        clave_banco:String
    }
    type DatosBancarios {
        cuenta:String
        sucursal: String
        clave_banco:String
    }
    ################### Sucursales ###################
    
    type Sucursal {
        _id: ID
        nombre_sucursal: String
        descripcion:  String
        usuario_sucursal: String
        password_sucursal: String,
        direccion: DireccionSucursal
        id_empresa: Empresa
        cuenta_sucursal: CuentaSucursal
        codigo_licencia: String
        fecha_inicio_licencia: String
        fecha_vencimiento_licencia: String
        licencia_activa: Boolean
    }

    type CuentaSucursal {
        efectivo: Float
    }

    input SesionSucursal {
        usuario_sucursal: String
        password_sucursal: String
    }
    input CrearSucursal {
        nombre_sucursal: String
        descripcion: String
        usuario_sucursal: String
        password_sucursal: String
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: Int
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
        codigo_licencia: String
        fecha_inicio_licencia: String
        fecha_vencimiento_licencia: String
        licencia_activa: Boolean
    }
    input EditarSucursal {
        nombre_sucursal: String
        descripcion: String
        direccion: DireccionInputSucursal
        digo_licencia: String
        fecha_inicio_licencia: String
        fecha_vencimiento_licencia: String
        licencia_activa: Boolean
    }
    input EditarPasswordSucursal {
        password_actual: String
        password_sucursal: String
        repeat_password_sucursal: String
    }
    input DireccionInputSucursal {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: Int
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    type DireccionSucursal {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: Int
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    ################### Almacenes ###################
    type Almacen {
        _id: ID
        nombre_almacen: String
        id_usuario_encargado: Usuarios
        id_sucursal: Sucursal
        empresa: Empresa
        direccion: DireccionAlmacen
        default_almacen: Boolean
    }
    input AlmacenMovimiento {
        _id: ID
        nombre_almacen: String
        default_almacen: Boolean
    }
    type DireccionAlmacen {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: String
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    input CrearAlmacen {
        nombre_almacen: String
        id_usuario_encargado: ID
        id_sucursal: String
        empresa: String
        direccion: InputDireccionAlmacen
    }
    input EditarAlmacen {
        nombre_almacen: String
        id_usuario_encargado:  String
        direccion: InputDireccionAlmacen
    }
    input InputDireccionAlmacen {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: String
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    input InputProductosAlmacenes{
        empresa: ID!, 
        sucursal: ID!, 
        filtro: String
    }

    type ProductosAlmacenes {
        docs: [ProductosAlmacenesObject]
        totalDocs: Int
    }

    type ProductosAlmacenesObject {
        _id: ID
        datos_generales: DatosGenerales
        precios: Precios
        imagenes: [ImagenesBase]
        centro_de_costos: CentroDeCostos
        precio_plazos: PrecioPlazos
        empresa: String
        sucursal: String
        usuario: String
        unidades_de_venta: [UnidadesDeVenta]
        inventario_general: [InventarioGeneral]
        medidas_producto: [MedidaProductos]
        medidas_registradas: Boolean
        existencia_almacenes: [ProductoAlmacenesExistentes]
        eliminado: Boolean
    }
    # type  {
    #     producto: Productos
    #     almacenes: [ProductoAlmacenesExistentes]
    # }
    type ProductoAlmacenesExistentes {
        _id: ExistenciaALmacenesProducto
        cantidad_existente: Float
        unidad_inventario: String
        cantidad_existente_maxima: Float
        unidad_maxima: String
    }
    type ExistenciaALmacenesProducto {
        producto: ID
        almacen: Almacen
    }
    
    input FilterProductoInput {
        codigo_barras: String
		clave_alterna: String
        tipo_producto: String
        nombre_comercial: String
        nombre_generico: String
        categoria: String
        subcategoria: String
    }
    ################### Tallas ###################
    type Tallas {
        _id: ID
        talla: String
        tipo: TiposTallas
        empresa: Empresa
        sucursal: Sucursal
    }
    enum TiposTallas {
        ROPA
        CALZADO
    }
    input CrearTallaInput {
		talla: String!
        tipo: TiposTallas!
		empresa: String!
        sucursal: String!
	}
    
    input ActualizarTallaInput {
		talla: String
        tipo: TiposTallas
	}
   ################### Colores ###################
   type Colores {
        _id: ID
        nombre: String
        hex: String
        empresa: Empresa
        sucursal: Sucursal
    }
    input CrearColorInput {
		nombre: String!
        hex: String!
		empresa: String!
        sucursal: String!
	}
    
    input ActualizarColorInput {
		nombre: String
        hex: String
    }
    ################### CLIENTES ###################
    type Clientes {
        docs: [ClientesObj]
        totalDocs: Int
    }

    type ClientesObj {
        _id: ID
        numero_cliente: Int
        clave_cliente: String
        representante: String
        nombre_cliente: String
        rfc: String
        curp: String
        telefono: String
        celular: String
        email: String
        numero_descuento: Int
        limite_credito: Int
        dias_credito: String
        razon_social: String
        direccion: DireccionCliente
        imagen: String
        estado_cliente: Boolean
        tipo_cliente: TiposCliente
        fecha_nacimiento: String
	    fecha_registro: String
        eliminado: Boolean
        banco: String
        numero_cuenta: String
        empresa: Empresa
        sucursal: Sucursal
        monedero_electronico: Float
        credito_disponible: Float
    }
    type DireccionCliente {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: String
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    enum TiposCliente {
        CLIENTE
        PROVEEDOR
    }
    input CrearClienteInput {
        clave_cliente: String
        representante: String!
        nombre_cliente: String!
        rfc: String
        curp: String
        telefono: String!
        celular: String
        email: String!
        numero_descuento: Int
        limite_credito: Int
        dias_credito: String
        razon_social: String
        direccion: DireccionInputCliente
        imagen: Upload
        estado_cliente: Boolean!
        tipo_cliente: TiposCliente!
        fecha_nacimiento: String
        banco: String
        numero_cuenta: String
        empresa: String!
        sucursal: String!
        monedero_electronico: Float
        credito_disponible: Float
	}
    input DireccionInputCliente {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: String
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    
    input ActualizarClienteInput {
        representante: String
        nombre_cliente: String
        rfc: String
        curp: String
        telefono: String
        celular: String
        email: String
        numero_descuento: Int
        limite_credito: Int
        dias_credito: String
        razon_social: String
        direccion: DireccionInputCliente
        imagen: Upload
        estado_cliente: Boolean
        tipo_cliente: TiposCliente
        fecha_nacimiento: String
        fecha_registro: String
        eliminado: Boolean
        banco: String
        numero_cuenta: String
        monedero_electronico: Float
        credito_disponible: Float
	}
    ######### USUARIOS ############
    type Usuarios {
        _id: ID
        username_login: String
        numero_usuario: Int
        nombre: String
        turno_en_caja_activo: Boolean
        password: String
        telefono: String
        celular: String
        email: String
        direccion: DireccionCliente
        imagen: String
        estado_usuario: Boolean
        empresa: Empresa
        sucursal: Sucursal
        accesos: ArregloDeAccesos
        eliminado: Boolean
    }
    
    type ArregloDeAccesos {
        catalogos: AccesoCatalogos
        mi_empresa: AccesoMiEmpresa
        compras: AccesoCompras
        tesoreria: AccesoTesoreria
        reportes: AccesoReportes
        ventas: AccesoVentas
        almacenes: AccesoAlmacenes
        facturacion: AccesoFacturacion
    }
    type CamposDelAcceso {
        ver: Boolean,
        agregar: Boolean,
        editar: Boolean,
        eliminar: Boolean
    }
    type AccesoCatalogos {
        clientes: CamposDelAcceso
        usuarios: CamposDelAcceso
        contabilidad: CamposDelAcceso
        provedores: CamposDelAcceso
        marcas: CamposDelAcceso
        productos: CamposDelAcceso
        tallas_numeros: CamposDelAcceso
        cajas: CamposDelAcceso
        departamentos: CamposDelAcceso
        categorias: CamposDelAcceso
        colores: CamposDelAcceso
        centro_costos: CamposDelAcceso
        conceptos_almacen: CamposDelAcceso
    }
    type AccesoFacturacion {
        generar_cdfi: CamposDelAcceso
        cdfi_realizados: CamposDelAcceso
        registro_series_cdfi: CamposDelAcceso
    }
    type AccesoMiEmpresa {
        datos_empresa: CamposDelAcceso
        informacion_fiscal: CamposDelAcceso
    }
    type AccesoCompras {
        abrir_compra: CamposDelAcceso
        compras_realizadas: CamposDelAcceso
        compras_espera: CamposDelAcceso
    }
    type AccesoTesoreria {
        cuentas_empresa: CamposDelAcceso
        egresos: CamposDelAcceso
        abonos_proveedores: CamposDelAcceso
        abonos_clientes: CamposDelAcceso
        caja_principal: CamposDelAcceso
    }
    type AccesoReportes {
        reporte_historial_cajas:CamposDelAcceso
        reporte_turnos:CamposDelAcceso
        reporte_compras: CamposDelAcceso
        reporte_ventas:CamposDelAcceso
        rerporte_almacen:CamposDelAcceso
        reporte_corte_caja:CamposDelAcceso
        reporte_tesoreria: CamposDelAcceso
    }
    type AccesoVentas {
        cancelar_venta: CamposDelAcceso
        precios_productos: CamposDelAcceso
        pre_corte: CamposDelAcceso
        cotizaciones:CamposDelAcceso
        administrador: CamposDelAcceso
        eliminar_ventas: CamposDelAcceso
        producto_rapido: CamposDelAcceso
    }
    type AccesoAlmacenes {
        almacen: CamposDelAcceso
        traspasos: CamposDelAcceso
        inventario_almacen:CamposDelAcceso
    }

    input CrearUsuarioInput {
        username_login: String
		numero_usuario: Int!
        nombre: String!
        password: String!
        repeatPassword: String!
        telefono: String!
        celular: String
        email: String!
        direccion: DireccionInputCliente
        imagen: Upload
        estado_usuario: Boolean!
        empresa: String!
        sucursal: String!
        turno_en_caja_activo: Boolean
        accesos: CrearArregloDeAccesosInput
	}
    input ActualizarUsuarioInput {
        username_login: String
        nombre: String
        password: String
        repeatPassword: String
        telefono: String
        celular: String
        email: String
        direccion: DireccionInputCliente
        imagen: Upload
        estado_usuario: Boolean
        accesos: CrearArregloDeAccesosInput
        eliminado: Boolean
    }
    input LogearUsuarioInput {
        numero_usuario: String!
        password: String!
        isOnline: Boolean
	}
    input ObtenerAccesoPermisosInput {
        numero_usuario: Float
        password: String
        departamento: String
        subDepartamento: String
        tipo_acceso: String
    }
    type AccesoLogin {
        permiso_concedido: Boolean
        departamento: String
        subDepartamento: String
    }
    input CrearArregloDeAccesosInput {
        catalogos: AccesoCatalogosInput
        mi_empresa: AccesoMiEmpresaInput
        compras: AccesoComprasInput
        tesoreria: AccesoTesoreriaInput
        reportes: AccesoReportesInput
        ventas: AccesoVentasInput
        almacenes: AccesoAlmacenesInput
        facturacion: AccesosFacturacionInput
    }
    input CamposDelAccesoInput {
        ver: Boolean,
        agregar: Boolean,
        editar: Boolean,
        eliminar: Boolean
    }
    input AccesosFacturacionInput {
        generar_cdfi: CamposDelAccesoInput
        cdfi_realizados: CamposDelAccesoInput
        registro_series_cdfi: CamposDelAccesoInput
    }
    input AccesoCatalogosInput {
        clientes: CamposDelAccesoInput
        usuarios: CamposDelAccesoInput
        marcas: CamposDelAccesoInput
        contabilidad: CamposDelAccesoInput
        provedores: CamposDelAccesoInput
        productos: CamposDelAccesoInput
        tallas_numeros: CamposDelAccesoInput
        cajas: CamposDelAccesoInput
        departamentos: CamposDelAccesoInput
        categorias: CamposDelAccesoInput
        colores: CamposDelAccesoInput
        centro_costos: CamposDelAccesoInput
        conceptos_almacen: CamposDelAccesoInput
    }
    input AccesoMiEmpresaInput {
        datos_empresa: CamposDelAccesoInput
        informacion_fiscal: CamposDelAccesoInput
    }
    input AccesoComprasInput {
        abrir_compra: CamposDelAccesoInput
        compras_realizadas: CamposDelAccesoInput
        compras_espera: CamposDelAccesoInput
    }
    input AccesoTesoreriaInput {
        cuentas_empresa: CamposDelAccesoInput
        egresos: CamposDelAccesoInput
        abonos_proveedores: CamposDelAccesoInput
        abonos_clientes: CamposDelAccesoInput
        caja_principal: CamposDelAccesoInput
    }
    input AccesoReportesInput {
        reporte_historial_cajas:CamposDelAccesoInput
        reporte_turnos:CamposDelAccesoInput
        reporte_compras: CamposDelAccesoInput
        reporte_ventas:CamposDelAccesoInput
        rerporte_almacen:CamposDelAccesoInput
        reporte_corte_caja:CamposDelAccesoInput
        reporte_tesoreria: CamposDelAccesoInput
    }
    input AccesoVentasInput {
        cancelar_venta:CamposDelAccesoInput
        precios_productos:CamposDelAccesoInput
        pre_corte:CamposDelAccesoInput
        cotizaciones:CamposDelAccesoInput
        administrador: CamposDelAccesoInput
        eliminar_ventas: CamposDelAccesoInput
        producto_rapido: CamposDelAccesoInput
    }
    input AccesoAlmacenesInput {
        almacen: CamposDelAccesoInput
        traspasos: CamposDelAccesoInput
        inventario_almacen:CamposDelAccesoInput
    }
    
    ############# Departamentos ##############
    type Departamentos {
        _id: ID
        nombre_departamentos: String
        empresa: Empresa
        sucursal: Sucursal
    }
    input DepartamentosInput {
        nombre_departamentos: String
    }
    ############# Categorias ##############
    type Categorias {
        _id: ID
        categoria: String
        subcategorias: [Subcategorias]
        empresa: Empresa
        sucursal: Sucursal
    }
    
    type Subcategorias {
        _id: ID
        subcategoria: String
    }
    input CrearCategoriasInput {
        categoria: String!
        empresa: String!
        sucursal: String!
    }
    input CrearSubcategoriasInput {
        subcategoria: String!
    }
    input ActualizarCategoriasInput {
        categoria: String
    }
    input ActualizarSubcategoriasInput {
        subcategoria: String
    }
    ############# Marcas ##############
    type Marcas {
        _id: ID
        nombre_marca: String
        empresa: Empresa
        sucursal: Sucursal 
    }
    input MarcasInput {
        nombre_marca: String
    }
    ################### Contabilidad ##################
    type Contabilidad {
        _id: ID
        nombre_servicio: String
        empresa: Empresa
        sucursal: Sucursal 
        usuario: Usuarios
    }
    input ContabilidadInput {
        nombre_servicio: String
    }
    ############# Cajas #
    #############
    type Cajas {
        _id: ID
        numero_caja: Int
        activa: Boolean
        usuario_creador: Usuarios
        numero_usuario_creador: Int
        nombre_usuario_creador: String
        cantidad_efectivo_actual: Float
        dinero_en_banco: Float
        usuario_en_caja: Usuarios
        principal: Boolean
        empresa: Empresa
        sucursal: Sucursal 
    }
    input CrearCajasInput {
        usuario_creador: ID
        numero_usuario_creador: Int
        nombre_usuario_creador: String
    }
    # TYPE DE LA IFORMACION QUE ME RETORNARA AL EDITAR UNA CAJA
    type Caja {
        _id: ID
        numero_caja: Int
        activa: Boolean
    }
    input EditarCaja {
        activa: Boolean
        usuario_en_caja: ID
        turno_en_caja_activo: Boolean
    }
    #some message error/success
    type Message {
		message: String
	}
    ############# Costos ##############
    type Cuentas {
        _id: ID
        cuenta: String
        subcuentas: [subcuentas]
        empresa: Empresa
        sucursal: Sucursal
    }
    
    type subcuentas {
        _id: ID
        subcuenta: String
    }
    input CrearCuentasInput {
        cuenta: String!
        empresa: String!
        sucursal: String!
    }
    input CrearSubcuentasInput {
        subcuenta: String!
    }
    input ActualizarCuentasInput {
        cuenta: String
    }
    input ActualizarSubcuentasInput {
        subcuenta: String
    }
    ################### ConceptosAlmacen ##################
    type ConceptoAlmacen {
        _id: ID
        nombre_concepto: String
        origen: String
        destino: String
        editable: Boolean
        empresa: Empresa
        sucursal: Sucursal 
        usuario: Usuarios
    }
    input ConceptoAlmacenInput {
        nombre_concepto: String
        origen: String
        destino: String
    }
    ############# HistorialCajas ##############
    type HistorialCajas {
        docs: [historiaCajasObject]
        totalDocs: Int
    }

    type historiaCajasObject {
        tipo_movimiento: String
        concepto: String
        horario_turno: String
        numero_caja: Int
        numero_usuario_creador: Int
        nombre_usuario_creador: String
        hora_moviento: HoraMovimientoCaja
        fecha_movimiento: FechaMovimientoCaja
        montos_en_caja: MontosEnCaja
        totalDocs: Int
    }
    
    type HoraMovimientoCaja {
        hora: String
        minutos: String
        segundos: String
        completa: String
    }
    type FechaMovimientoCaja {
        year: String
        mes: String
        dia: String
        no_semana_year: String
        no_dia_year: String
        completa: String
    }
    input CrearHistorialCajasInput {
        tipo_movimiento: String
        concepto: String
        numero_caja: Int
        id_Caja: ID
        rol_movimiento: String
        horario_turno: String
        hora_moviento: HoraMovimientoCajaInput
        fecha_movimiento: FechaMovimientoCajaInput
        id_User: ID
        numero_usuario_creador: Int
        nombre_usuario_creador: String
        tipo_de_venta: String
        montos_en_caja: MontosEnCajaInput
        empresa: String
        sucursal: String
    }
    input HoraMovimientoCajaInput {
        hora: String
        minutos: String
        segundos: String
        completa: String
    }
    input FechaMovimientoCajaInput {
        year: String
        mes: String
        dia: String
        no_semana_year: String
        no_dia_year: String
        completa: String
    }
    input HistorialCajasInput {
        usuario: String
        tipo_movimiento: String
        fecha_incio: String
        fecha_fin: String
    }
    
    ############## Descuentos ##############
    type DescuentoProductos {
        cantidad_unidad: Float
        numero_precio: Float
        unidad_maxima: Boolean
        precio_general: Float
        precio_neto: Float
        precio_venta: Float
        iva_precio: Float
        ieps_precio: Float
        utilidad: Float
        porciento: Float
        dinero_descontado: Float
    }
    
    input DescuentoProductosInput {
        cantidad_unidad: Float
        numero_precio: Float
        unidad_maxima: Boolean
        precio_general: Float
        precio_neto: Float
        precio_venta: Float
        iva_precio: Float
        ieps_precio: Float
        utilidad: Float
        porciento: Float
        dinero_descontado: Float
    }

    input DescuentoUnidadesInput {
        _id: ID
        descuento_activo: Boolean
        descuento: DescuentoProductosInput
    }
    input ObjetoDescuentoUnidadesInput {
        descuentos: [DescuentoUnidadesInput]
    }
    input ActivarDescuentoUnidades { 
        descuento_activo: Boolean
    }
    ############## COMPRAS ##############
    type ConsultasGeneralesCompra {
        productos: [ProductoObject]
        almacenes: [Almacen]
        proveedores: [ClientesObj]
    }

    type Compras {
        docs: [ComprasObject]
        totalDocs:Int
    }
    type ComprasObject {
        _id: ID
        folio: String
        usuario: Usuarios
        empresa: Empresa
        sucursal: Sucursal
        proveedor: ProveedorCompra
        productos: [ProductosMovimientosObject]
        en_espera: Boolean
        almacen: AlmacenCompra
        compra_credito: Boolean
        fecha_vencimiento_credito: String
        credito_pagado: Boolean
        saldo_credito_pendiente: Float
        forma_pago: String
        descuento_aplicado: Boolean
        descuento: DescuentoCompra
        subtotal: Float
        impuestos: Float
        total: Float
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        estatus_credito:String
        status: String
    }
    type DescuentoCompra {
        porcentaje: Float
        cantidad_descontada: Float
        precio_con_descuento: Float
    }
    type AlmacenCompra {
        id_almacen: Almacen
        nombre_almacen: String
        default_almacen: Boolean
    }
    type ProveedorCompra {
        id_proveedor: ClientesObj
        clave_cliente: String
        numero_cliente: Int
        nombre_cliente: String
    }
    type ProductosCompra {
        producto: ProductoObject
        cantidad: Float
        cantidad_regalo: Float
        unidad_regalo: String
        cantidad_total: Float
        iva_total: Float
        ieps_total: Float
        costo: Float
        descuento_porcentaje: Float
        descuento_precio: Float
        mantener_precio: Boolean
        subtotal: Float
        impuestos: Float
        total: Float
    }

    input cancelarCompraInput {
        admin: Boolean
        sesion: sesionCompra
        turno: turnoCompra
    }
    input CrearCompraInput {
        _id: ID
        proveedor: ProveedorCompraInput
        productos: [DatosProductoCompra]
        almacen: AlmacenCompraInput
        en_espera: Boolean
        compra_credito: Boolean
        fecha_vencimiento_credito: String
        credito_pagado: Boolean
        saldo_credito_pendiente: Float
        forma_pago: String
        descuento_aplicado: Boolean 
        descuento: DescuentoCompraInput
        subtotal: Float!
        impuestos: Float!
        total: Float!
        fecha_registro: Date!
        turnoEnCurso: turnoCompra
        admin: Boolean
        sesion: sesionCompra
    }

    input sesionCompra {
        id_usuario: String
        nombre_usuario: String
        numero_usuario: Int
    }

    input turnoCompra {
        horario_en_turno: String
        numero_caja: Int
        id_caja: String
        id_usuario: String
        token_turno_user: String
        numero_usuario_creador: Int
        nombre_usuario_creador: String
    }

    input DescuentoCompraInput {
        porcentaje: Float
        cantidad_descontada: Float
        precio_con_descuento: Float
    }
    
    input AlmacenCompraInput {
        id_almacen: ID!
        nombre_almacen: String!
        default_almacen: Boolean!
    }
    input ProveedorCompraInput {
        id_proveedor: ID!
        clave_cliente: String
        numero_cliente: Int!
        nombre_cliente: String!
    }
    input DatosProductoCompra {
        producto: ActualizarProductoInput
        id_producto: ID
        cantidad: Float!
        cantidad_regalo: Float
        unidad_regalo: String
        cantidad_total: Float
        iva_total: Float
        ieps_total: Float
        costo: Float!
        descuento_porcentaje: Float
        descuento_precio: Float
        subtotal: Float!
        impuestos: Float!
        total: Float!
        impuestos_descuento: Float
        subtotal_descuento: Float
        total_descuento: Float
        mantener_precio: Boolean
    }
    ############## ProductoMoviminetos ##############
    type ProductosMovimientos {
        docs: [ProductosMovimientosObject]
        totalDocs: Int
        totalVenta: Float
    }

    type ProductosMovimientosObject {
        _id: ID
        id_compra: ID
        id_traspaso: ID
        id_venta: ID
        id_producto: ID
        id_proveedor: ID
        id_almacen: ID
        folio_compra: String
        almacen: DatosAlmacenPMovimiento
        proveedor: DatosProveedorPMovimiento
        producto: DatosProductoMovimiento
        concepto: String
        cantidad: Float
        cantidad_regalo: Float
        unidad_regalo: String
        cantidad_total: Float
        cantidad_venta: Float
        iva_total: Float
        ieps_total: Float
        costo: Float
        descuento_porcentaje: Float
        descuento_precio: Float
        compra_credito: Boolean
        venta_credito: Boolean
        forma_pago: String
        impuestos: Float
        mantener_precio: Boolean
        subtotal: Float
        total: Float
        medida: MedidaProductoMovimiento
        color: ColorProductoMovimiento
        unidad: String
        codigo_unidad: String
        id_unidad_venta: ID
        empresa: ID
        sucursal: ID
        usuario: ID
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        nota_credito: ProMovimNoaCreditoType
        venta: ObtenerVentasTypeObj
        compra: ComprasObject
        factura: [FacturaObject]
        precio_unidad: PrecioUnidadVentasType
        subtotal_antes_de_impuestos: Float
        precio_actual_object: ProductoUnidadVentasTypeActual
        granel_producto: GranelVentasType
        precio: Float
        precio_a_vender: Float
        precio_actual_producto: Float
        descuento_activo: Boolean
        default: Boolean
    }

    type ProMovimNoaCreditoType {
        id_nota_credito: ID
        cantidad_devuelta: Float
        cantidad_vendida: Float
        total: Float
    }

    type DatosAlmacenPMovimiento{
        id_almacen: ID
        nombre_almacen: String
        default_almacen: Boolean
    }
    type DatosProveedorPMovimiento {
        _id: ID
        clave_cliente: String
        numero_cliente: Int
        nombre_cliente: String
    }
    type DatosProductoMovimiento {
        almacen_inicial: AlmacenInicialPoductoMovimiento
        datos_generales: DatosGenerales
        precios: Precios
        unidades_de_venta: [UnidadesVentaProductoMovimineto]
    }
    type AlmacenInicialPoductoMovimiento {
        almacen: String
        cantidad: Float
        fecha_de_expiracion: String
        id_almacen: ID
        default_almacen: Boolean
    }
    type UnidadesVentaProductoMovimineto {
        cantidad: Float
        codigo_barras: String
        id_producto: String
        precio: Float
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        _id: String
        precio_unidad: PrecioUnidadVentasType
    }
        
    type MedidaProductoMovimiento {
        id_medida: ID
        medida: String
        tipo: String
    }
    type ColorProductoMovimiento {
        id_color: ID
        color: String
        hex: String
    }

    input ObteneReportesCompras {
        fecha_inicio: String
        fecha_fin: String
        proveedor: String
        metodo_pago: String
        forma_pago: String
        producto: String
        vencidas: Boolean
        vigentes: Boolean
        liquidadas: Boolean
    }
    
############## Compra en espera ##############
type AlmacenCompraEspera {
    id_almacen: ID
    nombre_almacen: String
    default_almacen: Boolean
}
type ProveedorCompraEspera {
    id_proveedor: ID
    clave_cliente: String
    numero_cliente: Int
    nombre_cliente: String
}
type CompraEnEspera {
    docs: [CompraEnEsperaObject]
    totalDocs: Int
}
type CompraEnEsperaObject {
        _id: ID
        proveedor: ProveedorCompraEspera
        almacen: AlmacenCompraEspera
        productos: [DatosProductoEnEspera]
        en_espera: Boolean
        empresa: ID
        sucursal: ID
        usuario: ID
        impuestos: Float
        subtotal: Float
        total: Float
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
    }
    type DatosProductoEnEspera {
        producto: ProductosEspera
        id_producto: ID
        cantidad: Float
        cantidad_regalo: Float
        unidad_regalo: String
        cantidad_total: Float
        iva_total: Float
        ieps_total: Float
        costo: Float
        descuento_porcentaje: Float
        descuento_precio: Float
        impuestos: Float
        mantener_precio: Boolean
        subtotal: Float
        total: Float,
        subtotal_descuento: Float
        total_descuento: Float
    }
    type ProductosEspera {
        almacen_inicial: AlmacenInicialPoductoMovimiento
        datos_generales: DatosGenerales
        precios: Precios
        imagenes: [ImagenesBase]
        centro_de_costos: CentroDeCostos
        precio_plazos: PrecioPlazos
        empresa: String
        sucursal: String
        usuario: String
        unidades_de_venta: [UnidadesDeVenta]
        presentaciones: [MedidaProductos]
    }
     ############## Ventas ##############
     type ConsultaGeneralVentas {
        _id: ID
        precio: Float
        cantidad: Int
        concepto: String
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        codigo_barras: String
        id_producto: ProductosUnidadVenta
        empresa: String
        sucursal: String
        descuento: DescuentoProductos
        descuento_activo: Boolean
        default: Boolean
        createdAt: Date
        updatedAt: Date
        inventario_general: [InventarioGeneral]
     }

     type ProductoSeleccionadoVentas {
        docs: [ProductoSeleccionadoVentasObj]
        totalDocs: Int
     }

     type ProductoSeleccionadoVentasObj {
        _id: ID
        precio: Float
        cantidad: Int
        concepto: String
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        codigo_barras: String
        id_producto: ProductosUnidadVenta
        empresa: String
        sucursal: String
        descuento: DescuentoProductos
        descuento_activo: Boolean
        default: Boolean
        createdAt: Date
        updatedAt: Date
        inventario_general: [InventarioGeneral]
        medida: MedidaMedidaVenta
        color: ColorMedidaVenta
        precio_unidad: PrecioUnidadVentasType
     }

     type PrecioUnidadVentasType {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
     }
     input PrecioUnidadVentasInput {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
     }
     type ColorMedidaVenta {
        hex: String
        nombre: String
        _id: ID
    }
    type MedidaMedidaVenta {
        talla: String
        tipo: String
        _id: ID
    }
    
     type ProductosUnidadVenta {
        _id: ID
        datos_generales: DatosGenerales
        precios: Precios
        imagenes: [ImagenesBase] 
        centro_de_costos: CentroDeCostos
        precio_plazos: PrecioPlazos
        empresa: String
        sucursal: String
        usuario: String
    }
    type ObtenerClientesVentas {
        docs: [ClientesVentasObject]
        totalDocs: Int
    }
    type ClientesVentasObject{
        _id: ID
        numero_cliente: Int
        clave_cliente: String
        nombre_cliente: String
        rfc: String
        curp: String
        telefono: String
        celular: String
        email: String
        numero_descuento: Int
        limite_credito: Int
        dias_credito: String
        razon_social: String
        direccion: DireccionClienteVentas
        imagen: String
        banco: String
        numero_cuenta: String
        monedero_electronico: Float
        credito_disponible: Float
    }
    type DireccionClienteVentas {
        calle: String
        no_ext: String
        no_int: String
        codigo_postal: String
        colonia: String
        municipio: String
        localidad: String
        estado: String
        pais: String
    }
    ############## Traspasos ##############
    input DatosTransporte {
        transporte: String
        placas: String
        nombre_encargado: String
    }
    input ConceptoTraspaso {
        _id: String
        nombre_concepto: String
        origen: String
        destino: String
        editable: Boolean
        
    }
    
    input MedidaProductosTraspasosInput {
        _id: ID
        unidad: String,
        codigo_unidad: String,
        cantidad: Int
        almacen: String
        codigo_barras: String
        color: ColorInputMedidaEditar
        descuento: DescuentoProductosInput
        descuento_activo: Boolean
        existencia: Boolean
        medida: MedidaInputMedidaEditar
        nombre_comercial: String  
        precio: Float
        precio_unidad: PrecioProductosInput
    }

    input NuevaMedidaProductosTraspasosInput {
        medida: MedidaProductosTraspasosInput
        nuevaCantidad: Int
    }
    input InventarioGeneralProducto {
        _id: String
        cantidad_existente: Float
        id_almacen_general: String
        eliminado: Boolean 
        unidad_inventario: String
        codigo_unidad: String
        cantidad_existente_maxima: Float
        unidad_maxima: String 
    }
    input ProductosTrasapasoInput {
        _id: String
        datos_generales: EditarDatosGeneralesInput
        medidas_producto:[MedidaProductosTraspasosInput]
        inventario_general: [InventarioGeneralProducto]
        unidades_de_venta: [EditarUnidadDeVentaProductoInput]
        precios: PreciosInput
        empresa: ID
        sucursal:ID
        usuario:ID 
       
    }
    input DatosProductosTraspaso{
        product_selected: ProductosTrasapasoInput
        new_medidas: [NuevaMedidaProductosTraspasosInput]
        cantidad_total: Float
        unidad_maxima: Boolean
    }    
    input CrearTraspasoInput {
        concepto_traspaso: ConceptoTraspaso
        almacen_origen: AlmacenMovimiento
        almacen_destino: AlmacenMovimiento
        datos_transporte: DatosTransporte
        productos:[DatosProductosTraspaso]
        fecha_registro: Date
        sucursalOrigen: String 
        sucursalDestino: String
    }
    input ConsultaTraspasosInput {
        empresa: ID
        sucursal:ID
        producto: String
        almacen_origen: ID
        almacen_destino: ID
        usuario: ID
        fecha_inicio: Date
        fecha_final: Date
    }
    type Traspasos {
        _id: ID
        concepto_traspaso:ConceptoAlmacen
        almacen_origen: Almacen
        almacen_destino: Almacen
        fecha_registro: Date
    }
    type ProductoTraspasos {
       
        datos_generales: DatosGenerales
        precios: Precios
        unidades_de_venta :UnidadesDeVenta
    }

    type TraspasosReportes {
        docs: [TraspasosReportesObject]
        totalDocs: Int
    }

    type TraspasosReportesObject{
        _id: ID
        producto: ProductoTraspasos
        id_traspaso: Traspasos
        id_producto: ID
        concepto: String
        almacen_origen: Almacen
        almacen_destino: Almacen
        medida:MedidaMedidaEditar
        color: ColorMedidaEditar
        unidad: String
        empresa: Empresa
        sucursal: Sucursal
        usuario: Usuarios
        concepto_traspaso: String 
        cantidad: String
    }

    type Traspaso {
        message: String
        resp: String
    }

    type ProductosEmpresaObject {
        _id: ID
        datos_generales: DatosGenerales
        precios: Precios
        imagenes: [ImagenesBase]
        centro_de_costos: CentroDeCostos
        precio_plazos: PrecioPlazos
        empresa: String
        usuario: String
        sucursal:String
    }

    type ProductosEmpresa {
        docs: [ProductosEmpresaObject]
        totalDocs: Int
    }

    ############## Ventas ##############
    type ProductosVentasId {
        datos_generales: DatosGenerales
        precios: Precios
        _id: ID
    }

    type ObtenerVentasType {
        docs: [ObtenerVentasTypeObj]
        totalDocs: Int
        totalVenta: Float
    }
    type ObtenerVentasTypeObj {
        _id: ID
        folio: String 
        cliente: ClientesObj
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        monedero: Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        factura: [FacturaObject]
        status: String
        tipo_emision: String
        observaciones: String
        forma_pago: String
        metodo_pago: String
        credito: Boolean
        descuento_general_activo: Boolean
        id_caja: Caja
        fecha_de_vencimiento_credito: String
        dias_de_credito_venta: String
        saldo_credito_pendiente: Float
        empresa: ID
        sucursal: ID
        usuario: Usuarios
        productos: [ProductoVentasType]
        fecha_registro: String
        montos_en_caja: MontosCaja
        abono_minimo: Float
        cambio: Float
        nota_credito: [NotasCreditoTypeObj]
    }

    input filtrosObtenerVentas {
        isDate: Boolean
        busqueda: String
        filtro: String
        vista: String
        turno: turnoVenta
        admin: Boolean
    }

    input filtrosReportesVentas {
        fecha_inicio: String
        fecha_fin: String
        metodo_pago: String
        forma_pago: String
        producto: String
        cliente: String
        usuario: String
        folio: String
        caja: String
        canceladas: Boolean
        facturadas: Boolean
        notas_credito: Boolean
        vencidas: Boolean
        vigentes: Boolean
        liquidadas: Boolean
    }

    input filtrosReportesVentasByVenta {
        fecha_inicio: String
        fecha_fin: String
        metodo_pago: String
        forma_pago: String
        cliente: String
        usuario: String
        folio: String
        caja: String
        tipo_emision: String
        canceladas: Boolean
        facturadas: Boolean
        notas_credito: Boolean
        publico_general: Boolean
        vencidas: Boolean
        vigentes: Boolean
        liquidadas: Boolean
    }

    input filtrosFactura {
        fecha: String
        metodo_pago: String
        forma_pago: String
        busqueda: String
    }

    type MontosCaja {
        monto_efectivo: MontoCajaValues
        monto_tarjeta_debito: MontoCajaValues
        monto_tarjeta_credito: MontoCajaValues
        monto_creditos: MontoCajaValues
        monto_monedero: MontoCajaValues
        monto_transferencia: MontoCajaValues
        monto_cheques: MontoCajaValues
        monto_vales_despensa: MontoCajaValues
    }
    type MontoCajaValues {
        monto: Float
        metodo_pago: String
    }

    type ProductoVentasType {
        _id: ID
        producto: ProductoObject
        id_producto: ProductoObject
        concepto: String
        cantidad: Int
        iva_total: Float
        ieps_total: Float
        subtotal_antes_de_impuestos: Float
        subtotal: Float
        impuestos: Float
        total: Float
        medida: MedidaVentasType
        color: ColorVentasType
        cantidad_venta: Float
        granel_producto: GranelVentasType
        precio: Float
        precio_a_vender: Float
        precio_actual_producto: Float
        default: Boolean
        unidad: String
        codigo_unidad: String
        id_unidad_venta: UnidadesDeVenta
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        precio_unidad: ProductoUnidadVentasType
        precio_actual_object: ProductoUnidadVentasTypeActual
        inventario_general: [InventarioGeneral]
        descuento_activo: Boolean
        descuento_producto: DescuentoProductos
    }

    type ProductoUnidadVentasType {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }

    type ProductoUnidadVentasTypeActual{
        cantidad_unidad: Float
        numero_precio: Float
        unidad_maxima: Boolean
        unidad_mayoreo: Int
        precio_general: Float
        precio_neto: Float
        precio_venta: Float
        iva_precio: Float
        ieps_precio: Float
        utilidad: Float
        porciento: Float
        dinero_descontado: Float
    }

    type GranelVentasType {
        granel: Boolean
        valor: Float
    }

    type MedidaVentasType {
        id_medida: ID
        medida: String
        tipo: String
    }

    type ColorVentasType {
        id_color: ID
        color: String
        hex: String
    }
    type CrearVentaType{
        message: String
        datos_to_save_storage: DataVentaStorageType
        done: Boolean
    }

    type VentasCloudType{
        message: String
        ventas_fail: [DataVentaStorageTypeFail]
        done: Boolean
    }
    type TurnoCloud{
        message: String
        done: Boolean
    }
    type DataVentaStorageTypeFail{
        new_venta: VentaObject
        historialCajaInstance: HistorialCajaType
        productos_base: [ProductosMovimientosObject]
        empresa:ID
        sucursal:ID
        cliente: ClientesObj
        productos: [ProductosAlmacenesObject]
        puntos_totales_venta: Float
        usuario: ID
        caja: ID
        credito: Boolean
        forma_pago: String
        montos_en_caja: MontosCaja
    }

    type DataVentaStorageType{
        new_venta: VentaObject
        historialCajaInstance: HistorialCajaType
        productos_base: [ProductosMovimientosObject]
    }
     
    type HistorialCajaType{
        _id: ID
        montos_en_caja: DatosMontosType
        id_movimiento: String
        tipo_movimiento: String
        concepto: String
        rol_movimiento: String
        id_Caja: ID
        numero_caja: Int
        horario_turno: String
        hora_moviento: HorasEntradaSalida
        fecha_movimiento: FechasEntradaSalida
        id_User: ID,
        numero_usuario_creador: Int,
        nombre_usuario_creador: String,
        empresa: ID,
        sucursal: ID,
    }
    type VentaObject{
        _id: ID
        folio: String
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        monedero: Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        status: String
        montos_en_caja: DatosMontosType
        credito: Boolean
        abono_minimo: Float
        saldo_credito_pendiente: Float,
        credito_pagado: Boolean,
        descuento_general_activo: Float,
        descuento_general: DescuentoGeneral,
        id_caja: ID,
        fecha_de_vencimiento_credito:String,
        dias_de_credito_venta: String,
        empresa:ID,
        sucursal:ID,
        usuario: ID,
        cliente: ClientesObj,
        year_registro: String,
        numero_semana_year: String,
        numero_mes_year: String,
        fecha_registro: String,
        
        forma_pago: String
        metodo_pago: String
        tipo_emision: String
       
        fecha_venta: String
        turno: String
    }
    input new_venta{
        _id: ID
        folio: String
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        monedero: Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        status: String
        montos_en_caja: DatosMontos
        credito: Boolean
        abono_minimo: Float
        saldo_credito_pendiente: Float
        credito_pagado: Boolean
        descuento_general_activo: Float
        descuento_general: DescuentoGeneralInput
        id_caja: ID
        fecha_de_vencimiento_credito:String
        dias_de_credito_venta: String
        empresa:ID
        sucursal:ID
        usuario: ID
        cliente: ClienteVentaCloudInput
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        forma_pago: String
        metodo_pago: String
        tipo_emision: String
       
        fecha_venta: String
        turno: String
    }
    input ClienteVentaCloudInput{
        _id: ID
        banco: String
        celular: String
        clave_cliente: String
        curp: String
        dias_credito: String
        direccion: DireccionInputCliente
        email: String
        imagen: String
        limite_credito: Int
        nombre_cliente: String
        numero_cliente: Int
        razon_social: String
        rfc: String
        telefono: String
        monedero_electronico: Float
        numero_descuento: Int
        numero_cuenta: String
        credito_disponible: Float
        fecha_nacimiento: String
        fecha_registro: String
        representante: String
        estado_cliente: Boolean
        tipo_cliente: TiposCliente
        eliminado: Boolean

        empresa: ID
        sucursal: ID
    }
    input historial_caja_instance{
        _id: ID
        montos_en_caja: DatosMontos
        id_movimiento: String
        tipo_movimiento: String
        concepto: String
        rol_movimiento: String
        id_Caja: ID
        numero_caja: Int
        horario_turno: String
        hora_moviento: HorasEntradaSalidaInput
        fecha_movimiento: FechasEntradaSalidaInput
        id_User: ID,
        numero_usuario_creador: Int,
        nombre_usuario_creador: String,
        empresa: ID,
        sucursal: ID,
    }
    input productos_base{
        _id: ID
        id_compra: ID
        id_venta:ID
        id_traspaso: ID
        id_producto: ID
        id_proveedor: ID
        id_almacen: ID
        folio_compra: String
        producto: ProductosVentasInput
        concepto: String
        cantidad: Float
        cantidad_regalo: Float
        unidad_regalo: String
        cantidad_total: Float
        cantidad_venta: Float
        iva_total: Float
        ieps_total: Float
        costo: Float
        descuento_porcentaje: Float
        descuento_precio: Float
        compra_credito: Boolean
        venta_credito: Boolean
        forma_pago: String
        impuestos: Float
        mantener_precio: Boolean
        subtotal: Float
        total: Float
        medida: MedidaProductoVentaInput
        color: ColorProductoVentasInput
        unidad: String
        codigo_unidad: String
        id_unidad_venta: ID
        empresa: ID
        sucursal: ID
        usuario: ID
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        precio_unidad: PrecioUnidadVentasInput
        subtotal_antes_de_impuestos: Float
        precio_actual_object: ProductoUnidadVentasInput
        granel_producto: ProductoGranelVentasInputVentas
        precio: Float
        precio_a_vender: Float
        precio_actual_producto: Float
        descuento_activo: Boolean
        default: Boolean
       
    }
    
    input VentasCloudInput{
        empresa:ID
        sucursal:ID
        cliente: ClienteVentaInput
        new_venta: new_venta
        historialCajaInstance: historial_caja_instance
        productos: [ProductosVentasInput]
        puntos_totales_venta: Float
        usuario: ID
        caja: ID
        credito: Boolean
        forma_pago: String
        productos_base: [productos_base]
        montos_en_caja: DatosMontos
    }

    input CrearVentasInput {
        folio: String
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        monedero: Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        montos_en_caja: DatosMontos
        credito: Boolean
        descuento_general_activo: Boolean
        descuento_general: DescuentoGeneralInput
        dias_de_credito_venta: String
        fecha_de_vencimiento_credito: String
        fecha_vencimiento_cotizacion: String
        cliente: ClienteVentaInput
        productos: [ProductosVentasInput]
        cambio: Float
        editar_cliente: Boolean
        puntos_totales_venta: Float
        observaciones: String
        forma_pago: String
        metodo_pago: String
        tipo_emision: String
        abono_minimo: Float
        fecha_venta: String
        turno: String
        saldo_favor: Float
    }
    type ConsultaCotizaciones {
        _id: ID
        folio: String
        ieps: Float
        impuestos: Float
        iva:Float
        monedero:Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        credito: Boolean
        dias_de_credito_venta: String
        fecha_de_vencimiento_credito: String
        fecha_vencimiento_cotizacion: String
        precio: Float
        cantidad: Int
        concepto: String
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        codigo_barras: String
        cliente: ClientesObj
        descuento_general_activo: Boolean
        descuento_general: DescuentoGeneral
        productos: [ProductoCotizacion] 
        empresa: String
        sucursal: String
        descuento: Float
        descuento_activo: Boolean
        id_caja: Caja
        usuario: Usuarios
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
     }
     
    type ProductoCotizacion{
        _id: ID
        cantidad: Int
        cantidad_venta: Float
        codigo_barras: String
        concepto: String
        default: Boolean
        id_unidad_venta: UnidadesDeVenta
        descuento: DescuentoProductos
        descuento_activo: Boolean
        granel_producto: GranelVentasType  
        iva_total: Float
        ieps_total: Float
        subtotal: Float
        impuestos: Float
        total: Float
        precio: Float
        precio_a_vender: Float
        precio_actual_producto: Float
        precio_anterior: Float
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        medida: MedidaMedidaEditar
        color: ColorMedidaEditar
        inventario_general: [InventarioGeneral]
        id_producto: ProductoObject
        iva_total_producto: Float
        ieps_total_producto: Float
        impuestos_total_producto: Float
        subtotal_total_producto: Float
        total_total_producto: Float
        precio_unidad: PrecioUnidadVentasType
        precio_actual_object: ProductoUnidadVentasTypeActual
    } 
    input DescuentoGeneralInput {
        cantidad_descontado: Float
        porciento: Float
        precio_con_descuento: Float
    }

    type DescuentoGeneral {
        cantidad_descontado: Float
        porciento: Float
        precio_con_descuento: Float
    }
    type DatosMontosType{
        monto_efectivo: MontoCajaClaveType
        monto_tarjeta_debito: MontoCajaClaveType
        monto_tarjeta_credito: MontoCajaClaveType
        monto_creditos: MontoCajaClaveType
        monto_monedero: MontoCajaClaveType
        monto_transferencia: MontoCajaClaveType
        monto_cheques: MontoCajaClaveType
        monto_vales_despensa: MontoCajaClaveType
    }  

    input DatosMontos {
        monto_efectivo: MontoCajaClaveInput
        monto_tarjeta_debito: MontoCajaClaveInput
        monto_tarjeta_credito: MontoCajaClaveInput
        monto_creditos: MontoCajaClaveInput
        monto_monedero: MontoCajaClaveInput
        monto_transferencia: MontoCajaClaveInput
        monto_cheques: MontoCajaClaveInput
        monto_vales_despensa: MontoCajaClaveInput
    }

    input ProductosVentasInput {
        _id: ID
        cantidad: Int
        cantidad_venta: Float
        codigo_barras: String
        concepto: String
        default: Boolean
        descuento: DescuentoProductosInput
        descuento_activo: Boolean
        granel_producto: ProductoGranelVentasInputVentas
        precio: Float
        precio_a_vender: Float
        precio_actual_producto: Float
        precio_anterior: Float
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        medida: MedidaProductoVentaInput
        color: ColorProductoVentasInput
        precio_seleccionado: Boolean
        inventario_general: [InventarioGeneralPrecioVentas]
        id_producto: ProductoPopulateVentas
        iva_total_producto: Float
        ieps_total_producto: Float
        impuestos_total_producto: Float
        subtotal_total_producto: Float
        total_total_producto: Float
        precio_unidad: ProductoUnidadVentasInput
        precio_actual_object: ProductoUnidadVentasInputActual

        almacen_inicial: AlmacenInicialInput
        datos_generales: DatosGeneralesInput
        precios:  PreciosProductoVentasInput
        unidades_de_venta: [UnidadDeVentaProductoInput]
    }

    input ProductoGranelVentasInputVentas {
        granel: Boolean
        valor: Float
    }

    input ProductoUnidadVentasInput {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
        porciento: Float
        dinero_descontado: Float
    }

    input ProductoUnidadVentasInputActual{
        cantidad_unidad: Float
        numero_precio: Float
        unidad_maxima: Boolean
        unidad_mayoreo: Int
        precio_general: Float
        precio_neto: Float
        precio_venta: Float
        iva_precio: Float
        ieps_precio: Float
        utilidad: Float
        porciento: Float
        dinero_descontado: Float
    }

    input ProductoUnidadVentaDescuento {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }

    input ColorProductoVentasInput {
        hex: String
        nombre: String
        _id: String

        id_color: String
        color:String
    }

    input MedidaProductoVentaInput {
        talla: String
        tipo: String
        _id: String
 
        id_medida: String
        medida:String
    }

    input InventarioGeneralPrecioVentas {
        cantidad_existente: Float
        cantidad_existente_maxima: Float
        unidad_inventario: String
        codigo_unidad: String
        unidad_maxima: String
        id_almacen_general: String
    }

    input ProductoPopulateVentas {
        _id: String
        imagenes: [ImagenesBaseInputProducto]
        datos_generales: DatosGeneralesVentasInput
        precios: PreciosProductoVentasInput
    }

    input ImagenesBaseInputProducto {
        url_imagen: String
    }

    input PreciosProductoVentasInput {
        ieps: Float
        ieps_activo: Boolean
        inventario: InventarioVentasInput
        iva: Float
        iva_activo: Boolean
        monedero: Boolean
        monedero_electronico: Float
        precio_de_compra: PrecioCompraProductoVentasInput
        precios_producto: [PreciosProductoPopulateVentasInput]
        unidad_de_compra: UnidadCompraProductoVentasInput

        granel: Boolean
        unidades_de_venta: [UnidadDeVentaProductoInput]
    }

    input UnidadCompraProductoVentasInput {
        cantidad: Int
        precio_unitario_con_impuesto: Float
        precio_unitario_sin_impuesto: Float
        unidad: String
        codigo_unidad: String
    }

    input PreciosProductoPopulateVentasInput {
        numero_precio: Int
        precio_neto: Float
        precio_venta: Float 
        iva_precio: Float
        ieps_precio: Float
        unidad_mayoreo: Int
        utilidad: Float
        precio_general: Float
        cantidad_unidad: Int
        unidad_maxima: Boolean
    }

    input PrecioCompraProductoVentasInput {
        precio_con_impuesto: Float
        precio_sin_impuesto: Float
        iva: Float
        ieps: Float
    }

    input InventarioVentasInput {
        inventario_maximo: Int
        inventario_minimo: Int
        unidad_de_inventario: String
        codigo_unidad: String
    }

    input DatosGeneralesVentasInput {
        clave_alterna: String
        codigo_barras: String
        nombre_comercial: String
        tipo_producto: String
        nombre_generico: String
        descripcion: String
        id_categoria: ID
        categoria: String
        subcategoria: String
        id_subcategoria: ID
        id_departamento: ID
        departamento: String
        id_marca: ID
        marca: String
        receta_farmacia: Boolean
        clave_producto_sat: ClaveProductoSatInput
    }

    input ProductoGranelVentasInput {
        granel: Boolean
        valor: Float
    }

    input ClienteVentaInput {
        _id: ID
        banco: String
        celular: String
        clave_cliente: String
        curp: String
        dias_credito: String
        direccion: DireccionInputCliente
        email: String
        imagen: String
        limite_credito: Int
        nombre_cliente: String
        numero_cliente: Int
        razon_social: String
        rfc: String
        telefono: String
        monedero_electronico: Float
        numero_descuento: Int
        numero_cuenta: String
        credito_disponible: Float
    } 

    input cancelarVentaInput {
        observaciones: String
        devolucion_efectivo: Boolean!
        devolucion_credito: Boolean!
        turno: turnoVenta
    }

    input turnoVenta {
        horario_en_turno: String
        numero_caja: Int
        id_caja: String
        usuario_en_turno: UsuarioTurnoInputCancelarVenta
        empresa: String
        sucursal: String
        fecha_entrada: String
    }
    input UsuarioTurnoInputCancelarVenta {
        _id: String
        nombre: String
        numero_usuario: Int
    }

    ############ ABRIR CERRAR TURNOS #####################
    type HorasEntradaSalida {
        hora: String,
        minutos: String,
        segundos: String,
        completa: String,
    }
    type FechasEntradaSalida {
        year: String,
        mes: String,
        dia: String,
        no_semana_year: String,
        no_dia_year: String,
        completa: String,
    }
    
    type AbrirCerrarTurno {
        docs: [abrirCerrarTurnoObject]
        totalDocs: Int
    }

    type abrirCerrarTurnoObject {
        _id: ID
        horario_en_turno: String
        token_turno_user: String
        concepto: String
        numero_caja: String
        id_caja: String
        comentarios: String
        hora_entrada: HorasEntradaSalida
        hora_salida: HorasEntradaSalida
        fecha_entrada: FechasEntradaSalida
        fecha_salida: FechasEntradaSalida
        montos_en_caja: MontosEnCaja
        fecha_movimiento: String
        id_usuario: String
        usuario_en_turno: Usuarios
        empresa: String
        sucursal: String
        onCloud: Boolean
    }

    input HorasEntradaSalidaInput {
        hora: String,
        minutos: String,
        segundos: String,
        completa: String,
    }
    input FechasEntradaSalidaInput {
        year: String,
        mes: String,
        dia: String,
        completa: String,
        no_semana_year: String,
        no_dia_year: String
    }
     
    input UsuarioTurnoInput {
        nombre: String
        telefono: String
        numero_usuario: Int
        email: String
    }
    input AbrirCerrarTurnoInput {
        _id: ID
        horario_en_turno: String
        token_turno_user: String
        concepto: String
        numero_caja: String
        rol_movimiento: String
        id_caja: ID!
        comentarios: String
        hora_entrada: HorasEntradaSalidaInput
        hora_salida: HorasEntradaSalidaInput
        fecha_entrada: FechasEntradaSalidaInput
        fecha_salida: FechasEntradaSalidaInput
        fecha_movimiento: String
        montos_en_caja: MontosEnCajaInput
        usuario_en_turno: UsuarioTurnoInput
        id_usuario: String!
        empresa: String!
        sucursal: String!
        montoRetiro: Float,
        onCloud: Boolean
    }
    input HistorialTurnosInput {
        horario_en_turno: String
        usuario_en_turno: String
        numero_caja: String
        fechaInicio: String
        fechaFin: String
    }
    
    ############ CORTES Y PRE CORTES DE CAJAS #####################
    type MontoPreCorteCaja {
        monto_efectivo_precorte: Float
    }
    input PreCortesDeCajaInput {
        horario_en_turno: String
        id_caja: String
        id_usuario: String
        token_turno_user: String
    }
    ### CORTES DE CAJA ###
    type FiltroCorteDeCaja {
        docs: [FiltroCorteDeCajaObject]
        totalDocs: Int
    }

    type FiltroCorteDeCajaObject {
        concepto: String
        token_turno_user: String
        numero_caja: Int
        horario_en_turno: String
        hora_salida: HoraMovimientoCaja
        fecha_movimiento: String
        fecha_salida: FechaMovimientoCaja
        usuario_en_turno: Usuarios
        montos_en_caja: MontosEnCaja
        id_caja: String
        comentarios: String
        sucursal: Sucursal
    }
    input FiltroCorteDeCajaInput {
        fecha_consulta: String
        usuario: String
        numero_caja: Int
    }
    
    type CorteDeCaja {
        montos_en_sistema: MontosEnSistemaCortes
        fecha_inicio: String
        fecha_fin: String
    }

    type MontosEnSistemaCortes {
        monto_efectivo: Float
        monto_tarjeta_debito: Float
        monto_tarjeta_credito: Float
        monto_creditos: Float
        monto_monedero: Float
        monto_transferencia: Float
        monto_cheques: Float
        monto_vales_despensa: Float
    }

    input CorteDeCajaInput {
        usuario: ID
        caja: ID
        number_user: Int
        token_turno_user: String
    }
     ### Facturacion ###
    type Factura {
        docs: [FacturaObject]
        totalDocs: Int
    }
     type FacturaObject {
        id_cfdi: String
        serie: String
        currency: String
        expedition_place: String
        folio: String
        cfdi_type: String
        payment_form: String
        payment_method: String
        logo_url: String
        date: String
        issuer: FacturaIssuer
        receiver: FacturaReceiver
        items: [FacturaItems]
        taxes: [TaxesGet]
        complement: complementType
        original_string: String
        sub_total: Float
        total: Float
        discount: Float
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        empresa: String
        sucursal: String
        id_venta: String
        folio_venta: String
        tipo: String
        complementos: [ComplementosPagos]
        id_nota: ID
    }

     type ComplementosPagos {
        id_cfdi: String
        serie: String
        currency: String
        expedition_place: String
        folio: String
        cfdi_type: String
        payment_form: String
        payment_method: String
        logo_url: String
        date: String
        issuer: FacturaIssuer
        receiver: FacturaReceiver
        items: [FacturaItems]
        taxes: [TaxesGet]
        complement: complementType
        original_string: String
        sub_total: Float
        total: Float
        discount: Float
        year_registro: String
        numero_semana_year: String
        numero_mes_year: String
        fecha_registro: String
        empresa: String
        sucursal: String
        id_venta: String
        folio_venta: String
        tipo: String
     }

     type RelatedDocuments {
        Uuid: String                    
        Folio: Float                   
        PaymentMethod: String
        PartialityNumber: Float
        PreviousBalanceAmount: Float
        AmountPaid: Float
    }

     type complementType {
        TaxStamp: TaxStamp
        Payments: [PaymentsType]
     }
     type PaymentsType {
         _id: ID
         RelatedDocuments: [RelatedDocumentsType]
         Date: String
         PaymentForm: String
         Currency: String
         Amount: Float
         ExpectedPaid: Float
     }

     type RelatedDocumentsType {
        _id: ID
        Uuid: String
        Folio: String
        Currency: String
        PaymentMethod: String
        PartialityNumber: Float
        PreviousBalanceAmount: Float
        AmountPaid: Float
        ImpSaldoInsoluto: Float
     }

     type TaxStamp {
        Uuid: String
        Date: String
        CdfiSign: String
        SatCertNumber: String
        SatSign: String
        RfcProvCertif: String
      },

     type TaxesGet {
        Total: Float
        Name: String
        Rate: Float
        Type: String
     }

     type FacturaIssuer {
        FiscalRegime: String
        Rfc: String
        TaxName: String
     }
     type FacturaReceiver {
        Rfc: String
        Name: String
        CfdiUse: String
    }
    type FacturaItems {
        ProductCode: String
        IdentificationNumber: String
        Description: String
        Unit: String
        UnitCode: String
        UnitPrice: String
        Quantity: String
        Subtotal: String
        Discount: String
        Taxes: [FacturaTaxes]
        Total: String
    }
    type FacturaTaxes {
        Total: String
        Name: String
        Base: String
        Rate: String
        IsRetention: String
    }

    type DownloadDocument {
        htmlBase64: String
        pdfBase64: String
        xmlBase64: String
    }

    input ConsultaSatInput {
        value: String
       
    }
    input ClientSatIssuer {
        FiscalRegime: String
        Rfc: String
        Name: String
    }
    input ClientSatReceiver {
        Rfc: String
        Name: String
        CfdiUse: String
    }
    input Taxes {
        Total: String
        Name: String
        Base: String
        Rate: String
        IsRetention: String
    }
    input ProductoFactura {
        ProductCode: String
        IdentificationNumber: String
        Description: String
        Unit: String
        UnitCode: String
        UnitPrice: String
        Quantity: String
        Subtotal: String
        Discount: String
        Taxes: [Taxes]
        Total: String
    }
    input CrearFacturaInput {
        serie: String
        currency: String
        expedition_place: String
        folio: String
        cfdi_type: String
        payment_form: String
        payment_method: String
        logo_url: String
        date: String
        issuer: ClientSatIssuer
        receiver: ClientSatReceiver
        items: [ProductoFactura]
        empresa: String!
        sucursal: String!
        id_venta: String!
        folio_venta: String!
    }

    input CrearComplementoPagoInput {
        id_venta: ID
        id_abono: ID
        id_cfdi: ID
    }

    input CrearCSDSInput {
        rfc: String!
        certificate: String!
        private_key: String!
        private_key_password: String!
        empresa: String!
        sucursal: String!
        nombre_key: String!
        nombre_cer: String!
    }
    type CatalogosSatConsulta {
        success: Boolean
        message: String
        currencies: [Currencies]
        paymentForms: [Payment]
        paymentMethods: [Payment]
        fiscalRegimens: [FiscalRegimens]
        cfdiTypes: [CfdiTypes]
    }

    type Currencies {
        Decimals: Float
        PrecisionRate: Int
        Name: String
        Value: String
    }
    type Payment {
        Name: String
        Value: String
    }
   
    type FiscalRegimens {
        Natural: Boolean
        Moral: Boolean
        Name: String
        Value: String
    }
    type CfdiTypes {
        NameId: Int
        Name: String
        Value: String
    }
    type ProductosOServiciosConsulta{
        success: Boolean
        message: String
        productosOServicios: [ProductosOServicios]
    }

    type ProductosOServicios {
        
        DangerousMaterial: String
        Complement:String
        Name: String
        Value: String
    }
    type CodigoPostalConsulta{
        success: Boolean
        message: String
        codigoPostal: [CodigoPostal]
    }

    type CodigoPostal {
        StateCode: String
        MunicipalityCode: String
        LocationCode: String
        Name: String
        Value: String
    }

      type CfdiUSesConsulta{
        success: Boolean
        message: String
        cfdiUses: [CfdiUses]
    }

    type CfdiUses {
        message: String
        Natural: Boolean
        Moral: Boolean
        Name: String
        Value: String
    }

    input CrearSerieCfdiInput {
        serie: String
        folio: Int
        default:Boolean
        empresa: ID
        sucursal: ID
    }

    type SerieCfdi {
        _id: ID
        serie: String
        folio: Int
        default:Boolean
    }
    type SeriesCfdiConsulta{
        success: Boolean
        message: String
        seriesCfdi: [SerieCfdi]
    }

     type CrearFactura {
        success: Boolean
        message: String
        pdf: String
        xml: String
    }

    # BUSQUEDA PRODUCTOS VENTAS PRINCIPAL

    input ObtenerProductosVentasInput {
        producto: String
    }


    #### FLUJO DE CUENTAS - TESORERIA, MOVIMIENTOS CONSULTAS ####

    input CrearMovimientoCuentaInput {
        tipo_movimiento: String
        id_usuario: String
        numero_caja: Int 
        rol_movimiento: String
        id_Caja: String
        numero_usuario_creador: String
        nombre_usuario_creador: String
        horario_turno: String
        
        concepto: String
        usuario_entrega: String
        origen_entrega: String
        fecha_movimiento_entrega: String
        hora_moviento: HoraMovimientoCajaInput
        fecha_movimiento: FechaMovimientoCajaInput
        montos_en_caja: MontosEnCajaInput
        comentarios: String
    }

    input ObtenerHistorialCuenta {
        fecha_inicio: String
        fecha_fin: String
        usuario: String
        tipo_movimiento: String
    }

    type HistorialFlujoDeCaja {
     docs: [MovimientoHistorial]
     saldo_en_caja: Float
     totalDocs: Int
 }

    #type HistorialFlujoDeCajaObj {
    #    movimientos: [MovimientoHistorial]
    #}

    type MovimientoHistorial {
        tipo_movimiento: String
        id_usuario: String
        numero_caja: Int 
        id_Caja: String
        numero_usuario_creador: String
        nombre_usuario_creador: String
        horario_turno: String
        concepto: String
        hora_moviento: HoraMovimientoCaja
        fecha_movimiento: FechaMovimientoCaja
        montos_en_caja: MontosEnCaja
        comentarios: String
        empresa: String
        sucursal: String
    }

    #### FLUJO DE EGRESOS EN TESORERIA ####

    type Egresos {
        folio_egreso: String
        folio_factura: String
        empresa_distribuidora: String
        provedor: String
        productos: [ProductosEgresos]
        categoria: String
        subCategoria: String
        metodo_pago: String
        fecha_compra: String
        fecha_registro: String
        fecha_vencimiento: String
        observaciones: String
        compra_credito: Boolean
        credito_pagado: Boolean
        saldo_credito_pendiente: Float
        saldo_total: Float
        numero_usuario_creador: String
        nombre_usuario_creador: String
        id_user: String
        empresa: String
        sucursal: String
    }

    type ProductosEgresos {
        cantidad_productos: Float,
        precio_unitario: Float,
        producto: String,
        total: Float
    }

    input ObtenerHistorialEgresosInput {
        fecha_inicio: String
        fecha_fin: String
        usuario: String
        tipo_movimiento: Boolean
    }

    input CrearEgresosInput {
        folio_egreso: String
        folio_factura: String
        empresa_distribuidora: String
        provedor: String
        productos: [ProductosEgresosInput]
        categoria: String
        subCategoria: String
        metodo_pago: String
        fecha_compra: String
        fecha_vencimiento: String
        observaciones: String
        compra_credito: Boolean
        credito_pagado: Boolean
        saldo_credito_pendiente: Float
        saldo_total: Float
        numero_usuario_creador: String
        nombre_usuario_creador: String
        id_user: ID
    }

    input ProductosEgresosInput {
        cantidad_productos: Float,
        precio_unitario: Float,
        producto: String,
        total: Float
    }

    
    #### ABONOS ####
    input AbonoVentasCreditoInput{
        numero_caja: Int
        id_Caja: ID
        horario_turno: String
        tipo_movimiento: String
        monto_total: Float
        credito_disponible: Float
        rol_movimiento: String
        fecha_movimiento: FechaMovimientoCajaInput
        hora_moviento: HoraMovimientoCajaInput
        metodo_de_pago: MetodoDePagoInput
        descuento: DescuentoAbonoInput
        id_usuario: ID
        numero_usuario_creador: Float
        nombre_usuario_creador: String
        id_cliente: ID
        concepto: String
        numero_cliente: Int
        nombre_cliente: String 
        telefono_cliente: String 
        email_cliente: String
        ventas: [ventaAbono]
        liquidar: Boolean
        facturacion: Boolean
        caja_principal: Boolean
    }
    input ventaAbono{
        monto_total_abonado: Float
        id_venta: ID
        saldo_credito_pendiente: Float
    }
    input CrearAbonoInput {
        numero_caja: Int
        id_Caja: ID
        horario_turno: String
        tipo_movimiento: String
        hora_moviento: HoraMovimientoCajaInput
        rol_movimiento: String
        fecha_movimiento: FechaMovimientoCajaInput
        montos_en_caja:  MontosEnCajaInput
        metodo_de_pago: MetodoDePagoInput
        monto_total_abonado: Float
        id_usuario: ID
        concepto: String
        numero_usuario_creador: Float
        nombre_usuario_creador: String
        descuento: DescuentoAbonoInput
        id_cliente: ID
        numero_cliente: Int
        nombre_cliente: String 
        telefono_cliente: String 
        email_cliente: String
        id_egreso: ID
        provedor_egreso: String
        folio_egreso: String
        id_compra: ID
        caja_principal: Boolean
    }
    input CancelarAbonoInput {
        numero_caja: Int
        id_Caja: ID
        horario_turno: String
        tipo_movimiento: String
        monto_total: Float
        credito_disponible: Float
        rol_movimiento: String
        fecha_movimiento: FechaMovimientoCajaInput
        hora_moviento: HoraMovimientoCajaInput
        descuento: DescuentoAbonoInput
        id_usuario: ID
        concepto: String
        numero_usuario_creador: Float
        nombre_usuario_creador: String
        id_cliente: ID
        numero_cliente: Int
        nombre_cliente: String 
        telefono_cliente: String 
        email_cliente: String
        id_abono: ID
        id_venta: ID
        monto_abono: Float
        metodo_de_pago: String,
        caja_principal: Boolean
       
    }

    input CancelarAbonoProveedorInput {
        numero_caja: Int
        id_Caja: ID
        horario_turno: String
        tipo_movimiento: String
        monto_total: Float
        credito_disponible: Float
        rol_movimiento: String
        concepto: String
        fecha_movimiento: FechaMovimientoCajaInput
        hora_moviento: HoraMovimientoCajaInput
        descuento: DescuentoAbonoInput
        id_usuario: ID
        numero_usuario_creador: Float
        nombre_usuario_creador: String
        id_proveedor: ID
        clave_proveedor: String
        nombre_proveedor: String 
        telefono_proveedor: String 
        email_proveedor: String
        id_abono: ID
        id_compra: ID
        monto_abono: Float
        metodo_de_pago: String,
        caja_principal: Boolean
    }
    type Abonos {
        _id: ID
        numero_caja: Float
        id_Caja: ID
        horario_turno: String
        tipo_movimiento: String
        rol_movimiento: String
        fecha_movimiento: FechaMovimientoCaja
        montos_en_caja:  MontosEnCaja
        monto_total_abonado: Float
        metodo_de_pago: MetodoDePago
        descuento: DescuentoAbonos
        id_usuario: ID
        numero_usuario_creador: Float
        nombre_usuario_creador: String
        id_cliente: ID
        numero_cliente: Int
        nombre_cliente: String 
        telefono_cliente: String 
        email_cliente: String
        id_egreso: ID
        provedor_egreso: String
        folio_egreso: String
        id_compra: ID
        status: String
    }

    type HistorialVentasCredito{
        docs: [HistorialVentasCreditoObject]
        totalDocs: Int
        
    }
    type HistorialVentasCreditoObject {
        _id: ID
        folio: String
        estatus_credito: String 
        cliente: ClientesObj
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        monedero: Float
        subTotal: Float
        total: Float
        venta_cliente: Boolean
        factura: [FacturaObject]
        status: String
        observaciones: String
        credito: Boolean
        descuento_general_activo: Boolean
        id_caja: Caja
        fecha_de_vencimiento_credito: String
        dias_de_credito_venta: String
        saldo_credito_pendiente: Float,
        credito_pagado: Boolean,
        empresa: ID
        sucursal: ID
        usuario: Usuarios
        productos: [ProductoVentasType]
        abonos:[Abonos]
        fecha_registro: String
        montos_en_caja: MontosCaja
        facturacion: Boolean
    }
    input ObtenerHistorialAbonosInput {
        fecha_inicio: String
        fecha_fin: String
        usuario: String
        id_cliente: String
        id_egreso: String
        rol_movimiento: String
        id_compra: String
    }

    input MontosEnCajaInput {
        monto_efectivo: MontoCajaClaveInput
        monto_tarjeta_debito: MontoCajaClaveInput
        monto_tarjeta_credito: MontoCajaClaveInput
        monto_creditos: MontoCajaClaveInput
        monto_monedero: MontoCajaClaveInput
        monto_transferencia: MontoCajaClaveInput
        monto_cheques: MontoCajaClaveInput
        monto_vales_despensa: MontoCajaClaveInput
    }

    input DescuentoAbonoInput {
        porciento_descuento: Float
        dinero_descontado: Float
        total_con_descuento: Float
    }

    type MontoCajaClaveType {
        monto: Float
        metodo_pago: String
    }

    input MontoCajaClaveInput {
        monto: Float
        metodo_pago: String
    }

    input MetodoDePagoInput {
        clave: String
        metodo: String
    }

    type MontosEnCaja {
        monto_efectivo: MontoCajaClave
        monto_tarjeta_debito: MontoCajaClave
        monto_tarjeta_credito: MontoCajaClave
        monto_creditos: MontoCajaClave
        monto_monedero: MontoCajaClave
        monto_transferencia: MontoCajaClave
        monto_cheques: MontoCajaClave
        monto_vales_despensa: MontoCajaClave
    }

    type MontoCajaClave {
        monto: Float
        metodo_pago: String
    }

    type MetodoDePago {
        clave: String
        metodo: String
    }

    type DescuentoAbonos {
        porciento_descuento: Float
        dinero_descontado: Float
        total_con_descuento: Float
    }

    ### NOTAS DE CREDITO ###
    type NotasCreditoType {
        docs: [NotasCreditoTypeObj]
        totalDocs: Int
    }
    type NotasCreditoTypeObj {
        _id: ID
        cliente: ClientesObj
        generar_cfdi: Boolean
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        subTotal: Float
        total: Float
        id_factura: ID
        observaciones: String
        payment_form: String
        payment_method: String
        empresa: ID
        sucursal: ID
        usuario: Usuarios
        venta: ObtenerVentasTypeObj
        folio: String
        fecha_registro: String
        cambio: Float
        devolucion_en: String
    }

    type RelationsNotaType {
        Type: String,
        Cfdis: [CfdisNotaType],
    },

    type CfdisNotaType { 
        Uuid: String 
    }

    input CrearNotaCreditoInput {
        cliente: NotaClienteInput
        productos: [NotasProductosInput]
        generar_cfdi: Boolean
        descuento: Float
        ieps: Float
        impuestos: Float
        iva: Float
        subTotal: Float
        total: Float
        observaciones: String
        payment_form: String
        payment_method: String
        usuario: NotasUsuarioInput
        venta: ID
        folio: String
        cambio: Float
        devolucion_en: String
    }

    input NotaClienteInput {
        _id: ID
        clave_cliente: String
        numero_cliente: Int
        representante: String
        nombre_cliente: String
        rfc: String
        curp: String
        telefono: String
        celular: String
        email: String
        numero_descuento: Int
        limite_credito: Int
        dias_credito: String
        razon_social: String
        estado_cliente: Boolean
        tipo_cliente: TiposCliente
        fecha_nacimiento: String
        banco: String
        numero_cuenta: String
        empresa: String
        sucursal: String
        monedero_electronico: Float
        credito_disponible: Float
	}

    input NotasUsuarioInput {
        _id: ID
		numero_usuario: Int
        nombre: String
        telefono: String
        celular: String
        email: String
        estado_usuario: Boolean
        empresa: String
        sucursal: String
        turno_en_caja_activo: Boolean
	}

    input NotasProductosInput {
        cantidad_venta: Float
        cantidad_venta_original: Float
        cantidad_regresada: Float
        codigo_barras: String
        codigo_unidad: String
        id_producto: NotaProductoVentasInput
        ieps_total_producto: Float
        impuestos_total_producto: Float
        iva_total_producto: Float
        id_unidad_venta: NotasUnidadVenta
        precio: Float
        precio_a_vender: Float
        subtotal_total_producto: Float
        total_total_producto: Float
        unidad: String
        unidad_principal: Boolean
        precio_unidad: ProductoUnidadVentasInput
    }

    input NotasUnidadVenta {
        _id: ID
        precio: Float
        cantidad: Int
        concepto: String
        unidad: String
        codigo_unidad: String
        unidad_principal: Boolean
        unidad_activa: Boolean
        codigo_barras: String
        id_producto:String
        empresa: String
        sucursal: String
        descuento_activo: Boolean
        descuento: DescuentoProductosInput
        precio_unidad: PrecioProductosInputEditar
        default: Boolean
        createdAt: Date
        updatedAt: Date
    }

    input NotaProductoVentasInput {
        _id: String
        datos_generales: DatosGeneralesVentasInput
        precios: PreciosProductoVentasInput
        empresa: String
        sucursal: String
    }

    #### QUERYS ####
    type Query {
        """ Datos Empresa """
        obtenerEmpresa(id: ID!): Empresa!
        """ Datos Sucursales """
        obtenerDatosSucursal(id: ID!, ): [Sucursal!]
        obtenerSucursalesEmpresa(id: ID!): [Sucursal!]
        """ Datos Sucursales """
        obtenerAlmacenes(id: ID!): [Almacen!]
        obtenerProductosAlmacenes(input: InputProductosAlmacenes, limit: Int, offset: Int): ProductosAlmacenes
        """ Catalogos """
        obtenerTallas(empresa: ID!, tipo: String! ): [Tallas!]!
        obtenerColores(empresa: ID!): [Colores!]!
        obtenerClientes(tipo: String!, filtro: String, empresa: ID!, eliminado: Boolean, limit: Int, offset: Int): Clientes!
        obtenerUsuarios(empresa: String!, sucursal: String, filtro: String, eliminado: Boolean): [Usuarios!]!
        obtenerDepartamentos(empresa: ID!, sucursal: ID): [Departamentos!]!
        obtenerCategorias(empresa: ID!, sucursal: ID): [Categorias!]!
        obtenerMarcas(empresa: ID!, sucursal: ID): [Marcas!]!
        obtenerContabilidad(empresa: ID!, sucursal: ID): [Contabilidad!]!
        obtenerConceptosAlmacen(empresa: ID!, sucursal: ID): [ConceptoAlmacen!]!
        obtenerCuentas(empresa: ID!, sucursal: ID): [Cuentas!]!
        """ Productos """
        obtenerProductos(empresa: ID!, sucursal: ID!, filtro: String, almacen: ID, existencias: Boolean, limit: Int, offset: Int): Productos!
        obtenerConsultasProducto(empresa: ID!, sucursal: ID!): ConsultasProductoSelect!
        obtenerProductosInactivos(empresa: ID!, sucursal: ID!): [ProductoAlmacenEliminado!]
        """ Cajas """
        obtenerCajasSucursal(empresa: ID!, sucursal: ID!): [Cajas!]!
        obtenerPreCorteCaja(empresa: ID!, sucursal: ID!, input: PreCortesDeCajaInput, cajaPrincipal: Boolean): MontoPreCorteCaja!
        obtenerCortesDeCaja(empresa: ID!, sucursal: ID!, input: FiltroCorteDeCajaInput, limit: Int, offset: Int): FiltroCorteDeCaja!
        obtenerCorteCaja(empresa: ID!, sucursal: ID!, input: CorteDeCajaInput): CorteDeCaja!
      
         """ HistorialCajas """
        obtenerHistorialCaja(input: HistorialCajasInput, id_Caja: ID!, empresa: ID!, sucursal: ID!, limit: Int, offset: Int): HistorialCajas!
        """ Compras """
        obtenerConsultaGeneralCompras(empresa: ID!, sucursal: ID!): ConsultasGeneralesCompra!
        """ Ventas """
        obtenerConsultaGeneralVentas(empresa: ID!, sucursal: ID!): [ConsultaGeneralVentas]!
        obtenerUnProductoVentas(empresa: ID! ,sucursal: ID!, datosProductos: ID!): [ProductoSeleccionadoVentasObj]!
        obtenerClientesVentas(empresa: ID!, sucursal: ID!, limit: Int, offset: Int, filtro: String): ObtenerClientesVentas
        obtenerProductosVentas(empresa: ID! ,sucursal: ID!, input: ObtenerProductosVentasInput, limit: Int, offset: Int): ProductoSeleccionadoVentas!
        obtenerVentasSucursal(empresa: ID! ,sucursal: ID!, filtros: filtrosObtenerVentas, limit: Int, offset: Int): ObtenerVentasType!
        obtenerVentasReportes(empresa: ID! ,sucursal: ID!, filtros: filtrosReportesVentas, limit: Int, offset: Int): ProductosMovimientos
        obtenerVentasByVentaReportes(empresa: ID! ,sucursal: ID!, filtros: filtrosReportesVentasByVenta, limit: Int, offset: Int): ObtenerVentasType
        """ Compras """
        obtenerComprasRealizadas(empresa: ID!, sucursal: ID!, filtro: String, fecha: String, limit: Int, offset: Int): Compras!
        obtenerComprasEnEspera(empresa: ID!, sucursal: ID!, filtro: String, limit: Int, offset: Int): CompraEnEspera!
        """ Producto Movimientos"""
        obtenerProductoMovimientos(empresa: ID!, sucursal: ID, input: ObteneReportesCompras, limit: Int, offset: Int): ProductosMovimientos
        """ Historial De Turnos"""
        obtenerFiltroTurnos(input: HistorialTurnosInput, empresa: ID!, sucursal: ID!, limit: Int, offset: Int): AbrirCerrarTurno!
        """ Traspasos """
        obtenerProductosPorEmpresa(empresa: ID!, filtro: String,  limit: Int, offset: Int): ProductosEmpresa!
        obtenerTraspasos(input:ConsultaTraspasosInput, limit: Int, offset: Int):TraspasosReportes!
        """ Codigos Catalogos Producto """
        obtenerCodigosProducto(empresa: ID!, sucursal: ID): [CodigosProductosSat!]!
         """ Facturacion """
        obtenerCatalogosSAT(input:ConsultaSatInput): CatalogosSatConsulta!
        obtenerProductosOServicios(input:ConsultaSatInput): ProductosOServiciosConsulta!
        obtenerCodigoPostal(input:ConsultaSatInput): CodigoPostalConsulta!
        obtenerCfdiUses(input:ConsultaSatInput): CfdiUSesConsulta!
        obtenerSeriesCdfi(empresa: ID!, sucursal: ID): SeriesCfdiConsulta!
        obtenerFacturas(empresa: ID!, sucursal: ID, filtros: filtrosFactura, limit: Int, offset: Int): Factura!
        obtenerDocumentCfdi(id: String!): DownloadDocument!
        """ Flujo de cuentas """
        obtenerHistorialCuenta(empresa: ID!, sucursal: ID, input: ObtenerHistorialCuenta, tipo: Boolean, limit: Int, offset: Int): HistorialFlujoDeCaja
        """ Flujo de Egresos en Tesoreria"""
        obtenerHistorialEgresos(input: ObtenerHistorialEgresosInput, empresa: ID!, sucursal: ID): [Egresos]
        """ Abonos """
        obtenerAbonosProveedores(empresa: ID!, sucursal: ID!, filtro: String, limit: Int, offset: Int): Compras!
        obtenerHistorialAbonos(empresa: ID!, sucursal: ID, input: ObtenerHistorialAbonosInput ): [Abonos]
        historialVentasACredito(empresa: ID!, sucursal: ID, idCliente: ID, limit: Int, offset: Int ): HistorialVentasCredito
        """ Permisos Accesos """
        obtenerAccesoPermiso(input: ObtenerAccesoPermisosInput): AccesoLogin
        """ Cotizaciones """
        obtenerCotizaciones(empresa: ID!, sucursal: ID) : [ConsultaCotizaciones]!
    }
    #### MUTATIONS #### 
    type Mutation  {
        ################### Productos ###################
        crearProducto(input: CrearProductoInput): Message
		crearProductoRapido(input: CrearProductoRapidoInput): Message
        actualizarProducto(input: ActualizarProductoInput, id: ID!,  empresa: ID!, sucursal: ID!): Message
		eliminarProducto(id: ID!, empresa: ID!, sucursal: ID!): Message
        activarProducto(id: ID!, empresa: ID!, sucursal: ID!): Message

        ################### Datos Empresa ###################
        crearEmpresa(input: CrearEmpresa): Message
        actualizarEmpresa(id: ID!,input: EditarEmpresa): Empresa

        ################### Datos Sucursal ###################
        sesionSucursal(input: SesionSucursal): Token
        crearSucursal(input: CrearSucursal, id: ID!): Sucursal
        editarSucursal(id: ID!,input: EditarSucursal): Sucursal!
        editarPasswordSucursal(id: ID!,input: EditarPasswordSucursal): Message

        ################### Datos Almacen ###################
        crearAlmacen(input: CrearAlmacen, id: ID!, empresa: ID!): Almacen 
        actualizarAlmacen(input: EditarAlmacen, id: ID!): Message
        eliminarAlmacen(id: ID!): Message

		################### Tallas ###################
		crearTalla(input: CrearTallaInput): Message
		actualizarTalla(id: ID!, input: ActualizarTallaInput, empresa: ID!, sucursal: ID!): Message
		eliminarTalla(id: ID!, input: ActualizarTallaInput, empresa: ID!, sucursal: ID!): Message

        ################### Departamentos ###################
        crearDepartamentos(input: DepartamentosInput, empresa: ID!, sucursal: ID!): Message
        actualzarDepartamentos(input: DepartamentosInput, id: ID!, empresa: ID!, sucursal: ID!): Message
        eliminarDepartamento( id: ID!, empresa: ID!, sucursal: ID!): Message

        ################### Contabilidad ###################
        crearContabilidad(input: ContabilidadInput, empresa: ID!, sucursal: ID!, usuario: ID!): Message
        actualzarContabilidad(input: ContabilidadInput, id: ID!): Message
        eliminarContabilidad( id: ID!): Message
        
        ################### Marcas ###################
        crearMarcas(input: MarcasInput, empresa: ID!, sucursal: ID!): Message
        actualzarMarcas(input: MarcasInput, id: ID!, empresa: ID!, sucursal: ID!): Message
        eliminarMarca( id: ID!, empresa: ID!, sucursal: ID!,): Message
        
        ################### Colores ###################
		crearColor(input: CrearColorInput): Colores
		actualizarColor(id: ID!, input: ActualizarColorInput, empresa: ID!, sucursal: ID!): Message
		eliminarColor(id: ID!,empresa: ID!, sucursal: ID!): Message

        ################### Clientes ###################
		crearCliente(input: CrearClienteInput): ClientesObj
		actualizarCliente(id: ID!, input: ActualizarClienteInput, empresa: ID!, sucursal: ID!): Message
		eliminarCliente(id: ID!,  empresa: ID!, sucursal: ID!): Message

        ################### Usuarios ###################
		verifyUserName(username: String): Message
        crearUsuario(input: CrearUsuarioInput): Usuarios
		actualizarUsuario(id: ID!, input: ActualizarUsuarioInput, empresa: ID!, sucursal: ID!): Message
		eliminarUsuario(id: ID!): Message
        logearUsuario(input: LogearUsuarioInput): Token
        asignarAccesosUsuario(input: CrearArregloDeAccesosInput, id: ID!): Message

        ################### Categorias ##################
		crearCategoria(input: CrearCategoriasInput): Categorias
        crearSubcategoria(idCategoria: ID!, input: CrearSubcategoriasInput, empresa: ID!, sucursal: ID!): Message
        actualizarCategoria(idCategoria: ID!, input: ActualizarCategoriasInput, empresa: ID!, sucursal: ID!): Message
        actualizarSubcategoria(idCategoria: ID!, idSubcategoria: ID!, input: ActualizarSubcategoriasInput, empresa: ID!, sucursal: ID!): Message
		eliminarCategoria(idCategoria: ID!, empresa: ID!, sucursal: ID!): Message
        eliminarSubcategoria(idCategoria: ID!, idSubcategoria: ID!, empresa: ID!, sucursal: ID!): Message

        ################### Costos ######################
		crearCuenta(input: CrearCuentasInput): Cuentas
        crearSubcuenta(idCuenta: ID!, input: CrearSubcuentasInput,empresa: ID!, sucursal: ID!): Message
        actualizarCuenta(idCuenta: ID!, input: ActualizarCuentasInput,empresa: ID!, sucursal: ID!): Message
        actualizarSubcuenta(idCuenta: ID!, idSubcuenta: ID!, input: ActualizarSubcuentasInput,empresa: ID!, sucursal: ID!): Message
		eliminarCuenta(id: ID!,empresa: ID!, sucursal: ID!): Message
        eliminarSubcuenta(idCuenta: ID!, idSubcuenta: ID!,empresa: ID!, sucursal: ID!): Message

        ################### Cajas ######################
        crearCaja(input: CrearCajasInput!, empresa: ID!, sucursal: ID!): Message
        eliminarCaja(id: ID!): Message
        actualizarCaja(input: EditarCaja, id: ID!): Caja

        ################### ConceptosAlmacen ###################
        crearConceptoAlmacen(input: ConceptoAlmacenInput, empresa: ID!, sucursal: ID!, usuario: ID!): Message
        actualizarConceptoAlmacen(input: ConceptoAlmacenInput, id: ID!,empresa: ID!, sucursal: ID!): Message
        eliminarConceptoAlmacen( id: ID!, empresa: ID!, sucursal: ID!): Message

        ################### HistorialCajas ######################
        crearHistorialCaja(input: CrearHistorialCajasInput!, empresa: ID!, sucursal: ID!): Message
         ################### DescuentoProductos ######################
        crearDescuentoUnidad(input: ObjetoDescuentoUnidadesInput!, empresa: ID!, sucursal: ID!): Message
        actualizarDescuentoUnidad(input: ObjetoDescuentoUnidadesInput!, empresa: ID!, sucursal: ID!): Message
        desactivarDescuentoUnidad( input: ActivarDescuentoUnidades, id: ID!, empresa: ID!, sucursal: ID!): Message
        eliminarDescuentoUnidad( id: ID!, empresa: ID!, sucursal: ID!): Message
        ################### Crear compra ######################
        crearCompra(input: CrearCompraInput, empresa: ID!, sucursal: ID!, usuario: ID!): Message
        crearCompraEnEspera(input: CrearCompraInput, empresa: ID!, sucursal: ID!, usuario: ID!): Message
        eliminarCompraEnEspera( id: ID!): Message
        cancelarCompra(empresa: ID!, sucursal: ID!, id_compra: ID! data_sesion: cancelarCompraInput): Message
        
        ################### Traspasos ###################
        crearTraspaso(input: CrearTraspasoInput, empresa: ID!, usuario: ID!): Traspaso
        
        ###################  Abrir Cerrar Turnos ######################
        crearRegistroDeTurno(input: AbrirCerrarTurnoInput, activa: Boolean): abrirCerrarTurnoObject
        subirTurnoCloud(input: AbrirCerrarTurnoInput, activa: Boolean, isOnline:Boolean): TurnoCloud

        ###################  Facturacion ######################
        crearFactura(input: CrearFacturaInput): CrearFactura
        crearComplementoPago(input: CrearComplementoPagoInput): CrearFactura
        crearSerieCFDI(input: CrearSerieCfdiInput): SeriesCfdiConsulta
        modificarDefaultSerie(id:ID!, empresa: ID!, sucursal: ID!):Message
        eliminarSerie(id:ID!):Message
        crearCSDS(input: CrearCSDSInput): SeriesCfdiConsulta
        eliminarCSD(rfc:String, empresa: ID!): Message

        ################### Codigo Producto Catalogo Sat ###################
		crearCodigoProducto(input: CodigoCatalogoProductoInput): Message
		eliminarCodigoProducto(id: ID!): Message

        ################### Ventas ###################
        createVenta(input: CrearVentasInput!, empresa: ID!, sucursal: ID!, usuario: ID!, caja: ID!, isOnline: Boolean!): CrearVentaType
        cancelarVentasSucursal(empresa: ID!, sucursal: ID!, folio: String!, input: cancelarVentaInput): Message
        subirVentasCloud(arrayVentasCloud: [VentasCloudInput]): VentasCloudType
        addModelsUpdated(empresa: ID!): Message

        ################## Cotizaciones ###################
        crearCotizacion(input: CrearVentasInput!, empresa: ID!, sucursal: ID!, usuario: ID!, caja: ID!): Message

        ################## Cuentas ###################
        crearMovimientoCuenta(input: CrearMovimientoCuentaInput, empresa: ID!, sucursal: ID!, tipo: Boolean): Message

        ################## Egresos ###################
        crearEgreso(input: CrearEgresosInput, empresa: ID!, sucursal: ID!): Message

        ################## Abonos ###################
        crearAbono( empresa: ID!, sucursal: ID!, input: CrearAbonoInput): Message
        crearAbonoVentaCredito( empresa: ID!, sucursal: ID!, input: AbonoVentasCreditoInput): CrearFactura
        cancelarAbonoCliente( empresa: ID!, sucursal: ID!, input: CancelarAbonoInput): Message
        cancelarAbonoProveedor( empresa: ID!, sucursal: ID!, input: CancelarAbonoProveedorInput): Message
        
        ################## ActualizarBaseDeDatos ###################
        actualizarBDLocal(empresa:ID!, sucursal: ID!, ) : Message
        
        ###################  Scripts ######################
        someWhereOverTheRainbow(empresa: ID!, sucursal: ID!) : Message

        ############### NOTAS CREDITO ################
        crearNotaCredito(input: CrearNotaCreditoInput!, empresa: ID!, sucursal: ID!, turno: turnoVenta): Message
	}
`;

module.exports = typeDefs;