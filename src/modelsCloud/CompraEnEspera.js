const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var Float = require("mongoose-float").loadType(mongoose, 4);

const ComprasEnEsperaSchema = new Schema(
  {
    almacen: {
      id_almacen: {
        type: String,
        require: true,
        trim: true,
      },
      nombre_almacen: String,
    },
    proveedor: {
      id_proveedor: {
        type: String,
        require: true,
        trim: true,
      },
      clave_cliente: Number,
      numero_cliente: Number,
      nombre_cliente: String,
    },
    en_espera: Boolean,
    productos: [
      {
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
          centro_de_costos: {
            cuenta: String,
            id_cuenta: {
              type: Schema.Types.ObjectId,
              ref: "Costos",
            },
            id_subcuenta: String,
            subcuenta: String,
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
          imagenes: [
            {
              url_imagen: String,
              location_imagen: String,
              key_imagen: String,
              extencion_imagen: String,
            },
          ],
          precio_plazos: {
            precio_piezas: [
              {
                plazo: String,
                unidad: String,
                codigo_unidad: String,
                precio: Float,
              },
            ],
            precio_cajas: [
              {
                plazo: String,
                unidad: String,
                codigo_unidad: String,
                precio: Float,
              },
            ],
            precio_tarimas: [
              {
                plazo: String,
                unidad: String,
                codigo_unidad: String,
                precio: Float,
              },
            ],
            precio_costales: [
              {
                plazo: String,
                unidad: String,
                codigo_unidad: String,
                precio: Float,
              },
            ],
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
          presentaciones: [
            {
              _id: String,
              cantidad: Float,
              cantidad_nueva: Float,
              almacen: String,
              codigo_barras: String,
              color: {
                hex: String,
                nombre: String,
                _id: String,
              },
              existencia: Boolean,
              medida: {
                talla: String,
                tipo: String,
                _id: String,
              },
              nombre_comercial: String,
              precio: Float,
              descuento: {
                porciento: Float,
                dinero_descontado: Float,
                precio_con_descuento: Float,
              },
              descuento_activo: Boolean,
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
          unidades_de_venta: [
            {
              precio: Float,
              cantidad: Float,
              unidad: String,
              codigo_unidad: String,
              unidad_principal: Boolean,
              codigo_barras: String,
              id_producto: String,
              descuento: {
                porciento: Float,
                dinero_descontado: Float,
                precio_con_descuento: Float,
              },
              descuento_activo: Boolean,
              default: Boolean,
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
        },
        id_producto: {
          type: Schema.Types.ObjectId,
          require: true,
          ref: "Productos",
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
        impuestos: Float,
        mantener_precio: Boolean,
        subtotal: Float,
        total: Float,
        subtotal_descuento: Float,
        total_descuento: Float,
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
        unidad: {
          type: String,
          require: true,
        },
        id_unidad_venta: {
          type: Schema.Types.ObjectId,
          ref: "Unidadesventa",
          trim: true,
        },
      },
    ],
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
    impuestos: {
      type: Float,
      require: true,
    },
    subtotal: {
      type: Float,
      require: true,
    },
    total: {
      type: Float,
      require: true,
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

module.exports =  ComprasEnEsperaSchema;
