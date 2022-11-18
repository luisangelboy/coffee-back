const CuentasCtrl = {};
const Cuentas = require('../models/Cuentas');
const moment = require("moment");
const CloudFunctions = require("./CloudFunctions/cloudFunctions.controller");
const UsuariosController = require("./usuarios.controller");

CuentasCtrl.crearCuenta = async (input) => {
	try {
		const Models =  await CloudFunctions.getModels(['Cuentas']);
		const {cuenta, empresa, sucursal} = input;
		const newCuenta = new Models.Cuentas({cuenta: cuenta.toUpperCase(), empresa, sucursal}).populate('empresa sucursal');
		await newCuenta.save();
		await CloudFunctions.changeDateCatalogoUpdate(empresa, 'Cuentas',   moment(newCuenta.updatedAt).locale("es-mx").format());  
		await UsuariosController.actualizarBDLocal(empresa, sucursal); 
		return cuenta;
	} catch (error) { 
		console.log(error);
		return error;
	}
}

CuentasCtrl.crearSubcuenta = async (input, idCuenta, empresa, sucursal) => {
	try {
		const { subcuenta } = input;
		
		await Cuentas.updateOne(
			{ _id: idCuenta },
			{
				$addToSet: {
					subcuentas: {
						subcuenta: subcuenta.toUpperCase()
					}
				}
			}
		);
		return {
			message: 'Subcuenta guardada'
		};
	} catch (error) {
		console.log(error);
		return error;
	}
}

CuentasCtrl.actualizarCuenta = async (input, idCuenta, empresa, sucursal) => {
	try {
		const { cuenta } = input;
		await Cuentas.findByIdAndUpdate({ _id: idCuenta }, { cuenta :  cuenta.toUpperCase() });
		return {
			message: 'Cuenta actualizada'
		};
	} catch (error) {
		console.log(error);
		return {
			message: 'Ocurrio un error al actualizar el costo.'
		};
	}
}

CuentasCtrl.actualizarSubcuenta = async (input, idCuenta, idSubcuenta, empresa, sucursal) => {
	try {
		const { subcuenta } = input;
		await Cuentas.updateOne(
			{
				'subcuentas._id': idSubcuenta
			},
			{
				$set: {
					'subcuentas.$': {
						subcuenta: subcuenta.toUpperCase()
					}
				}
			}
		);
        return {
			message: 'Subcuenta actualizado'
		};
	} catch (error) {
		console.log(error);
		return {
			message: 'Ocurrio un error al actualizar la subcuenta'
		};
	}
}

CuentasCtrl.eliminarCuenta = async (idCuenta, empresa, sucursal) => {
	try {
		await Cuentas.findByIdAndDelete({ _id: idCuenta });
		return {
			message: 'Cuenta eliminada'
		};
	} catch (error) {
		console.log(error);
		return {
			message: 'Ocurrio un error al eliminar la cuenta'
		};
	} 
}

CuentasCtrl.eliminarSubcuenta = async (idCuenta, idSubcuenta, empresa, sucursal) => {
    try {
		await Cuentas.updateOne(
			{ _id: idCuenta },
			{
				$pull: {
					subcuentas: {
						_id: idSubcuenta
					}
				}
			}
		);
		return {
			message: 'SubCuenta eliminada'
		};
	} catch (error) {
		console.log(error);
		return {
			message: 'Ocurrio un error al eliminar la subcuenta'
		};
	}
}

CuentasCtrl.obtenerCuentas = async (empresa, sucursal) => {
	try {
		const cuentas = await Cuentas.find({empresa}).populate('empresa sucursal');
		return cuentas;
	} catch (error) {
		console.log(error);
		return error;
	}
}

module.exports = CuentasCtrl;
