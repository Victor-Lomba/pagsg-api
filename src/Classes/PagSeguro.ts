import axios from "axios";
import { CreditCard } from "./creditCard";
import { Pix } from "./Pix";
import {XMLParser, XMLBuilder} from "fast-xml-parser";

type PagSeguroObject = {
  appId: string;
  appKey: string;
  email: string;
  token: string;
}

export class PagSeguro {
    static singleton: PagSeguro;
    config: PagSeguroObject;
    parser = new XMLParser();
    builder = new XMLBuilder({arrayNodeName: "authorizationRequest"});
  
    /**
   *  Creates a Payment Object 
   *
   * @param config - Configuration Object `PagSeguroObject`  
   */
    constructor(config: PagSeguroObject) {
        this.config = config;
        PagSeguro.singleton = this;
    }

    /**
   * returns a Session Id
   * 
   * @returns`
   * <session> 
   *  <id>{SESSIONID}</id> 
   * </session>`
   */
    public async createSession(){
        const url = `https://ws.pagseguro.uol.com.br/v2/sessions?email=${this.config.email}&token=${this.config.token}`;
        const response = await axios.post(url);
        return response.data.split("id>")[1].split("<")[0];
    }

    public async getInstallments(amount: string, sessionId: string, creditCardBrand: string, MaxInstallmentsNoInterest: string){
        const url = `https://pagseguro.uol.com.br/checkout/v2/installments.json?amount=${amount}&sessionId=${sessionId}&creditCardBrand=${creditCardBrand}&maxInstallmentNoInterest=${MaxInstallmentsNoInterest}`;
        const response = await axios.get(url);
        return response.data;
    }

    public async requestAuthorization(reference: string,redirectURL: string,notificationURL: string, codes: string[]){
        const body = this.builder.build({
            authorizationRequest:{
                reference,
                permissions: {
                    code: codes
                },
                redirectURL,
                notificationURL
            }
        });
        const url = `https://ws.pagseguro.uol.com.br/v2/authorizations/request?appId=${this.config.appId}&appKey=${this.config.appKey}`;
        const response = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/xml;",
                "Connection": "keep-alive",
                "keep-alive": "timeout=5, max=100"
            }
        });
        return this.parser.parse(response.data);
    }

    public async getPaymentMethods(session: string, amount: string){
        const url = `https://ws.pagseguro.uol.com.br/v2/payment-methods?sessionId=${session}&amount=${amount}`;
        const response = await axios.get(url);
        return this.parser.parse(response.data);
    }

    public async createCreditCardToken(
        sessionId: string, 
        amount: string, 
        cardNumber: string, 
        cardBrand: string, 
        cardCvv: string, 
        cardExpirationMonth: string, 
        cardExpirationYear: string)
    {
        const urlencoded = new URLSearchParams();
        urlencoded.append("sessionId", sessionId);
        urlencoded.append("amount", amount);
        urlencoded.append("cardNumber", cardNumber);
        urlencoded.append("cardBrand", cardBrand);
        urlencoded.append("cardCvv", cardCvv);
        urlencoded.append("cardExpirationMonth", cardExpirationMonth);
        urlencoded.append("cardExpirationYear", cardExpirationYear);
        const response = await axios.post(`https://df.uol.com.br/v2/cards?email=${this.config.email}&token=${this.config.token}`, urlencoded,{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            
        });

        return response.data;
    }

    public async verifyNotification(code: string){
        const url = `https://ws.pagseguro.uol.com.br/v2/authorizations/notifications/${code}?email=${this.config.email}&token=${this.config.token}`;
        const response = await axios.get(url);
        return this.parser.parse(response.data);
    }


    CreditCard = CreditCard;
    Pix = Pix;
}