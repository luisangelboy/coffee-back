const mongoose = require("mongoose");
var Float = require("mongoose-float").loadType(mongoose, 4);
const { Schema, model } = mongoose;

const FacturaSchema = new Schema(
  {
    id_cfdi: String,
    serie: String,
    expedition_place: String,
    folio: String,
    cfdi_type: String,
    payment_form: String,
    payment_method: String,
    logo_url: String,
    date: String,
    issuer: {
      FiscalRegime: String,
      Rfc: String,
      TaxName: String,
    },
    receiver: {
      Rfc: String,
      Name: String,
      CfdiUse: String,
    },
    items: [
      {
        ProductCode: String,
        IdentificationNumber: String,
        Description: String,
        Unit: String,
        UnitValue: Float,
        UnitCode: String,
        UnitPrice: Float,
        Quantity: Float,
        Subtotal: Float,
        Discount: Float,
        Total: Float,
      },
    ],
    taxes: [
      {
        Total: Float,
        Name: String,
        Rate: Float,
        Type: String,
      },
    ],
    complement: {
      TaxStamp: {
        Uuid: String,
        Date: String,
        CdfiSign: String,
        SatCertNumber: String,
        SatSign: String,
        RfcProvCertif: String,
      },
      Payments:[
        {
          RelatedDocuments: [{
            Uuid: String,
            Folio: String,
            Currency: String,
            PaymentMethod: String,
            PartialityNumber: Float,
            PreviousBalanceAmount: Float,
            AmountPaid: Float,
            ImpSaldoInsoluto: Float
          }],
          Date: String,
          PaymentForm: String,
          Currency: String,
          Amount: Float,
          ExpectedPaid: Float
        }
      ]
    },
    type: String,
    tipo: String,
    original_string: String,
    currency: String,
    sub_total: Float,
    total: Float,
    discount: Float,
    year_registro: String,
    numero_semana_year: String,
    numero_mes_year: String,
    fecha_registro: String,
    id_venta: String,
    id_nota: String,
    folio_venta: String,
    cert_number: String,
    empresa: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "Empresa",
      trim: true,
    },
    sucursal: {
      type: Schema.Types.ObjectId,
      ref: "Sucursal",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Factura", FacturaSchema);
