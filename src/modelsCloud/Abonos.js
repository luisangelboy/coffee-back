const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose, 4);


const Abonos = Schema({
    numero_caja: Number,
    id_Caja:{
        type: Schema.Types.ObjectId,
        ref: "Cajas",
        trim: true, 
    },
    horario_turno: String,
    id_movimiento:String,
    tipo_movimiento: String,
    rol_movimiento: String,
    hora_moviento:{
        hora: String,
        minutos: String,
        segundos: String,
        completa: String
    },
    fecha_movimiento:{
        year: String,
        mes: String,
        dia: String,
        no_semana_year: String,
        no_dia_year: String,
        completa: String
    },
    monto_total_abonado: Float,
    descuento: { 
        porciento_descuento: Float,
        dinero_descontado: Float,
        total_con_descuento: Float
    },
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
    metodo_pago : {
        clave: String,
        metodo: String ,
    },
    id_usuario:{
        type: Schema.Types.ObjectId,
        ref: "Usuarios",
        trim: true
    },
    numero_usuario_creador:{
		type: String,
		require: true
	},
    nombre_usuario_creador:{
		type: String,
		require: true
	},
    
    id_cliente:{
        type: Schema.Types.ObjectId,
        ref: "Clientes",
        trim: true,
    },

    numero_cliente: String,
    nombre_cliente: String, 
    telefono_cliente: String, 
    email_cliente: String,

    id_egreso:{
        type: Schema.Types.ObjectId,
        ref: "Egresos",
        trim: true,
    },
    provedor_egreso: String,
    folio_egreso: String,
     
    id_compra:{
        type: Schema.Types.ObjectId,
        ref: "Compras",
        trim: true,
    },
    folio_compra: String,
    folio_venta: String,
    status: String,
    id_venta:{
        type: Schema.Types.ObjectId,
        ref: "Ventas",
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
	}
},{
    timestamps: true
});

module.exports =  Abonos;
