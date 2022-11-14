import styles from '../styles/Home.module.css'
import { ListViewAddress } from '../constants/ListViewAddress';
import { Endpoints } from '../constants/Endpoints';
import { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import Layout from '../components/Layout'
import { TronWebConnector } from '../tronApi/TronWebConnector';
import { ContractInteract } from '../tronApi/ContractInteract';
import NewDirectABI from '../contractABI/DirectDebit.json'
import NewDirectBytecodeABI from '../contractABI/DirectDebitBytecode.json'
import type { FormEvent } from 'react'

const defaultFormData = {
  payLater: "true",
  numberVendors: 5,
};

const defaultFormDataUI = {
  tagName: ""
};

const { trigger, sign, broadcast, send, call, view, deploy, sendTrx, sendToken } = ContractInteract;

// It should allow to do:
// 1. deploy a new contract and added to the list (maybe check first  it is not there and give it a tag) deploy new contract add to list then disable button
// 2. Add new budget -- deposit
// 3. Add new vendor (added to list vendors and give it a tag) -- addVendor
// 4. Remove vendor -- removeVendor

export default function NewDirectDebit() {
  const [defaultAccount, setDefaultAccount] = useState('');
  const [defaultAccountBalance, setDefaultAccountBalance] = useState('--');
  const [accountsChangedMsg, setAccountsChangedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [formDataAddDebit, setFormDataAddDebit] = useState(defaultFormData);
  const [formDataAddDebitUI, setFormDataAddDebitUI] = useState(defaultFormDataUI);
  const [contractAddressDirectDebit, setContractAddressDirectDebit] = useState('');
  const { payLater, numberVendors } = formDataAddDebit;
  const { tagName } = formDataAddDebitUI;

  const trxPrecision = 1e6;

  const initUserInfo = async (userAddress : any) => {
    setDefaultAccount(userAddress);
    updateAccountBalance(userAddress);
  };

  const checkLoginStatus = async () => {
    const tronwebRes = await TronWebConnector.activate(false); // init tronweb without login
    tronwebRes.setFullNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronwebRes.setSolidityNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronwebRes.setEventServer(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    if (tronwebRes?.defaultAddress?.base58) {
      initUserInfo(tronwebRes.defaultAddress.base58);
    } else {
      resetDefaultAccount();
    }
  }

  useEffect(() => {
    if ((window as any).tronWeb?.defaultAddress) {
      initUserInfo((window as any).tronWeb.defaultAddress.base58);
      setInterval(() => {
        updateAccountBalance((window as any).tronWeb.defaultAddress.base58);
      }, 60000);
    }
    setAccountsChangedMsg('');
    setLoading(false);
    checkLoginStatus();
    addListener();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetDefaultAccount = () => {
    setDefaultAccount('');
    setDefaultAccountBalance('--');
  };

  const updateAccountBalance = async (userAddress : any) => {
    const accountInfo = await (window as any).tronWeb.trx.getAccount(userAddress? userAddress: defaultAccount);
    if (accountInfo?.balance) {
      const accountBalance = new BigNumber(accountInfo.balance).div(trxPrecision).toString();
      setDefaultAccountBalance(accountBalance);
    } else {
      setDefaultAccountBalance('--');
    }
  };

  const activate = async () => {
    setAccountsChangedMsg('');
    setLoading(true);
    const res = await TronWebConnector.activate();
    setLoading(false);
    if (res?.defaultAddress?.base58) {
      initUserInfo(res.defaultAddress.base58);
    } else if (!res?.success && res?.errorCode && res?.msg) {
      setAccountsChangedMsg(`${res.msg}(${res.errorCode})`);
    } else {
      setAccountsChangedMsg(`Please log in to TronLink first`);
    }
  };

  const addListener = () => {
    TronWebConnector.on('accountsChanged', async (res :any) => {
      console.log(res);
      checkLoginStatus();
    })

    TronWebConnector.on('chainChanged', async (res :any) => {
      console.log(res);
      setAccountsChangedMsg(`Current account fullNode is: ${res.data.node.fullNode}`);
      checkLoginStatus();
    })

    TronWebConnector.on('disconnectWeb', async (res :any) => {
      console.log(res);
      setAccountsChangedMsg(`disconnect website name: ${res.data.websiteName}`);
      resetDefaultAccount();
    })

    TronWebConnector.on('connectWeb', async (res :any) => {
      console.log(res);
      setAccountsChangedMsg(`connect website name: ${res.data.websiteName}`);
      checkLoginStatus();
    })
  };

  // const deployOptions = {
  //   abi: NewDirectABI,
  //   bytecode: NewDirectBytecodeABI.object,
  //   funcABIV2: NewDirectABI[0],
  //   parametersV2: [1]
  // }

  // const deployContract = async () => {
  //   const res = await deploy(deployOptions, defaultAccount);
  //   if (res.result) {
  //     setAccountsChangedMsg(`Deploy success, the transaction ID is ${res.txid}`);
  //   } else {
  //     setAccountsChangedMsg(res.msg);
  //   }
  // }

  async function deployContract(payLaterIn: string, numberVendorsIn : number){

    const tronWeb = await TronWebConnector.activate(false); // init tronweb without login
    tronWeb.setFullNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setSolidityNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setEventServer(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    if (tronWeb?.defaultAddress?.base58) 
    {
      initUserInfo(tronWeb.defaultAddress.base58);
      const defaultAddressHex : String = new String(tronWeb.defaultAddress.hex)
        const paylaterBoolTEST = payLaterIn === 'true' ? true:false;
        const vendorNumbersTEST = numberVendorsIn

        console.log(paylaterBoolTEST);
        console.log(vendorNumbersTEST);

        const bigNumber = new BigNumber(vendorNumbersTEST)
        console.log(bigNumber);
      
        let transaction = await tronWeb.transactionBuilder.createSmartContract({
          abi:NewDirectABI,
          bytecode:NewDirectBytecodeABI.object,
          feeLimit:1000000000,
          callValue:0,
          userFeePercentage:1,
          originEnergyLimit:10000000,
          parameters:[vendorNumbersTEST, paylaterBoolTEST]
        }, tronWeb.defaultAddress.hex);
        
        const signedTransaction = await tronWeb.trx.sign(transaction);
        const contract_instance = await tronWeb.trx.sendRawTransaction(signedTransaction); 
        console.log(contract_instance);
        const contractAddressReceived = contract_instance.__payload__.contract_address
        console.log(contractAddressReceived);
        setContractAddressDirectDebit(contractAddressReceived)
    } else {
      resetDefaultAccount();
    }
    return 
  }

  
  async function addToContractUI(tagName : string){

    const tronWeb = await TronWebConnector.activate(false); // init tronweb without login
    tronWeb.setFullNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setSolidityNode(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    tronWeb.setEventServer(Endpoints.TESTNET_SHASTA_API_ENDPOINT)
    if (tronWeb?.defaultAddress?.base58) 
    {
      initUserInfo(tronWeb.defaultAddress.base58);
      const defaultAddressHex : String = new String(tronWeb.defaultAddress.hex)

      console.log(contractAddressDirectDebit);

      //Get contract
      const contractListDebit = await tronWeb.contract().at(ListViewAddress.TESTNET_SHASTA_LIST_DEBITS);
      console.log(contractListDebit);

      //add a new contract to my
      const allTags = await contractListDebit.setSmartContractDebitor(contractAddressDirectDebit, tagName).send();
      console.log(allTags);

      setContractAddressDirectDebit('')
      
    } else {
      resetDefaultAccount();
    }
    return 
  }

  
  const onChangeAddDebit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataAddDebit((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onChangeAddDebitUI = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataAddDebitUI((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };


  const onSubmitAddDebit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formDataAddDebit);
    console.log(payLater);
    console.log(numberVendors);

    setFormDataAddDebit(defaultFormData);
  
  const contract_instance_address =  deployContract(payLater, numberVendors);
    
  };



  const onSubmitAddDebitUI = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    console.log(formDataAddDebitUI);
    setFormDataAddDebitUI(formDataAddDebitUI);

    console.log(contractAddressDirectDebit);
    console.log(tagName);


    const deployUI =  addToContractUI(tagName);
    
  };


  return (
    <div className={ styles.newDebitTab }>
      {/* Form for add new Contract */}
      <div className={ styles.newDebitTab }>
        <form
          onSubmit={onSubmitAddDebit}
        >
          <div>
            <label>
              Maximum Number of Vendors:
              <input type="number" id="numberVendors"  onChange={onChangeAddDebit}  />
            </label>
          </div>
          <div>
            <label>
              Pay Now:
              <ul>
                <li>
                  <input type="radio" id="payLater" name='payLaterName' value="false" onChange={onChangeAddDebit}  />
                  <label> Pay Right Away </label>
                </li>
                
                <li>
                  <input type="radio" id="payLater" name='payLaterName' value="true"  onChange={onChangeAddDebit} />
                  <label> Pay Manually</label>
                </li>

              </ul>
            </label>
          </div>
          <div>
            <input className={styles.buttonNewDirectDebit} type="submit" value="Deploy Contract"/>
          </div>
        </ form>
      </ div>
      {/* Form for add Contract to UI Just a button */}
      {contractAddressDirectDebit?
        <div className={ styles.addToUIDirectDebit }>
          <form
            onSubmit={onSubmitAddDebitUI}
          >
            <div>
              <label>
                Tag this contract for UI:
                <input type="string" id="tagName"  onChange={onChangeAddDebitUI}  />
              </label>
              Address of contract: { contractAddressDirectDebit }
            </div>
            
            <div>
              <input className={styles.buttonNewDirectDebitUI} type="submit" value="Add DirectDebit to UI"/>
            </div>
          </ form>
        </ div>
        :
        <></>
      }
    </div>
  )
}
