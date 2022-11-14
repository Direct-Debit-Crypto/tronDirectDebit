import styles from '../styles/Home.module.css'
import { BallTriangle } from 'react-loader-spinner'
import { Button } from 'react-bootstrap';

import { ListViewAddress } from '../constants/ListViewAddress';
import { Endpoints } from '../constants/Endpoints';


import React, { useState, useEffect } from 'react';

import Layout from '../components/Layout'

import { TronWebConnector } from '../tronApi/TronWebConnector';


import BigNumber from 'bignumber.js';

import { ContractInteract } from '../tronApi/ContractInteract';
import ListDebitorsABI from '../contractABI/ListDebitors.json'


import * as ethers from 'ethers';

const { trigger, sign, broadcast, send, call, view, deploy, sendTrx, sendToken } = ContractInteract;

// For Example:
// const addressInHexFormat = '414450cf8c8b6a8229b7f628e36b3a658e84441b6f';
// const addressInBase58 = tronWeb.address.fromHex(addressInHexFormat);
// > addressInBase58 = 'TGCRkw1Vq759FBCrwxkZGgqZbRX1WkBHSu'
// const addressInHex = tronWeb.address.toHex(addressInBase58);
// > addressInHex = '414450cf8c8b6a8229b7f628e36b3a658e84441b6f'



// When you deploy a smart contract of type Direct Debit also add it to 
// Provider list so you can acces it from frontend

//Each element of the ListDebits so each Debit should contain: ONLY VIEWS
// 1. address and tag (Master) contract addreses ---- getAllSmartContractProvicer(this.address) & getAllTagsForAddress
// 2. Budget ---- each address from 1list interogate for getBudget
// 3. Amount Consummed ---- getVendorAmountUsed
// 4. List of vendors(Optional) ---- list of tags getAllVendors
// 5. 

