require("dotenv").config({path: ".env"});
const tokenCtrl = {};
const jwt = require("jsonwebtoken");

tokenCtrl.createToken = async (payload, expiresIn) => {
    /* const payload = {
        id,
        name,
        password
    }; */
    const token = jwt.sign(payload,process.env.SECREY_KEY_TOKEN,{expiresIn});
    return token;
}


module.exports = tokenCtrl;