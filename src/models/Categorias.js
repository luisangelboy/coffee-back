const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Categorias = Schema({
	categoria: {
		type: String,
		require: true
	},
	subcategorias: [{
		subcategoria: {
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
});

module.exports = mongoose.model('Categorias', Categorias);
