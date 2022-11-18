const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cuentas = Schema({
	cuenta: {
		type: String,
		require: true
	}, 
	subcuentas: [{
		subcuenta: {
            type: String
        }
	}],
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
},
{
timestamps: true
})

module.exports = mongoose.model('Cuentas', Cuentas);