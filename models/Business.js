const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const BusinessSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    owner: {
        type: String,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
    active_branches: {
        type: Number
    },  
    password: {
        type: String,
        require: true,
        trim: true
    }
},{
    timestamps: true
})

module.exports = model("Business",BusinessSchema);