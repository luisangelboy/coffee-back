const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const BranchOficeSchema = new Schema({
    id_business: {
        type: Schema.ObjectId,
        ref: "business"
    },
    location: {
        references: String,
        street: String,
        cp: String,
        suburb: String,
        city: String,
        state: String,
        no_ext: String,
        no_int: String,
    },
    description: {
        type: String,
        unique: true,
        trim: true
    },
    name_sucursal:{
        type: String,
        unique: true,
        trim: true
    },
    hour: String,
    date: Date
},{
    timestamps: true
})

module.exports = model("branchoffice",BranchOficeSchema);