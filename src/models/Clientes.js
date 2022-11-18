const mongoose = require('mongoose');
var Float = require('mongoose-float').loadType(mongoose, 4);
const Schema = mongoose.Schema;

const Clientes = Schema({
	numero_cliente: {
		type: Number,
		require: true,
		trim: true
	},
	clave_cliente: {
		type: String,
		require: true,
		trim: true
	},
	representante: {
		type: String,
		require: true
	},
	nombre_cliente: {
		type: String,
		require: true
	},
	rfc: {
		type: String,
		trim: true
	},
	curp: {
		type: String,
		trim: true
	},
	telefono: {
		type: String,
		require: true,
		trim: true
	},
	celular: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		require: true,
		trim: true
	},
	numero_descuento: {
		type: Number
	},
	limite_credito: {
		type: Float
	},
	dias_credito: {
		type: String
	},
	razon_social: {
		type: String
	},
	credito_disponible: Float,
	fecha_nacimiento: String,
	fecha_registro: String,
	eliminado: Boolean,
	direccion: {
		calle: {
			type: String
		},
		no_ext: {
			type: String
		},
		no_int: {
			type: String
		},
		codigo_postal: {
			type: String
		},
		colonia: {
			type: String
		},
		municipio: {
			type: String
		},
		localidad: {
			type: String
		},
		estado: {
			type: String
		},
		pais: {
			type: String
		}
	},
	imagen: {
		type: String
	},
	estado_cliente: {
		type: Boolean,
		require: true
	},
	tipo_cliente: {
		type: String,
		require: true,
		trim: true
	},
	banco: {
		type: String
	},
	numero_cuenta: {
		type: String,
		trim: true
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
	monedero_electronico: {
		type: Float
	}
},
{
timestamps: true
});

module.exports = mongoose.model('Clientes', Clientes);
