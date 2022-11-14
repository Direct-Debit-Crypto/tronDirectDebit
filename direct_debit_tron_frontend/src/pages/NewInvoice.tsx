import styles from '../styles/Home.module.css'
import { ListViewAddress } from '../constants/ListViewAddress';
import { useState } from 'react';
import Layout from '../components/Layout'
import NewDirectABI from '../contractABI/DirectDebit.json'
import NewDirectBytecodeABI from '../contractABI/DirectDebitBytecode.json'
import { TronWebConnector } from '../tronApi/TronWebConnector';
import { ContractInteract } from '../tronApi/ContractInteract';
const { trigger, sign, broadcast, send, call, view, deploy, sendTrx, sendToken } = ContractInteract;

// It should allow to do:
// 1. add a new invoice by a vendor for a directDebitContract 
//                 --- get a list from whitelistedvendors get an element and for that address call setInvoice


export default function NewInvoice() {

  //this is in TRX format
  const [DirectDebitContract, setDirectDebitContract] = useState(''); 

  const [accountsChangedMsg, setAccountsChangedMsg] = useState('');

  const sendContract = async () => {
    const res = await send(
        DirectDebitContract,
        "postMessage(string)"
    );

    if (res.result) {
      setAccountsChangedMsg(`Trigger success, the transaction ID is ${res?.transaction?.txID}`);
    } else {
      setAccountsChangedMsg(res.msg);
    }
  }


  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          NewInvoice
        </h1>
      </main>
    </div>
  )
}
