import React, { useState, useEffect } from 'react';
import { Endpoints }  from '../constants/Endpoints';
import BigNumber from 'bignumber.js';
import { TronWebConnector } from '../tronApi/TronWebConnector';
import Loader from '../components/Loader';
import styles from '../styles/Home.module.css'
import Button from 'react-bootstrap/Button';
import { BallTriangle } from 'react-loader-spinner'


interface Props {
    componentInput: JSX.Element;
  }

const WalletConnect = ({componentInput} : Props) => {
  const [defaultAccount, setDefaultAccount] = useState('');
  const [defaultAccountBalance, setDefaultAccountBalance] = useState('--');
  const [accountsChangedMsg, setAccountsChangedMsg] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (defaultAccount != '')
  {
    return componentInput;
    return <BallTriangle
              height={100}
              width={100}
              radius={5}
              color="#4fa94d"
              ariaLabel="ball-triangle-loading"
              visible={true}
            />
  }
  else if (defaultAccount == '' && loading==true)
  {
    return <BallTriangle
              height={100}
              width={100}
              radius={5}
              color="#4fa94d"
              ariaLabel="ball-triangle-loading"
              visible={true}
            />
  }
  else
  {
    return (<div>You are not connected.</div>); 
  }
};

export default WalletConnect;