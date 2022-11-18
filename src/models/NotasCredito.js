const mongoose = require("mongoose");
const Float = require("mongoose-float").loadType(mongoose, 4);
const { Schema, model } = mongoose;

const NotaCreditoSchema = new Schema(
  {
    descuento: Float,
    ieps: Float,
    impuestos: Float,
    iva: Float,
    subTotal: Float,
    total: Float,
    observaciones: String,
    cambio: Float,
    generar_cfdi: Boolean,
    payment_form: String,
    payment_method: String,
    venta: {
      type: Schema.Types.ObjectId,
      ref: "Venta",
      trim: true,
    },
    folio: String,
    productos: [
      {
        cantidad_venta: Float,
        cantidad_venta_original: Float,
        cantidad_regresada: Float,
        codigo_barras: String,
        codigo_unidad: String,
        id_producto: {
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
          empresa: String,
          sucursal: String
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
        ieps_total_producto: Float,
        impuestos_total_producto: Float,
        iva_total_producto: Float,
        precio: Float,
        precio_a_vender: Float,
        subtotal_total_producto: Float,
        total_total_producto: Float,
        unidad: String,
        unidad_principal: Boolean,
      },
    ],
    id_factura: {
      type: Schema.Types.ObjectId,
      ref: "Factura",
      trim: true,
    },
    montos_en_caja: {
      monto_efectivo: {
        monto: Float,
        metodo_pago: String,
      },
      monto_tarjeta_credito: {
        monto: Float,
        metodo_pago: String,
      },
      monto_tarjeta_debito: {
        monto: Float,
        metodo_pago: String,
      },
      monto_creditos: {
        monto: Float,
        metodo_pago: String,
      },
      monto_monedero: {
        monto: Float,
        metodo_pago: String,
      },
      monto_transferencia: {
        monto: Float,
        metodo_pago: String,
      },
      monto_cheques: {
        monto: Float,
        metodo_pago: String,
      },
      monto_vales_despensa: {
        monto: Float,
        metodo_pago: String,
      },
    },
    empresa: {
      type: Schema.Types.ObjectId,
      ref: "Empresa",
    },
    sucursal: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
    },
    cliente: {
      id_cliente: {
        type: Schema.Types.ObjectId,
        ref: "Clientes",
      },
      banco: String,
      celular: String,
      clave_cliente: String,
      curp: String,
      dias_credito: String,
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
      monedero_electronico: String,
      credito_disponible: Number,
    },
    fecha_registro: {
      type: String,
    },
    year_registro: {
      type: String,
    },
    numero_semana_year: {
      type: String,
    },
    numero_mes_year: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("NotasCreditos", NotaCreditoSchema);
