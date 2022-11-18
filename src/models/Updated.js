const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const updatedSchema = new Schema({
    catalogo: String,
    fecha_updated: String,
    empresa: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: "Empresa",
        trim: true,
    }
});

module.exports = model("Updated", updatedSchema);