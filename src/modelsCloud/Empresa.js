const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 4);
const { Schema, model } = mongoose;

const EmpresaSchema = new Schema({
    nombre_empresa: {
        type: String,
        require: true,
    },
    correo_empresa: {
        type: String,
        require: true
    }, 
    nombre_dueno: {
        type: String,
        require: true,
    },
    telefono_dueno: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    celular: {
        type: String,
       
    },
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
    nombre_fiscal: {
        type: String,
        require: true,
    },
    rfc: {
        type: String,
        require: true,
    },
    regimen_fiscal: {
        type: String,
        require: true,
    },
    curp: {
        type: String,
        require: true,
    },
    info_adicio: {
        type: String
       
    },
    direccionFiscal: {
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
    datosBancarios: {
		cuenta: {
			type: String
		},
        sucursal: {
			type: String
		},
        clave_banco: {
			type: String
		},
	},
    cuenta_empresa: {
        efectivo: Float,
        bancario: Float
    },
    estado_empresa: {
		type: Boolean,
		require: true
	},
    sucursales_activas: {
        type: Number,
        require: true,
    },
    limite_sucursales: {
        type: Number,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    limite_timbres: {
        type: Number,
        require: true
    },
     timbres_usados: {
        type: Number,
        require: true
    },
    sello_sat:{
        type:Boolean,
        require: true
    },
     valor_puntos: {
         type:Float
    },
      nombre_cer: {
        type: String
    },
     nombre_key: {
        type: String
    },
    fecha_registro_sello_sat:{
        type:String
    },
    empresa_activa: Boolean,
    vender_sin_inventario: Boolean
});

module.exports =  EmpresaSchema;