const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const HistorialCajaSchema = new Schema({
    tipo_movimiento: String,
    concepto: String,
    usuario_entrega: String,
    origen_entrega: String,
    fecha_movimiento_entrega: String,
    numero_caja:{
		type: Number,
		require: true
	},
    rol_movimiento: String,
    id_Caja:{
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Cajas",
        trim: true,
    },
    horario_turno: String,
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
    id_User: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Usuarios",
        trim: true,
    },
    numero_usuario_creador:{
		type: Number,
		require: true
	},
    nombre_usuario_creador:{
		type: String,
		require: true
	},
    comentarios: String,
    tipo_de_venta: String,
    metodo_pago : {
        clave: String,
        metodo: String ,
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
    id_movimiento: String,
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

module.exports = model("HistorialCajas",HistorialCajaSchema);