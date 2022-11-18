const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const Schema = mongoose.Schema;

const AbrirCerrarTurno = Schema({
    horario_en_turno: String,
    concepto: String,
    token_turno_user: String,
    numero_caja: String,
    id_caja:{
        type: Schema.Types.ObjectId,
        ref: "Cajas"
    },
    comentarios: String,
    hora_entrada: {
        hora: String,
        minutos: String,
        segundos: String,
        completa: String
    },
    hora_salida:{
        hora: String,
        minutos: String,
        segundos: String,
        completa: String
    },
    fecha_entrada:{
        year: String,
        mes: String,
        dia: String,
        no_semana_year: String,
        no_dia_year: String,
        completa: String
    },
    fecha_salida:{
        year: String,
        mes: String,
        dia: String,
        no_semana_year: String,
        no_dia_year: String,
        completa: String
    },
    fecha_movimiento: String,
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
    id_usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuarios",
        trim: true,
    },
    usuario_en_turno:{
        nombre: String,
        telefono: String,
        numero_usuario: String,
        email: String
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
},
{
    timestamps: true
});

module.exports = AbrirCerrarTurno;
