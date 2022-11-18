const ConceptoCtrl = {};
const ConceptoAlmacenModel = require("../models/ConceptoAlmacen");
const TraspasosAlmacenModel = require("../models/Traspasos");
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");

let conceptsDefault = [
        {nombre_concepto:'SALDO INICIAL',origen:'N/A', destino:'SUMA', editable:false,_id:1},
        {nombre_concepto:'MERMAS',origen:'RESTA', destino:'SUMA', editable:false,_id:2},
        {nombre_concepto:'SALIDAS POR TRASPASOS',origen:'RESTA', destino:'SUMA', editable:false, _id:3},
        {nombre_concepto:'DEVOLUCION DE CLIENTES',origen:'N/A', destino:'SUMA', editable:false, _id:4},
        {nombre_concepto:'DEVOLUCION DE PROVEEDORES',origen:'RESTA', destino:'N/A', editable:false, _id:5},
        {nombre_concepto:'ENTRADA POR AJUSTE',origen:'N/A', destino:'SUMA', editable:false, _id:6},
        {nombre_concepto:'SALIDA POR AJUSTE',origen:'RESTA', destino:'N/A', editable:false, _id:7}
    ];
ConceptoCtrl.crearConceptoAlmacen = async (input, empresa, sucursal, usuario) => {
    try {
        const Models =  await CloudFunctions.getModels(['ConceptoAlmacen']);
        const { nombre_concepto, origen, destino } = input;

            conceptsDefault.forEach(element => {
                if(element.nombre_concepto === nombre_concepto.toUpperCase()){
                     throw new Error("El nombre de concepto ya fué agregado");
                }
            });

            const concepto_existente = await Models.ConceptoAlmacen.find({
            nombre_concepto: nombre_concepto.toUpperCase(),
            });

            if (concepto_existente.length ) {
                throw new Error("El nombre de concepto ya fué agregado");
            } else {
            const newConceptoAlmacen = new  Models.ConceptoAlmacen({
                nombre_concepto: nombre_concepto.toUpperCase(),
                origen,
                destino,
                editable:true,
                empresa,
                sucursal,
                usuario
            });
            await newConceptoAlmacen.save();
            await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ConceptoAlmacen',   moment(newConceptoAlmacen.updatedAt).locale("es-mx").format());  
            await UsuariosController.actualizarBDLocal(empresa, sucursal); 
            return {
                message: "Concepto agregado."
            }
        }
    } catch (error) {
      
		return error;   
    }
}

ConceptoCtrl.actualizarConceptoAlmacen = async (input, id, empresa, sucursal) => {
    try {
        const Models =  await CloudFunctions.getModels(['ConceptoAlmacen']);
        const { nombre_concepto, origen, destino } = input;
        conceptsDefault.forEach(element => {
            if(element.nombre_concepto === nombre_concepto.toUpperCase()){
                    throw new Error("El nombre de concepto ya fué agregado");
            }
        });
        const concepto_existente = await Models.ConceptoAlmacen.find({
        nombre_concepto: nombre_concepto.toUpperCase(),
        });

        if (concepto_existente.length ) {
             throw new Error("El nombre de concepto ya fué agregado");
        } else {
            await Models.ConceptoAlmacen.findByIdAndUpdate(id,{nombre_concepto:nombre_concepto.toUpperCase(), origen, destino});
            const conceptoAlmUpdated =  Models.ConceptoAlmacen.findById(id);
            await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ConceptoAlmacen',   moment(conceptoAlmUpdated.updatedAt).locale("es-mx").format());  
            await UsuariosController.actualizarBDLocal(empresa, sucursal); 
            return {
                message: "Concepto editado."
            }
        }
    } catch (error) {
        console.log(error);
		return error;
    }
}

ConceptoCtrl.eliminarConceptoAlmacen = async (id, empresa, sucursal) => {
    try {
        // const conceptoElegido = await TraspasosAlmacenModel.find().where(});
        // if (marcaElegida.length > 0) {
        // return {
        //     message: `No es posible eliminar esta marca, productos existentes: ${marcaElegida.length}`,
        // };
        const Models =  await CloudFunctions.getModels(['ConceptoAlmacen']);
        const servicioBase = await Models.ConceptoAlmacen.findById(id);
        if(servicioBase){
            await Models.ConceptoAlmacen.findByIdAndDelete(id);
            await ConceptoAlmacenModel.findByIdAndDelete(id);
            const fechaModificacion = moment().locale("es-mx").format();
            await CloudFunctions.changeDateCatalogoUpdate(empresa, 'ConceptoAlmacen',  fechaModificacion);  
            return {
                message: "Concepto eliminado."
            }
        }else{
            throw new Error("Este concepto no existe.");
        }
    } catch (error) {
        console.log(error)
		return error;
    }
}

ConceptoCtrl.obtenerConceptosAlmacen = async (empresa, sucursal) => {
    try {
    
        let conceptos = await ConceptoAlmacenModel.find({empresa, sucursal}).populate("empresa sucursal usuario").sort({nombre_concepto:1});
        conceptsDefault.map(con => conceptos.push(con))
     
        return conceptos;
    } catch (error) {console.log(error);
		return error;
	
    }
}

module.exports = ConceptoCtrl;
