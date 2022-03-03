import axios from "axios";
import {XMLBuilder, XMLParser} from "fast-xml-parser";
import {PagSeguro} from "./PagSeguro";

type CreditCardObject = {
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
  creditCard?: {
    token: string;
    installment: {
      quantity: string;
      value: string;
    }
    holder: {
      name: string;
      documents: {
        document: {
          type: string;
          value: string;
        }
      };
      birthDate: string;
      phone: {
        areaCode: string;
        number: string;
      }
    }
    billingAddress?: {
      street: string;
      number: string;
      complement: string;
      district: string;
      postalCode: string;
      city: string;
      state: string;
      country: string;
    }
  },
  receivers?: [
    { 
      receiver: {
      publicKey: string,
        split: {
          amount: string;
        }
      }
    }
  ]
}


export class CreditCard{
    config: CreditCardObject;
    parser = new XMLParser();
    builder = new XMLBuilder({arrayNodeName: "payment"});

    constructor(config: CreditCardObject){
        this.config = config;
    }
    
    public addVendor(publicKey: string, amount: string){
        if(this.config.receivers){
            this.config.receivers?.push({
                receiver: {
                    publicKey: publicKey,
                    split: {
                        amount: amount
                    },
                } 
            });
        } else {
            this.config.receivers = [{
                receiver: {
                    publicKey: publicKey,
                    split: {
                        amount: amount
                    },
                }
            }];
        }
    }
    public async submit(){
        const body = this.builder.build({payment: this.config});
        const url = `https://ws.pagseguro.uol.com.br/transactions?appId=${PagSeguro.singleton.config.appId}&appKey=${PagSeguro.singleton.config.appKey}`;
        const response = await axios.post(
            url, 
            body,
            {
                headers: {
                    "Accept": "application/vnd.pagseguro.com.br.v3+xml;",
                    "Content-Type": "application/xml;",
                }
            }
        );
        return this.parser.parse(response.data);
    }
}