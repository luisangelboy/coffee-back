

var axios = require("axios");

var valuesFacturama = {
    token: "QUJTT0xVQ0lPTkVTOkxlb24yMDE4Iw==",
    //:"QWxhZGRpbjpvcGVuIHNlc2FtZQ==",
    url: "https://apisandbox.facturama.mx/"
};

    function facturama() {

        var settings = {
            url: valuesFacturama.url
        };

        async function retrieve(path, id, callback) {
            let resultado = null;
            await axios.get( settings.url + path + '/' + id, 
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
               //console.log(res.data.Content)
               
                resultado = {data: res.data.Content, success:true};
            })
            .catch(err => {
                
                resultado = {message: err.response.data.Message, success:false};
            });
           
             return resultado;
        }

        async function list(path, callback) {
         console.log(path)
          let resultado = null;
            await axios.get( settings.url + path, 
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
            //   console.log("ORA",res.data)
                resultado = {data: res.data, success:true};
            })
            .catch(err => {
                resultado = {message: err.response.data.Message, success:false};
            });
            return resultado;
        }

        async function listWithParam(path, param, callback) {
            axios.get(settings.url + path + param, 
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
               //console.log(res.data)
                return res.data;
            })
            .catch(err => {
                console.log('Error: ', err);
                return err.response.data.Message;
            });
        }

        async function  postSyncWithParam(path, param, callback)  {
            let resultado = null;
            axios.post(settings.url + path + param, 
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
               //console.log(res.data)
                return res.data;
            })
            .catch(err => {
                console.log('Error: ', err);
                return err.response.data.Message;
            });
        }

        async function postSyncWithData(path, data, callback, callbackError) {
           let resultado = null;
           
            const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + valuesFacturama.token
            }
             await axios.post(settings.url + path, 
                data,
                 {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}).then(res => {
              
                    resultado = {data:res.data, success:true};
                 })
            .catch(err => {
                /* console.log(err) */
                let message = '';
                if(err.response.data.ModelState){
                    message = Object.values(err.response.data.ModelState)[0];  
                }else{
                    message = err.response.data.Message;       
                }
              //console.log(Object.values(err.response.data.ModelState)[0][0])
              resultado = {message:message, success:false}
                
            });
        
           return resultado;
        }

        async function putSyncWithData(path, data, callback, callbackError) {
                console.log("3putSyncWithData" + settings.url + path )
            await axios.put(settings.url + path, 
                JSON.stringify({data}),
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
               //console.log(res.data)
                return res.data;
            })
            .catch(err => {
                console.log('Error: ', err);
                
                return err.response.data.Message;
            });
           
        }

        async function deleteSyncWithParam(path, param, callback, callbackError) {
           
            let resultado;
            await axios.delete(settings.url + path + '/' + param, 
             
                {headers: {'Authorization': 'Basic ' + valuesFacturama.token}, 
                responseType: 'json'}
            ).then(res => {
             
                 resultado = {message:'Se ha eliminado el CSDS correctamente.', success:true}
                
            })
            .catch(err => {
          
                 resultado = {message:'Falló al eliminar el CSDS', success:false}
               
            });

             console.log(resultado)
           return resultado;
        }

        var facturamaObject = {
            Cfdi: {
                Get: function (id, callback) {
                    console.log(id)
                    return retrieve('api-lite/cfdis', id, callback);
                },
                List: function (param, callback) {
                    return listWithParam('api-lite/cfdis', param, callback);
                },
                Create: function (data, callback, callbackError) {
                    return postSyncWithData('api-lite/2/cfdis', data, callback, callbackError);
                },
                Send: function (param, callback) {
                    return postSyncWithParam('cfdi', param, callback);
                },
                Cancel: function (params, callback, callbackError) {
                    return deleteSyncWithParam('api-lite/cfdis', params, callback, callbackError);
                },
                Download: function (format, type, id, callback) {
                    
                   return retrieve('cfdi/' + format + '/' + type, id, callback);
                },
                Acuse: function (format, type, id, callback) {
                    return retrieve('acuse/' + format + '/' + type, id, callback);
                }
            },
            Certificates: {
                Get: function (param, callback) {
                    return listWithParam('api-lite/csds/', param, callback);
                },
                List: function (callback) {
                    return list('api-lite/csds', callback);
                },
                Create: function (data, callback, callbackError) {
                    return postSyncWithData('api-lite/csds', data, callback, callbackError);
                },
                Update: function (param, data, callback, callbackError) {
                    putSyncWithData('api-lite/csds/' + param, data, callback, callbackError);
                },
                Remove: function (params, callback, callbackError) {
                    return deleteSyncWithParam('api-lite/csds', params, callback, callbackError);
                }
            },
            Catalogs: {
                States: async function (country, callback) {
                
                    return await list('catalogs/municipalities?countryCode' + country, callback);
                },
                Municipalities: function (state, callback) {
                    return list('catalogs/municipalities?stateCode' + state, callback);
                },
                Localities: function (state, callback) {
                    return list('catalogs/localities?stateCode' + state, callback);
                },
                Neighborhoods: function (postalCode, callback) {
                    return list('catalogs/neighborhoods?postalCode' + postalCode, callback);
                },
                ProductsOrServices: function (keyword, callback) {
                    return list('catalogs/ProductsOrServices?keyword=' + keyword, callback);
                },
                PostalCodes: function (keyword, callback) {
                    return list('catalogs/PostalCodes?keyword=' + keyword, callback);
                },
                Units: function (callback) {
                    return list('catalogs/Units', callback);
                },
                Currencies: function (callback) {
                    return list('catalogs/Currencies', callback);
                },
                Countries: function (callback) {
                    return list('catalogs/Countries', callback);
                },
                PaymentForms: function (callback) {
                    return list('catalogs/PaymentForms', callback);
                },
                PaymentMethods: function (callback) {
                    return list('catalogs/PaymentMethods', callback);
                },
                FederalTaxes: function (callback) {
                    return list('catalogs/FederalTaxes', callback);
                },
                FiscalRegimens: function (callback) {
                    return list('catalogs/FiscalRegimens', callback);
                },
                CfdiTypes: function (callback) {
                    return list('catalogs/CfdiTypes', callback);
                },
                RelationTypes: function (callback) {
                    return list('catalogs/RelationTypes', callback);
                },
                CfdiUses: function (keyword, callback) {
                    return list('catalogs/CfdiUses?keyword=' + keyword, callback);
                }
            }
        };

        facturamaObject.getToken = function () {
            return "Basic " + valuesFacturama.token;
        };

        facturamaObject.getBaseUri = function () {
            return settings.url;
        };

        return facturamaObject;
    }

module.exports =  facturama();