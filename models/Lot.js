const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose,4);
const { Schema,model } = mongoose;

const LotSchema = new Schema({
    purchase_price: Float,
    purchase_price_penny: Number,
    
},{ 
    timestamps: true
});

module.exports = model("lot",LotSchema);