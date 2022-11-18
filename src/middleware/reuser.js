const { eliminarImagen } = require("./aws_uploads");

const toUpperConvert = (value) => {
  if (Array.isArray(value)) {
    return value.map(toUpperConvert);
  } else if (value !== null && typeof value === "object") {
    const newObject = {};
    for (const property in value)
      if (
        property !== "email" &&
        property !== "imagen" &&
        property !== "_id" &&
        property !== "id_categoria" &&
        property !== "id_subcategoria" &&
        property !== "id_departamento" &&
        property !== "id_marca" &&
        property !== "password" &&
        property !== "repeatPassword" &&
        property !== "empresa" &&
        property !== "sucursal" &&
        property !== "accesos" &&
        typeof value[property] === "string"
      ) {
        newObject[property] = toUpperConvert(value[property].toUpperCase());
      } else {
        newObject[property] = toUpperConvert(value[property]);
      }

    return newObject;
  } else {
    return value;
  }
};

const generateCode = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789¿¡?-!<>=#$%^&*~";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const generateNumCertifictate = (length) => {
  var result = "";
  for (var i = 0; i < length; i++) {
    result += Math.floor(Math.random() * Math.floor(length));
  }
  return result;
};

// const deleteObjectsArray = async (firstArray, secondArray, deleteImage, keyArray) => {
//       for(i=0; i < firstArray.length; i++){
//         for(z=0; z < Object.keys(firstArray[i]).length; z++){
//               var resultado = Object.keys(firstArray[i])[z]; // Sera el valor del key test
//               console.log(resultado);
//         }
//       }
//     for(i=0; i < firstArray.length; i++){
//       // if(firstArray[i].[keyArray] === secondArray[z].[keyArray]){
//       // }
//     }
// }

module.exports = {
  generateCode,
  generateNumCertifictate,
  toUpperConvert,
};
