const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var Float = require("mongoose-float").loadType(mongoose, 4);

const CotizacionesSchema = new Schema({
    id_caja: {
        type: Schema.Types.ObjectId,
        ref: "Cajas"
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: "Empresa"
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: "Sucursal"
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuarios"
    },

    tipo_venta: String,
    cliente: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "Clientes"
        },
        banco: String,
        celular: String,
        clave_cliente: String,
        curp: String,
        dias_credito: String,
        direccion: {
            calle: String,
            no_ext: String,
            no_int: String,
            codigo_postal: String,
            colonia: String,
            municipio: String,
            localidad: String,
            estado: String,
            pais: String
        },
        email: String,
        imagen: String,
        limite_credito: Number,
        nombre_cliente: String,
        numero_cliente: String,
        numero_cuenta: String,
        numero_descuento: Number,
        razon_social: String,
        rfc: String,
        telefono: String,
        monedero_electronico: String
    },

    productos:[
        {
            cantidad: Float,
            cantidad_venta: Float,
            codigo_barras: String,
            concepto: String,
            default: Boolean,
            descuento_activo: Boolean,
            descuento: {
                dinero_descontado: Float,
                porciento: Float,
                precio_con_descuento: Float
            },
            granel_producto: {
                granel: Boolean,
                valor: Float
            },
            precio: Float,
            precio_a_vender: Float,
            precio_actual_producto: Float,
            precio_anterior: Float,
            unidad: String,
            codigo_unidad: String,
            unidad_principal: Boolean,
            medida:{
                talla: String,
                tipo: String,
                _id: String
            },
            color:{
                hex: String,
                nombre: String,
                _id: String
            },
            inventario_general: [{
                cantidad_existente: Float,
                codigo_unidad: String,
                unidad_inventario: String,
                cantidad_existente_maxima: Float,
                unidad_maxima: String,
                id_almacen_general: String
            }],
            id_producto: {
                _id: String,
               
                datos_generales:{
                    clave_alterna: String,
                    codigo_barras: String,
                    nombre_comercial: String,
                    tipo_producto: String,
                    nombre_generico: String,
                    descripcion: String,
                    id_categoria: String,
                    categoria: String,
                    subcategoria: String,
                    id_subcategoria: String,
                    id_departamento: String,
                    departamento: String,
                    id_marca: String,
                    marca: String,
                    receta_farmacia: Boolean,
                    clave_producto_sat: {
                        name: String,
                        value: String
                    },
                },
                imagenes: [{
                    url_imagen: String
                }],
                precios: {
                    ieps: Float,
                    ieps_activo: Boolean,
                    inventario: {
                      inventario_minimo: Number,
                      inventario_maximo: Number,
                      unidad_de_inventario: String,
                      codigo_unidad: String
                    },
                    iva: Float,
                    iva_activo: Boolean,
                    monedero: Boolean,
                    monedero_electronico: Number,
                    precio_de_compra: {
                      precio_con_impuesto: Float,
                      precio_sin_impuesto: Float,
                      iva: Float,
                      ieps: Float,
                    },
                    precios_producto: [
                      {
                        numero_precio: Number,
                        precio_neto: Float,
                        unidad_mayoreo: Number,
                        utilidad: Float,
                      },
                    ],
                    unidad_de_compra: {
                      cantidad: Number,
                      precio_unitario_con_impuesto: Float,
                      precio_unitario_sin_impuesto: Float,
                      unidad: String,
                      codigo_unidad: String
                    },
                },
            },
            precio_unidad: {
                numero_precio: Number,
                precio_neto: Float,
                precio_venta: Float,
                unidad_mayoreo: Number,
                iva_precio: Float,
                ieps_precio: Float,
                utilidad: Float,
                precio_general: Float,
                cantidad_unidad: Number,
                unidad_maxima: Boolean,
            },
            precio_actual_object:{
                cantidad_unidad: Float,
                dinero_descontado: Float,
                ieps_precio: Float,
                iva_precio: Float,
                numero_precio: Number,
                porciento: Float,
                precio_general: Float,
                precio_neto: Float,
                precio_venta: Float,
                unidad_maxima: Boolean,
                utilidad: Float,
            },
            iva_total_producto: Float,
            ieps_total_producto: Float,
            impuestos_total_producto: Float,
            subtotal_total_producto: Float,
            total_total_producto: Float,
        }
    ],
     
    descuento_general_activo: Boolean,
    descuento_general:{
        cantidad_descontado: Float,
        porciento: Float,
        precio_con_descuento: Float
    },
    descuento: Float,
    ieps: Float,
    impuestos: Float,
    iva: Float,
    monedero: Float,
    folio:String,
    subTotal: Float,
    total: Float,
    credito: Boolean,
    descuento_general_activo: Boolean,
    descuento_general:{
        cantidad_descontado: Float,
        porciento: Float,
        precio_con_descuento: Float
    },
    dias_de_credito_venta: String,
    fecha_de_vencimiento_credito: String,
    fecha_vencimiento_cotizacion: String,
    
    venta_cliente: Boolean,
    year_registro: String,
    numero_semana_year: String,
    numero_mes_year: String,
    fecha_registro: String,
    fecha_registro: {
        type: String
    },
    year_registro: {
        type: String
    },
    numero_semana_year: {
        type: String
    },
    numero_mes_year:{
        type: String
    }
    },
    
    {
        timestamps: true,
    }
);

module.exports = CotizacionesSchema;
