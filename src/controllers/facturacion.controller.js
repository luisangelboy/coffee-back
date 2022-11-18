const FacturacionCtrl = {};
const SerieCFDI = require("../models/SerieCFDI");
const Factura = require("../models/Factura");
const NotaCreditoNodel = require("../models/NotasCredito");
const EmpresaModel = require("../models/Empresa");
const Facturama = require("../billing/Facturama/facturama.api.multiemisor");
const moment = require("moment");
const mongoose = require("mongoose");

FacturacionCtrl.crearFactura = async (input) => {
  try {
    const {
      serie,
      currency,
      expedition_place,
      folio,
      cfdi_type,
      payment_form,
      payment_method,
      logo_url,
      date,
      issuer,
      receiver,
      items,
      empresa,
      sucursal,
      id_venta,
      folio_venta,
    } = input;

    const {
      limite_timbres,
      timbres_usados,
      sello_sat,
    } = await EmpresaModel.findById(input.empresa);

    //Crea Factura Api
    var newCfdi = {
      Issuer: issuer,
      Receiver: receiver,
      CfdiType: cfdi_type,
      Currency: currency,
      Serie: serie,
      NameId: "1",
      Folio: folio,
      ExpeditionPlace: expedition_place,
      PaymentForm: payment_form,
      PaymentMethod: payment_method,
      LogoUrl: logo_url,
      Date: date,
      Items: items,
    };

    /* console.log(newCfdi);
    console.log(items, items[0].Taxes[0]); */

    const serie_cfdi = await SerieCFDI.findOne({ default: true });

    if (!serie_cfdi) {
      throw new Error("No hay una SERIE CFDI registrada por defecto");
    }

    //sumar folio para mas tarde actualizar si es que se realiza la factura
    let new_folio = serie_cfdi.folio + 1;

    let nosy;
    let totalTimbresUsados = timbres_usados + 1;
    if (totalTimbresUsados <= limite_timbres) {
      nosy = await Facturama.Cfdi.Create(newCfdi);

      if (nosy.success) {
        //Actualiza empresa numero timbres
        await EmpresaModel.findByIdAndUpdate(input.empresa, {
          timbres_usados: totalTimbresUsados,
        });

        //Crea nuevo modelo Factura
        const nuevaFactura = new Factura({
          serie: nosy.data.Serie,
          expedition_place: nosy.data.ExpeditionPlace,
          folio: nosy.data.Folio,
          cfdi_type: nosy.data.CfdiType,
          payment_form: nosy.data.PaymentTerms,
          payment_method: nosy.data.PaymentMethod,
          logo_url: input.logo_url,
          date: nosy.data.Date,
          issuer: nosy.data.Issuer,
          receiver: nosy.data.Receiver,
          items: nosy.data.Items,
          taxes: nosy.data.Taxes,
          complement: nosy.data.Complement,
          id_cfdi: nosy.data.Id,
          original_string: nosy.data.OriginalString,
          sub_total: nosy.data.Subtotal,
          total: nosy.data.Total,
          discount: nosy.data.Discount,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format("YYYY-MM-DD"),
          id_venta,
          tipo: "FACTURA",
          folio_venta,
          empresa,
          sucursal,
        });

        await nuevaFactura.save();

        let pdfBase64 = await downloadDocumentCfdi("pdf", nosy.data.Id);
        let xmlBase64 = await downloadDocumentCfdi("xml", nosy.data.Id);
        //console.log(pdfBase64, xmlBase64);

        //actualizar el folio
        await SerieCFDI.findByIdAndUpdate(serie_cfdi._id, { folio: new_folio });

        return {
          success: nosy.success,
          message: "Factura generada correctamente.",
          pdf: pdfBase64,
          xml: xmlBase64,
        };
      } else {
        throw new Error(nosy.message);
      }
    } else {
      throw new Error("Has llegado a tu límite de timbres");
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

FacturacionCtrl.crearComplementoPago = async (input) => {
  try {
    const {
      id_factura,
      id_venta,
      PartialityNumber,
      amount,
      previousBalanceAmount,
      amountPaid,
      ImpSaldoInsoluto,
      empresa,
      sucursal,
    } = input;

    const {
      limite_timbres,
      timbres_usados,
      sello_sat,
    } = await EmpresaModel.findById(empresa);

    const serie_cfdi = await SerieCFDI.findOne({ default: true });

    if (!serie_cfdi) {
      throw new Error("No hay una SERIE CFDI registrada por defecto");
    }

    //sumar folio para mas tarde actualizar si es que se realiza la factura

    let nosy;
    let totalTimbresUsados = timbres_usados + 1;
    const {
      issuer,
      receiver,
      complement,
      expedition_place,
      folio,
      folio_venta,
      payment_method,
      logo_url,
    } = await Factura.findOne({ id_venta, tipo: "FACTURA" });

    var newCfdi = {
      Issuer: {
        FiscalRegime: issuer.FiscalRegime.split(" ")[0],
        Rfc: issuer.Rfc,
        Name: issuer.TaxName,
      },
      Receiver: {
        Rfc: receiver.Rfc,
        Name: receiver.Name,
        CfdiUse: "P01",
      },
      LogoUrl: logo_url,
      CfdiType: "P",
      Folio: serie_cfdi.folio,
      Serie: serie_cfdi.serie,
      NameId: "14",
      ExpeditionPlace: expedition_place,
      Complemento: {
        Payments: [
          {
            Date: moment().locale("es-mx").format(), // La fecha en que se está realizando el abono
            PaymentForm: "01",
            Amount: amount, //Es el pago de este abono
            RelatedDocuments: [
              {
                Uuid: complement.TaxStamp.Uuid,
                Folio: folio,
                PaymentMethod: payment_method.split(" ")[0],
                PartialityNumber: PartialityNumber,
                PreviousBalanceAmount: previousBalanceAmount, //La cantidad que debes antes del abono
                AmountPaid: amountPaid, //cantidad del abono
                ImpSaldoInsoluto: ImpSaldoInsoluto, //lo que queda restante
              },
            ],
          },
        ],
      },
    };

    if (totalTimbresUsados <= limite_timbres) {
      nosy = await Facturama.Cfdi.Create(newCfdi);

      if (nosy.success) {
        //Actualiza empresa numero timbres
        await EmpresaModel.findByIdAndUpdate(empresa, {
          timbres_usados: totalTimbresUsados,
        });

        //Actualizar la factura
        const nuevaFactura = new Factura({
          serie: nosy.data.Serie,
          expedition_place: nosy.data.ExpeditionPlace,
          folio: nosy.data.Folio,
          cfdi_type: nosy.data.CfdiType,
          payment_form: nosy.data.PaymentTerms,
          payment_method: nosy.data.PaymentMethod,
          logo_url: input.logo_url,
          date: nosy.data.Date,
          issuer: nosy.data.Issuer,
          receiver: nosy.data.Receiver,
          items: nosy.data.Items,
          taxes: nosy.data.Taxes,
          complement: nosy.data.Complement,
          id_cfdi: nosy.data.Id,
          original_string: nosy.data.OriginalString,
          sub_total: nosy.data.Subtotal,
          total: nosy.data.Total,
          discount: nosy.data.Discount,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format("YYYY-MM-DD"),
          id_venta,
          type: nosy.data.Type,
          tipo: "COMPLEMENTO",
          folio_venta,
          empresa,
          sucursal,
        });

        await nuevaFactura.save();
        //Ver que retorna

        let pdfBase64 = await downloadDocumentCfdi("pdf", nosy.data.Id);
        let xmlBase64 = await downloadDocumentCfdi("xml", nosy.data.Id);
        //console.log(pdfBase64, xmlBase64);

        //actualizar el folio
        let new_folio = serie_cfdi.folio + 1;
        await SerieCFDI.findByIdAndUpdate(serie_cfdi._id, { folio: new_folio });

        return {
          pdf: pdfBase64,
          xml: xmlBase64,
        };
      } else {
        throw new Error(nosy.message);
      }
    } else {
      throw new Error("Has llegado a tu límite de timbres");
    }
  } catch (error) {
    console.log("crearComplementoPago", error);
    throw new Error(error);
  }
};

FacturacionCtrl.crearNotaCredito = async (input) => {
  try {
    const { id_venta, nota_credito, folio_venta, empresa, sucursal } = input;
    const { limite_timbres, timbres_usados } = await EmpresaModel.findById(
      empresa
    );

    const serie_cfdi = await SerieCFDI.findOne({ default: true });
    if (!serie_cfdi) {
      throw new Error("No hay una SERIE CFDI registrada por defecto");
    }

    //sumar folio para mas tarde actualizar si es que se realiza la factura
    let totalTimbresUsados = timbres_usados + 1;
    const cfdi_db = await Factura.findOne({ id_venta, tipo: "FACTURA" });

    let items = [];
    nota_credito.productos.forEach((item) => {
      let { iva, ieps } = item.id_producto.precios;
      let Taxes = [];

      if (item.iva_total_producto) {
        Taxes.push({
          Total: item.iva_total_producto.toFixed(2),
          Name: "IVA",
          Base: item.subtotal_total_producto.toFixed(2),
          Rate: `0.${iva < 10 ? `0${iva}` : iva}`,
          IsRetention: "false",
        });
      }
      if (item.ieps_total_producto) {
        Taxes.push({
          Total: item.ieps_total_producto.toFixed(2),
          Name: "IEPS",
          Base: item.subtotal_total_producto.toFixed(2),
          Rate: `0.${ieps < 10 ? `0${ieps}` : ieps}`,
          IsRetention: "true",
        });
      }
      items.push({
        Quantity: item.cantidad_venta,
        ProductCode: item.id_producto.datos_generales.clave_producto_sat.Value,
        UnitCode: item.codigo_unidad,
        Unit: item.unidad,
        Description: item.id_producto.datos_generales.nombre_comercial,
        UnitPrice: item.precio_unidad.precio_venta,
        Subtotal: item.subtotal_total_producto,
        TaxObject: "02",
        Taxes,
        Total: item.total_total_producto,
      });
    });

    var newCfdi = {
      Issuer: {
        FiscalRegime: cfdi_db.issuer.FiscalRegime.split(" ")[0],
        Rfc: cfdi_db.issuer.Rfc,
        Name: cfdi_db.issuer.TaxName,
      },
      Receiver: {
        Rfc: cfdi_db.receiver.Rfc,
        Name: cfdi_db.receiver.Name,
        CfdiUse: "G02",
      },
      NameId: "2",
      CfdiType: "E",
      ExpeditionPlace: cfdi_db.expedition_place,
      LogoUrl: cfdi_db.logo_url,
      PaymentForm: nota_credito.payment_form,
      PaymentMethod: nota_credito.payment_method,
      Folio: serie_cfdi.folio,
      Serie: serie_cfdi.serie,
      Relations: {
        Type: "01",
        Cfdis: [{ Uuid: cfdi_db.complement.TaxStamp.Uuid }],
      },
      Items: items,
    };
    
    if (totalTimbresUsados <= limite_timbres) {
      const nosy = await Facturama.Cfdi.Create(newCfdi);

      if (nosy.success) {
        //Actualiza empresa numero timbres
        await EmpresaModel.findByIdAndUpdate(empresa, {
          timbres_usados: totalTimbresUsados,
        });

        //Crear la factura
        const nuevaFactura = new Factura({
          serie: nosy.data.Serie,
          expedition_place: nosy.data.ExpeditionPlace,
          folio: nosy.data.Folio,
          cfdi_type: nosy.data.CfdiType,
          payment_form: nosy.data.PaymentTerms,
          payment_method: nosy.data.PaymentMethod,
          logo_url: input.logo_url,
          date: nosy.data.Date,
          issuer: nosy.data.Issuer,
          receiver: nosy.data.Receiver,
          items: nosy.data.Items,
          taxes: nosy.data.Taxes,
          complement: nosy.data.Complement,
          cert_number: nosy.data.CertNumber,
          currency: nosy.data.Currency,
          id_cfdi: nosy.data.Id,
          original_string: nosy.data.OriginalString,
          sub_total: nosy.data.Subtotal,
          total: nosy.data.Total,
          discount: nosy.data.Discount,
          year_registro: moment().locale("es-mx").year(),
          numero_semana_year: moment().locale("es-mx").week(),
          numero_mes_year: moment().locale("es-mx").month(),
          fecha_registro: moment().locale("es-mx").format("YYYY-MM-DD"),
          id_venta,
          id_nota: nota_credito._id,
          type: nosy.data.Type,
          tipo: "NOTA_CREDITO",
          folio_venta,
          empresa,
          sucursal,
        });

        //actualizar nota credito document model
        await NotaCreditoNodel.findByIdAndUpdate(nota_credito._id, {
          id_factura: nuevaFactura._id
        })

        await nuevaFactura.save();
        //Ver que retorna

        let pdfBase64 = await downloadDocumentCfdi("pdf", nosy.data.Id);
        let xmlBase64 = await downloadDocumentCfdi("xml", nosy.data.Id);
        //console.log(pdfBase64, xmlBase64);

        //actualizar el folio
        let new_folio = serie_cfdi.folio + 1;
        await SerieCFDI.findByIdAndUpdate(serie_cfdi._id, { folio: new_folio });

        return {
          id_factura: nuevaFactura._id,
          success: nosy.success,
          message: "Factura generada correctamente.",
          pdf: pdfBase64,
          xml: xmlBase64,
        };
      } else {
        throw new Error(nosy.message);
      }
    } else {
      throw new Error("Has llegado a tu límite de timbres");
    }
  } catch (error) {
    console.log("crearNotaCredito", error);
    throw new Error(error);
  }
};

async function downloadDocumentCfdi(format, id) {
  try {
    let nosy = await Facturama.Cfdi.Download(format, "issuedLite", id);
    return nosy.data;
  } catch (error) {
    throw new Error("Ocurrió un error al realizar la consulta...");
  }
}

FacturacionCtrl.obtenerDocumentCfdi = async (id) => {
  try {
    let htmlBase64 = await downloadDocumentCfdi("html", id);
    let pdfBase64 = await downloadDocumentCfdi("pdf", id);
    let xmlBase64 = await downloadDocumentCfdi("xml", id);

    return {
      htmlBase64: htmlBase64,
      pdfBase64: pdfBase64,
      xmlBase64: xmlBase64,
    };
  } catch (error) {
    throw new Error("Ocurrió un error al realizar la consulta...");
  }
};

FacturacionCtrl.crearCSDS = async (input) => {
  console.log("entra a crear");
  try {
    const {
      rfc,
      certificate,
      private_key,
      private_key_password,
      nombre_cer,
      nombre_key,
    } = input;

    var csds = {
      Rfc: rfc,
      Certificate: certificate,
      PrivateKey: private_key,
      PrivateKeyPassword: private_key_password,
    };
    let nosy = await Facturama.Certificates.Create(csds);

    if (nosy.success) {
      //Cambia a true Sello_Sat de la empresa
      await EmpresaModel.findByIdAndUpdate(input.empresa, {
        sello_sat: true,
        nombre_key: nombre_key,
        nombre_cer: nombre_cer,
        fecha_registro_sello_sat: moment().locale("es-mx").format(),
      });
      return { message: nosy.message, success: nosy.success };
    } else {
      let msj = nosy.message;
      throw new Error(msj);
    }
  } catch (error) {
    console.log("CATCH ERROR", error);
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta...");
  }
};

FacturacionCtrl.eliminarCSD = async (rfc, empresa) => {
  try {
    let nosy = await Facturama.Certificates.Remove(rfc);
    if (nosy.success) {
      await EmpresaModel.findByIdAndUpdate(empresa, {
        sello_sat: false,
        nombre_key: "",
        nombre_cer: "",
        fecha_registro_sello_sat: "",
      });
      return { message: nosy.message };
    } else {
      throw new Error(
        "Hubo un error al eliminar el CSDS o ya fué eliminado anteriormente."
      );
    }
  } catch (error) {
    return error;
    //throw new Error("Ocurrió un error ...");
  }
};

FacturacionCtrl.obtenerProductosOServicios = async (input) => {
  try {
    let nosy = await Facturama.Catalogs.ProductsOrServices(input.value);

    return nosy.success
      ? { productosOServicios: nosy.data, message: "Consulta exitosa..." }
      : { message: "Ocurrió un error al realizar la consulta..." };
  } catch (error) {
    //console.log(error);
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta...");
  }
};

FacturacionCtrl.obtenerCodigoPostal = async (input) => {
  try {
    let nosy = await Facturama.Catalogs.PostalCodes(input.value);
    return nosy.success
      ? { codigoPostal: nosy.data, message: "Consulta exitosa..." }
      : { message: nosy.message };
  } catch (error) {
    //console.log(error);
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta...");
  }
};
FacturacionCtrl.obtenerCfdiUses = async (input) => {
  try {
    let nosy = await Facturama.Catalogs.CfdiUses(input.value);
    return nosy.success
      ? {
          cfdiUses: nosy.data,
          message: nosy.data
            ? "Consulta exitosa..."
            : "No se encontraron resultados...",
        }
      : { message: "Ocurrió un error al realizar la consulta..." };
  } catch (error) {
    //console.log(error);
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta...");
  }
};
FacturacionCtrl.obtenerCatalogosSAT = async (input) => {
  try {
    let response = {
      // States: null,
      // Municipalities: null,
      // Localities: null,
      // Neighborhoods: null,
      //ProductsOrServices: null,
      // PostalCodes: null,
      //Units: null,
      currencies: null,
      // Countries: null,
      paymentForms: null,
      paymentMethods: null,
      //FederalTaxes: null,
      fiscalRegimens: null,
      cfdiTypes: null,
      message: "",
      //RelationTypes: null,
      //CfdiUses: null
    };

    let nosy = await Facturama.Catalogs.Currencies();

    response.currencies = nosy.success ? nosy.data : [];

    nosy = await Facturama.Catalogs.PaymentForms();
    response.paymentForms = nosy.success ? nosy.data : [];

    nosy = await Facturama.Catalogs.PaymentMethods();
    response.paymentMethods = nosy.success ? nosy.data : [];

    nosy = await Facturama.Catalogs.FiscalRegimens();
    response.fiscalRegimens = nosy.success ? nosy.data : [];

    nosy = await Facturama.Catalogs.CfdiTypes();
    response.cfdiTypes = nosy.success ? nosy.data : [];

    nosy.success
      ? (response.message = "Consulta exitosa.")
      : (response.message = "Ocurrió un error al realizar la consulta...");
    return response;
  } catch (error) {
    //console.log(error);
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta...");
  }
};

FacturacionCtrl.crearSerieCFDI = async (input) => {
  try {
    let nuevaSerie = input;
    nuevaSerie.serie = input.serie.toUpperCase();

    let message;
    let success = false;
    const series = await SerieCFDI.find();

    if (series.length === 0) {
      nuevaSerie.default = true;
    } else {
      if (nuevaSerie.default) {
        await SerieCFDI.updateMany(
          { empresa: input.empresa, sucursal: input.sucursal },
          { default: false }
        );
      }
    }

    const seriesCfdi = await SerieCFDI.find({ serie: nuevaSerie.serie });

    if (seriesCfdi.length > 0) {
      throw new Error("Esta serie ya se registró");
    } else {
      const serieCFDI = SerieCFDI(nuevaSerie);
      await serieCFDI.save();
      message = "La serie se ha creado correctamente.";
      success = true;
    }
    return { message: message, success: success };
  } catch (error) {
    return error;
    //throw new Error('Ocurrió un error...');
  }
};

FacturacionCtrl.obtenerSeriesCdfi = async (empresa, sucursal) => {
  try {
    const seriesCfdi = await SerieCFDI.find({ empresa, sucursal });

    return {
      message: "Consulta Exitosa",
      success: true,
      seriesCfdi: seriesCfdi,
    };
  } catch (error) {
    return error;
    //throw new Error("Ocurrió un error al realizar la consulta");
  }
};

FacturacionCtrl.modificarDefaultSerie = async (id, empresa, sucursal) => {
  try {
    await SerieCFDI.updateMany(
      { empresa: empresa, sucursal: sucursal },
      { default: false }
    );
    const serieCFDI = await SerieCFDI.findOneAndUpdate(
      { _id: id },
      { default: true }
    );
    return {
      message: "La serie " + serieCFDI.serie + " se asignó correctamente.",
      success: true,
    };
  } catch (error) {
    //console.log(error)
    return error;
    //throw new Error("Ocurrió un error ...");
  }
};
FacturacionCtrl.eliminarSerie = async (id) => {
  try {
    await SerieCFDI.findByIdAndDelete({ _id: id });
    return { message: "La serie se eliminó correctamente.", success: true };
  } catch (error) {
    return error;
    //throw new Error("Ocurrió un error ...");
  }
};

FacturacionCtrl.obtenerFacturas = async (
  empresa,
  sucursal,
  filtros,
  limit = 20,
  offset = 0
) => {
  try {
    let page = Math.max(0, offset);
    const { fecha, metodo_pago, forma_pago, busqueda } = filtros;

    let filtro_and = [
      { empresa: mongoose.Types.ObjectId(empresa) },
      { sucursal: mongoose.Types.ObjectId(sucursal) },
      {$or: [
        { tipo: "FACTURA" },
        { tipo: "NOTA_CREDITO" },
      ]}
    ];

    if (fecha) {
      const fecha_registro = moment(fecha).format("YYYY-MM-DD");
      filtro_and.push({
        fecha_registro,
      });
    }
    if (metodo_pago) {
      filtro_and.push({
        payment_method: metodo_pago,
      });
    }
    if (forma_pago) {
      filtro_and.push({
        payment_form: forma_pago,
      });
    }
    if (busqueda) {
      let filtro_base_or = [];
      filtro_base_or.push({
        folio: {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        folio_venta: {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "receiver.Name": {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      });
      filtro_base_or.push({
        "receiver.Rfc": {
          $regex: ".*" + busqueda + ".*",
          $options: "i",
        },
      });
      filtro_and.push({
        $or: filtro_base_or,
      });
    }

    const paginate_conf = [{ $skip: limit * page }];

    if (limit) {
      paginate_conf.push({ $limit: limit });
    }

    const facturas = await Factura.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $match: {
          $and: filtro_and,
        },
      },
      {
        $lookup: {
          from: "facturas",
          let: {
            folio_venta: "$folio_venta",
            empresa: `${empresa}`,
            sucursal: `${sucursal}`,
            tipo: "COMPLEMENTO",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$folio_venta", "$$folio_venta"] },
                    { $eq: ["$empresa", { $toObjectId: "$$empresa" }] },
                    { $eq: ["$sucursal", { $toObjectId: "$$sucursal" }] },
                    { $eq: ["$tipo", "$$tipo"] },
                  ],
                },
              },
            },
          ],
          as: "complementos",
        },
      },
      {
        $facet: {
          docs: paginate_conf,
          totalDocs: [
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    return facturas[0].docs.length
      ? {
          docs: facturas[0].docs,
          totalDocs: facturas[0].totalDocs[0].count,
        }
      : { docs: [], totalDocs: 0 };
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = FacturacionCtrl;

/*    var newCfdi = {
        "Issuer": {
            "FiscalRegime": "601",
            "Rfc": "JES900109Q90",
            "Name": "EXPRESION EN SOFTWARE"
        }, 
        "Receiver": {
            "Name": "Entidad receptora",
            "CfdiUse": "P01",
            "Rfc": "XAMA620210DQ5"        
        },
        "CfdiType": "I",
        "Serie": "B",	
        "NameId": "1",
        "Folio": "100",
        "ExpeditionPlace": "48900",
        "PaymentForm": "03",
        "PaymentMethod": "PUE",        
        "LogoUrl":"https://www.ejemplos.co/wp-content/uploads/2015/11/Logo-Chanel.jpg",
        "Date": "2021-12-21T13:58:41",
        "Items": [
            {
                ProductCode: "50202306",
                IdentificationNumber: "61b7bf6e3454b727a0c2e357",
                Description: "COCACOLA",
             
                UnitCode: "XBX",
                UnitPrice: "36",
                Quantity: "1",
                Subtotal: "36",
                Discount: "5.4",
                Taxes: [
                {
                    Total: "4.89",
                    Name: "IVA",
                    Base: "30.6",
                    Rate: "0.16",
                    IsRetention: "false",
                },
                ],
                Total: "35.49",
            },
        ]
    };  */

/* var newCfdi = {
        "Issuer": {
            "FiscalRegime": "601",
            "Rfc": "IIA040805DZ4",
            "Name": "Empresa UrielSof"
        }, 
        "Receiver": {
            "Rfc": "IXS7607092R5",
            "Name": "Tacos marta actu",
            "CfdiUse": "G03"       
        },
        "CfdiType": "I",
        "Serie": "A",
        "Currency": "MXN",	
        "NameId": "1",
        "Folio": "1",
        "ExpeditionPlace": "48900",
        "PaymentForm": "03",
        "PaymentMethod": "PUE",        
        "LogoUrl":"https://cafi-sistema-pos.s3.amazonaws.com/usuarios/1624913639977.png",
        "Date": "2022-05-05T10:45:14",
        "Items": [
            {
            "ProductCode": "50202306",
            "IdentificationNumber": "61b7bf6e3454b727a0c2e357",
            "Description": "COCACOLA",
            "UnitCode": "XBX",
            "UnitPrice": "36",
            "Quantity": "1",
            "Subtotal": "36",
            "Discount": "5.4",
            "Taxes": [
                {
                    "Total": "4.89",
                    "Name": "IVA",
                    "Base": "30.6",
                    "Rate": "0.16",
                    "IsRetention": "false",
                },
            ],
            "Total": "35.49",
        },
        ]
    };  */

/* var newCfdi = {

        "Issuer": {
            "FiscalRegime": "609",
            "Rfc": "IIA040805DZ4",
            "Name": "EXPRESION EN SOFTWARE"
        }, 
        "Receiver": {
            "Name": "Entidad receptora",
            "CfdiUse": "P01",
            "Rfc": "XAMA620210DQ5"        
        },
        "CfdiType": "I",
        "Serie": "B",   
        "NameId": "1",
        "Folio": "100",
        "ExpeditionPlace": "78216",
        "PaymentForm": "03",
        "PaymentMethod": "PUE",        
        "LogoUrl":"https://www.ejemplos.co/wp-content/uploads/2015/11/Logo-Chanel.jpg",
        "Date": "2021-12-22T09:51:39",
        "Items": [
            {
                "Quantity": "100",
                "ProductCode": "84111506",
                "UnitCode": "E48",                
                "Description": " API folios adicionales",
                "IdentificationNumber": "23",
                "UnitPrice": "0.50",
                "Subtotal": "50.00",            
                "Discount": "10",
                "DiscountVal": "10",
                "Taxes": [
                    {
                        "Name": "IVA",
                        "Rate": "0.16",
                        "Total": "6.4",
                        "Base": "40",
                        "IsRetention": "false"
                    }],
                "Total": "46.40"
            },
            {
                "Quantity": "1",
                "ProductCode": "84111506",
                "UnitCode": "E48",                
                "Description": " API Implementación ",
                "IdentificationNumber": "21",
                "UnitPrice": "6000.00",
                "Subtotal": "6000.00",
                "Taxes": [
                    {
                        "Name": "IVA",
                        "Rate": "0.16",
                        "Total": "960",
                        "Base": "6000",
                        "IsRetention": "false"
                    }],
                "Total": "6960.00"
            }
        ]
    };   */
