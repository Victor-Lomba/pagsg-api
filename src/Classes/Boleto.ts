import axios from "axios";
import {XMLBuilder} from "fast-xml-parser";
import {PagSeguro} from "./PagSeguro";

type BoletoObject = {
  mode: string;
  method: string;
  sender: {
    name: string;
    email: string;
    phone: {
      areaCode: string;
      number: string;
    };
    documents: {
      document: {
        type: string;
        value: string;
      }
    };
  },
  currency: string;
  notificationURL: string;
  items: [
      {item: {
        id: string;
        description: string;
        quantity: string;
        amount: string;
      },
    },
  ]
  extraAmount: string;
  reference: string;
  shipping: {
    addressRequired: boolean;
    address?: {
      street: string;
      number: string;
      complement: string;
      district: string;
      postalCode: string;
      city: string;
      state: string;
      country: string;
    }
    Type?: number;
    cost?: number;
  }
}


export class Boleto{
    config: BoletoObject;
    builder = new XMLBuilder({arrayNodeName: "payment"});

    constructor(config: BoletoObject){
        this.config = config;
    }
    
    public async submit(){
        const body = this.builder.build({payment: this.config});
        const url = `https://ws.sandbox.pagseguro.uol.com.br/v2/transactions?email=${PagSeguro.singleton.config.email}&token=${PagSeguro.singleton.config.token}`;
        const response = await axios.post(
            url, 
            body,
            {
                headers: {
                    "Content-Type": "application/xml;",
                }
            }
        );
        return response.data;
    }
}