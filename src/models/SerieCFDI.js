const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const SerieCFDISchema = new Schema({
    num_serie: Number,
    serie: String,
    folio: Number,
    default:Boolean,
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
})

module.exports = model("SerieCFDI", SerieCFDISchema);