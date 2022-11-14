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

  const trxPrecision = 1e6;

  const initUserInfo = async (userAddress : any) => {
    setDefaultAccount(userAddress);
    updateAccountBalance(userAddress);
  };

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

  const deployOptions = {
    abi: NewDirectABI,
    bytecode: NewDirectBytecodeABI.object,
    funcABIV2: NewDirectABI[0],
    parametersV2: [1]
  }

  const deployContract = async () => {
    const res = await deploy(deployOptions, defaultAccount);
    if (res.result) {
      setAccountsChangedMsg(`Deploy success, the transaction ID is ${res.txid}`);
    } else {
      setAccountsChangedMsg(res.msg);
    }
  }


  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          NewDirectDebit
        </h1>
      </main>
    </div>
  )
}
