import {createStaticPix, PixObject, PixError} from "pix-utils";
import axios from "axios";

type PixObjectType = {
  txid: string;
  calendario: {
    expiracao: number;
  }
  devedor?:{
    nome?: string;
    cpf?: string;
    cnpj?: string;
  }
  valor:{
    original:number;
  }
  chave:string;
  solicitacaoPagador?: string;
  infoAdicionais?: [
    {
      nome: string;
      valor: string;
    }
  ];
}

export class Pix {
    config: PixObjectType;
    pix: PixObject | PixError | undefined;
    sandbox = false;
    url:string;

    constructor(config: PixObjectType & {sandbox?: boolean}) {
        this.config = config;
        this.sandbox = config.sandbox || false;
        this.url = this.sandbox ? "https://sandbox.api.pagseguro.com" : "https://api.pagseguro.com";
    }

    public async sendRequest(){
        const url = `${this.url}/instant-payments/cob/${this.config.txid}`;
        const response = await axios.put(url, {
            headers:{
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer 0515FEB36FFB447DAEA92808332A41BF",
            },
            data:{
                ...this.config
            }
        });
        return response.data;
    }

    public async createPix() {

        const pix = createStaticPix({
            txid: this.config.txid,
            merchantCity: "Nova Friburgo",
            merchantName: "WinConcursos",
            pixKey: this.config.chave,
            transactionAmount: this.config.valor.original,
        });

        this.pix = pix;
    }

    public async generatePixImage(){
        const pixImage = await (this.pix as PixObject).toImage();
        return pixImage;
    }


}