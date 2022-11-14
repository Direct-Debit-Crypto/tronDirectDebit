import styles from '../styles/Home.module.css'
import { ListViewAddress } from '../constants/ListViewAddress';
import { useState } from 'react';
import Layout from '../components/Layout'
import NewDirectABI from '../contractABI/DirectDebit.json'
import NewDirectBytecodeABI from '../contractABI/DirectDebitBytecode.json'
import { TronWebConnector } from '../tronApi/TronWebConnector';
import { ContractInteract } from '../tronApi/ContractInteract';
import { Endpoints } from '../constants/Endpoints';

const { trigger, sign, broadcast, send, call, view, deploy, sendTrx, sendToken } = ContractInteract;

// It should allow to do:
// 1. add a new invoice by a vendor for a directDebitContract 
//                 --- get a list from whitelistedvendors get an element and for that address call setInvoice

const defaultFormData = {
  directDebitAddress: "",
  invoiceAmount: 0
};


export default function NewInvoice() {

  //this is in TRX format
  const [formDataAddDebit, setFormDataAddDebit] = useState(defaultFormData);
  const { directDebitAddress, invoiceAmount } = formDataAddDebit;


  const trxPrecision = 1e6;
  
  async function generateNewInvoice(directDebitContract : any,amount : number){

    const tronWeb = await TronWebConnector.activate(false); // init tronweb without login
    tronWeb.setFullNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setSolidityNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setEventServer(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    if (tronWeb?.defaultAddress?.base58) 
    {
      const defaultAddressHex : String = new String(tronWeb.defaultAddress.hex)
      const my_address = tronWeb.defaultAddress.base58

      console.log(directDebitContract);
      console.log(amount);

      //Get contract
      const contractDirectDebit = await tronWeb.contract().at(directDebitContract);
      console.log(contractDirectDebit);

      //add a new contract to my
      const allTags = await contractDirectDebit.setInvoice(amount*trxPrecision).send();
      console.log(allTags);
      
    } else {
    }
    return 
  }


  const onChangeNewInvoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataAddDebit((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };


  const onSubmitNewInvoice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const deployUI =  generateNewInvoice(directDebitAddress, invoiceAmount);
    
  };


  return (
      <div className={styles.newInvoiceForm}>
        <form
          onSubmit={onSubmitNewInvoice}>
          <div>
            <label>
              Address of Direct Debit Contract:
              <input type="string" id="directDebitAddress"  onChange={onChangeNewInvoice}  />
              Amount:
              <input type="string" id="invoiceAmount"  onChange={onChangeNewInvoice}  />
            </label>
          </div>
          <div>
            <input className={styles.buttonNewDirectDebit} type="submit" value="Generate New Invoice"/>
          </div>
        </ form>
      </ div>
  )
}
