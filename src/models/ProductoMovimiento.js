const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var Float = require("mongoose-float").loadType(mongoose, 4);

const ProductosMovimientosSchema = new Schema(
  {
    id_compra: {
      type: Schema.Types.ObjectId,
      ref: "Compras",
      trim: true,
    },
    id_traspaso: {
      type: Schema.Types.ObjectId,
      ref: "Traspasos",
      trim: true,
    },
    id_venta: {
      type: Schema.Types.ObjectId,
      ref: "Venta",
      trim: true,
    },
    id_producto: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Productos",
      trim: true,
    },
    id_proveedor: {
      type: Schema.Types.ObjectId,
      ref: "Clientes",
      trim: true,
    },
    id_almacen: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Almacen",
      trim: true,
    },
    almacen: {
      id_almacen: String,
      nombre_almacen: String,
      default_almacen: Boolean,
    },
    proveedor: {
      _id: String,
      clave_cliente: String,
      numero_cliente: String,
      nombre_cliente: String,
    },
    producto: {
      almacen_inicial: {
        almacen: String,
        cantidad: Float,
        fecha_de_expiracion: String,
        id_almacen: {
          type: Schema.Types.ObjectId,
          ref: "Almacen",
        },
      },
      datos_generales: {
        codigo_barras: String,
        clave_alterna: String,
        tipo_producto: String,
        nombre_comercial: String,
        nombre_generico: String,
        descripcion: String,
        id_categoria: {
          type: Schema.ObjectId,
          ref: "Categorias",
        },
        categoria: String,
        subcategoria: String,
        id_subcategoria: String,
        id_departamento: {
          type: Schema.ObjectId,
          ref: "Departamentos",
        },
        departamento: String,
        id_marca: {
          type: Schema.ObjectId,
          ref: "Marcas",
        },
        marca: String,
        clave_producto_sat: {
          Name: String,
          Value: String,
        },
        receta_farmacia: Boolean,
      },
      precios: {
        ieps: Float,
        ieps_activo: Boolean,
        inventario: {
          inventario_minimo: Number,
          inventario_maximo: Number,
          unidad_de_inventario: String,
          codigo_unidad: String,
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
            precio_venta: Float,
            unidad_mayoreo: Number,
            iva_precio: Float,
            ieps_precio: Float,
            utilidad: Float,
          },
        ],
        unidad_de_compra: {
          cantidad: Number,
          precio_unitario_con_impuesto: Float,
          precio_unitario_sin_impuesto: Float,
          unidad: String,
          codigo_unidad: String,
        },
        granel: Boolean,
        litros: Boolean,
      },
      unidades_de_venta: [
        {
          cantidad: Float,
          codigo_barras: String,
          id_producto: String,
          precio: Float,
          unidad: String,
          codigo_unidad: String,
          unidad_principal: Boolean,
          _id: String,
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
        },
      ],
    },
    nota_credito: {
      id_nota_credito: {
        type: Schema.Types.ObjectId,
        ref: "NotasCreditos",
        trim: true,
      },
      cantidad_devuelta: Float,
      cantidad_vendida: Float,
      total: Float
    },
    concepto: {
      type: String,
      require: true,
      trim: true,
    },
    cantidad: {
      type: Float,
      require: true,
    },
    cantidad_regalo: Float,
    unidad_regalo: String,
    cantidad_total: Float,
    iva_total: Float,
    ieps_total: Float,
    costo: Float,
    descuento_porcentaje: Float,
    descuento_precio: Float,
    folio_compra: String,
    compra_credito: Boolean,
    venta_credito: Boolean,
    forma_pago: String,
    impuestos: Float,
    mantener_precio: Boolean,
    subtotal: Float,
    total: Float,
    medida: {
      id_medida: {
        type: Schema.Types.ObjectId,
        ref: "Tallas",
        trim: true,
      },
      medida: String,
      tipo: String,
    },
    color: {
      id_color: {
        type: Schema.Types.ObjectId,
        ref: "Colores",
        trim: true,
      },
      color: String,
      hex: String,
    },
    //Campos agregados para traspasos
   almacen_origen: {
      _id:{
        type: Schema.Types.ObjectId,
        ref: "Almacen",
        trim: true
      },
      nombre_almacen: String,
      default_almacen: Boolean
    
    },
     almacen_destino: {
      _id:{
        type: Schema.Types.ObjectId,
        ref: "Almacen",
        trim: true
      },
      nombre_almacen: String,
      default_almacen: Boolean
        
     
    },
    cantidad_durante_mov_origen: String,
    cantidad_durante_mov_destino: String,
    concepto_traspaso: String,
    /*    sucursal_origen: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
      trim: true,
    },
    sucursal_destino: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
      trim: true,
    }, */

    //Campos agregados en ventas
    cantidad_venta: Number,
    tipo_venta: String,
    granel_producto: {
      granel: Boolean,
      valor: Float,
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
    subtotal_antes_de_impuestos: Float,
    precio_actual_object: {
      cantidad_unidad: Float,
      numero_precio: Float,
      unidad_maxima: Boolean,
      precio_general: Float,
      precio_neto: Float,
      precio_venta: Float,
      iva_precio: Float,
      ieps_precio: Float,
      utilidad: Float,
      porciento: Float,
      dinero_descontado: Float,
    },
    precio: Float,
    precio_a_vender: Float,
    precio_actual_producto: Float,
    descuento_producto: {
      cantidad_unidad: Float,
      numero_precio: Float,
      unidad_maxima: Boolean,
      precio_general: Float,
      precio_neto: Float,
      precio_venta: Float,
      iva_precio: Float,
      ieps_precio: Float,
      utilidad: Float,
      porciento: Float,
      dinero_descontado: Float,
    },
    descuento_activo: Boolean,
    default: Boolean,
    //Campos agregados en ventas Fin
    unidad: {
      type: String,
      require: true,
    },
    codigo_unidad: String,
    id_unidad_venta: {
      type: Schema.Types.ObjectId,
      ref: "Unidadesventa",
      trim: true,
    },
    empresa: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Empresa",
      trim: true,
    },
    sucursal: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
      trim: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      trim: true,
    },
    year_registro: String,
    numero_semana_year: String,
    numero_mes_year: String,
    fecha_registro: String,
  },
  {
    timestamps: true,
  }
);

module.exports = model("ProductosMovimientos", ProductosMovimientosSchema);
