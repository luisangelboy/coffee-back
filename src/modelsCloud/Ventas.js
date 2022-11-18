const mongoose = require("mongoose");
const Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const VentasSchema = new Schema(
    {
        folio: String,
        descuento: Float,
        ieps: Float,
        impuestos: Float,
        iva: Float,
        monedero: Float,
        subTotal: Float,
        total: Float,
        venta_cliente: Boolean,
        status: String,
        observaciones: String,
        cambio: Float,
        tipo_emision: String,
        forma_pago: String,
        metodo_pago: String,
        montos_en_caja: {
            monto_efectivo: {
                monto: Float,
                metodo_pago: String
            },
            monto_tarjeta_credito: {
                monto: Float,
                metodo_pago: String
            },
            monto_tarjeta_debito: {
                monto: Float,
                metodo_pago: String
            },
            monto_creditos: {
                monto: Float,
                metodo_pago: String
            },
            monto_monedero: {
                monto: Float,
                metodo_pago: String
            },
            monto_transferencia: {
                monto: Float,
                metodo_pago: String
            },
            monto_cheques: {
                monto: Float,
                metodo_pago: String
            },
            monto_vales_despensa: {
                monto: Float,
                metodo_pago: String
            }
        },
        /* metodo_pago : {
            clave: String,
            metodo: String ,
        }, */
        credito: Boolean,
        saldo_credito_pendiente: Float,
        credito_pagado: Boolean,
        abono_minimo: Float,
        descuento_general_activo: Boolean,
        descuento_general:{
            cantidad_descontado: Float,
            porciento: Float,
            precio_con_descuento: Float
        },
        fecha_de_vencimiento_credito: String,
        dias_de_credito_venta: String,
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
            monedero_electronico: String,
            credito_disponible: Number
        },
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
        timestamps: true
    }
);


module.exports = VentasSchema;
