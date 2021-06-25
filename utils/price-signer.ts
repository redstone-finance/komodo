import { toBuffer } from 'ethereumjs-util';
import { signTypedMessage, recoverTypedMessage, MsgParams } from "eth-sig-util";
import { ethers } from "ethers";


export type PriceDataType = {
    symbols: string[],
    values: number[],
    timestamp: number
}

export type SignedPriceDataType = {
  priceData: PriceDataType,
  signer: string,  
  signature: string  
}

const PriceData = [
    {name: 'symbols', type: 'bytes32[]'},
    {name: 'values', type: 'uint256[]'},
    {name: 'timestamp', type: 'uint256'}
];


const EIP712Domain = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'}
];

const serializeBN = (value:any) => value.toString();
const serializePriceValue = (value: any) => Math.round(value * (10 ** 8));

export class PriceSigner {
    private _domainData: object;

    constructor(version: string = "0.4", chainId: number = 1) {
        this._domainData =  {
            name: 'Redstone',
            version: version,
            chainId : chainId,
        };
    }

    private serializeToMessage(priceData: PriceDataType): object {
        return {
            symbols: priceData.symbols.map(ethers.utils.formatBytes32String),
            prices: priceData.prices.map(serializePriceValue),
            timestamp: priceData.timestamp
        }
    }

    signPriceData(priceData: PriceDataType, privateKey: string): SignedPriceDataType {
        const data: any = {
            types: {
                EIP712Domain,
                PriceData: PriceData,
            },
            domain: this._domainData,
            primaryType: 'PriceData',
            message: this.serializeToMessage(priceData),
        };
        
        console.log(data);

        return {
            priceData: priceData,
            signer: (new ethers.Wallet(privateKey)).address,
            signature: signTypedMessage(toBuffer(privateKey), {data}, 'V4')
        };
    }

    verifySignature(signedPriceData: SignedPriceDataType) {
        const data: any = {
            types: {
                EIP712Domain,
                PriceData: PriceData,
            },
            domain: this._domainData,
            primaryType: 'PriceData',
            message: this.serializeToMessage(signedPriceData.priceData),
        };

        const signer = recoverTypedMessage({data: data, sig: signedPriceData.signature});

        return signer.toUpperCase() === signedPriceData.signer.toUpperCase();
    }   
    
}