export default function ListDebit() {
  const [defaultAccount, setDefaultAccount] = useState('');
  const [defaultAccountBalance, setDefaultAccountBalance] = useState('--');
  const [accountsChangedMsg, setAccountsChangedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [queryTronCompleted, setQueryTronCompleted] = useState(false);
  const [myDirectDebitAddress, setMyDirectDebitAddress] = useState<Array<String>>();
  const [myDirectDebitTag, setMyDirectDebitTag] = useState<Array<String>>();
  const [myDirectDebitAddressBudget, setMyDirectDebitAddressBudget] = useState<Array<Number>>();
  const [myDirectDebitAddressSpent, setMyDirectDebitAddressSpent] = useState<Array<Number>>();

  const trxPrecision = 1e6;


  const initUserInfo = async (userAddress : any) => {
    setDefaultAccount(userAddress);
    updateAccountBalance(userAddress);
  };

  
  const AbiCoder = ethers.utils.AbiCoder;
  const ADDRESS_PREFIX_REGEX = /^(41)/;
  const ADDRESS_PREFIX = "41";


  async function decodeParams(types : any, output : any, ignoreMethodHash : any) {

    if (!output || typeof output === 'boolean') {
        ignoreMethodHash = output;
        output = types;
    }

    if (ignoreMethodHash && output.replace(/^0x/, '').length % 64 === 8)
        output = '0x' + output.replace(/^0x/, '').substring(8);

    const abiCoder = new AbiCoder();

    if (output.replace(/^0x/, '').length % 64)
        throw new Error('The encoded string is not valid. Its length must be a multiple of 64.');
      // return abiCoder.decode(types, output);
    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
        if (types[index] == 'address')
            arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
        obj.push(arg);
        return obj;
    }, []);
  }

  const checkLoginStatus = async () => {
    const tronwebRes = await TronWebConnector.activate(false); // init tronweb without login
    tronwebRes.setFullNode(Endpoints.TESTNET_NILE_API_ENDPOINT)
    tronwebRes.setSolidityNode(Endpoints.TESTNET_NILE_API_ENDPOINT)
    tronwebRes.setEventServer(Endpoints.TESTNET_NILE_API_ENDPOINT)
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
    const res = await TronWebConnector.activate();
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


  const DirectDebitArrayTag : String[]  = [];
  const DirectDebitArrayAddress : String[]  = [];
  const DirectDebitArrayAddressBudget : Number[]  = [];
  const DirectDebitArrayAddressConsumedBudget : Number[]  = [];

  const payInvoices = async (address : any) => {
    setAccountsChangedMsg('');
    setLoading(true);
    const tronWEB = await TronWebConnector.activate();
    if (tronWEB?.defaultAddress?.base58) {
      initUserInfo(tronWEB.defaultAddress.base58);
      console.log(tronWEB.defaultAddress)
      console.log(tronWEB.defaultAddress.base58)
      console.log(tronWEB.defaultAddress.hex)
    
      console.log(address);
      const contractDirectDebit = await tronWEB.contract().at(address);
      console.log(contractDirectDebit);

      
      //Get tags
      const allTags = await contractDirectDebit.payAllVendors().send();
      console.log(allTags);

    }
  }

  const getContractData = async () => {
    setAccountsChangedMsg('');
    setLoading(true);
    const tronWEB = await TronWebConnector.activate();
    if (tronWEB?.defaultAddress?.base58) {
      initUserInfo(tronWEB.defaultAddress.base58);
      console.log(tronWEB.defaultAddress)
      console.log(tronWEB.defaultAddress.base58)
      console.log(tronWEB.defaultAddress.hex)

      //Get contract
      const contractListDebit = await tronWEB.contract().at(ListViewAddress.TESTNET_SHASTA_LIST_DEBITS);
      console.log(contractListDebit);

      const listLenght = await contractListDebit.smartContractDebitorArrayIndex;
      console.log(listLenght);

      //Get tags
      const allTags = await contractListDebit.getAllTagsForAddress(defaultAccount).call();
      console.log(allTags);
      
      //Save Array
      for(let i=0;i<allTags.length;i++)
      {
        console.log(allTags[i])
        if(allTags[i] == "")
        {
          break;
        }

        DirectDebitArrayTag.push(allTags[i])
        console.log(DirectDebitArrayTag)

        //Get the index DirectDebit contract
        const addressContract =  await contractListDebit.getMySmartContractProvicer(i).call();
        console.log(addressContract)

        //Convert to Base 58
        const addressContractBase58 = await tronWEB.address.fromHex(addressContract);
        DirectDebitArrayAddress.push(addressContractBase58)
        console.log(DirectDebitArrayAddress)
        
        const contractDirectDebit = await tronWEB.contract().at(addressContractBase58);
        const addressContractBudget =  (await contractDirectDebit.getBudget().call()).toNumber();
        const addressContractSpend =  (await contractDirectDebit.getVendorAmountUsed().call()).toNumber();
        
        console.log(addressContractBudget)
        console.log(addressContractSpend)
        DirectDebitArrayAddressBudget.push(addressContractBudget)
        DirectDebitArrayAddressConsumedBudget.push(addressContractSpend)

      }
      setMyDirectDebitTag(DirectDebitArrayTag);
      setMyDirectDebitAddress(DirectDebitArrayAddress);
      setMyDirectDebitAddressBudget(DirectDebitArrayAddressBudget);
      setMyDirectDebitAddressSpent(DirectDebitArrayAddressConsumedBudget);
      
      setLoading(false);
      setQueryTronCompleted(true);
    } else if (!tronWEB?.success && tronWEB?.errorCode && tronWEB?.msg) {
      setAccountsChangedMsg(`${tronWEB.msg}(${tronWEB.errorCode})`);
    } else {
      setAccountsChangedMsg(`Please log in to TronLink first`);
    }
  }


  return (
    <div>
        
        <h1 className={styles.title}></h1>
        
        <Button className={styles.allDirectDebit} onClick={() => getContractData()} > Get All Direct Debits</Button>
          
        {queryTronCompleted==false ?
          <div>       
            {loading==true ?
              <BallTriangle
              height={100}
              width={100}
              radius={5}
              color="#4fa94d"
              ariaLabel="ball-triangle-loading"
              visible={true}
              />
              :
              <div>--- Press button to start</div>
            }
          </div> 
          : 
          <div className={styles.allDirectDebit}>
              {myDirectDebitTag ? 
                myDirectDebitTag.map( (e, index) =>
                  <div className={styles.elementDirectDebit}>
                      <div className={styles.elementDirectDebitIndex}>
                          Index:{index}
                      </div>
                      <div className={styles.elementDirectDebitTag}>
                        Tag: { e }
                      </div>
                      <div className={styles.elementDirectDebitAddress}>
                        Address: {myDirectDebitAddress ? myDirectDebitAddress[index] : '' }
                      </div>
                      {/* <div className={styles.elementDirectDebitAddressBudget}>
                        Budget: {myDirectDebitAddressBudget ?  myDirectDebitAddressBudget[index] : '' }
                      </div>
                      <div className={styles.elementDirectDebitAddressSpend}>
                        Spent: {myDirectDebitAddressSpent ?   myDirectDebitAddressSpent[index] : '' }
                      </div> */}
                      <Button  className={styles.buttonElementDirectDebit}  onClick={() => payInvoices(myDirectDebitAddress![index])}  > Pay All Invoices</Button>
                  </div>
                  )
                :
                <div>Contract has no Direct Debit</div>
              }
          </div>
        }
    </div>
  )
}
