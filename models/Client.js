const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose,4);
const { Schema,model } = mongoose;

const ClientSchema = new Schema({
    client_number: String,
    customer_key: String,
    representative: String,
    name: String,
    rfc: String,
    curp: String,
    phone: String,
    mobile: String,
    email: {
        type: String,
        unique: true,
        trim: true
    },
    comment: String,
    discont: String,
    credit_limit: Float,
    credit_days: Number,
    social_reason: String,
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

});

module.exports = model("client", ClientSchema);