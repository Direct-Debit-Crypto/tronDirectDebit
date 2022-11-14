import React, { useState, useEffect } from 'react';
import { Endpoints }  from '../constants/Endpoints';
import BigNumber from 'bignumber.js';
import { TronWebConnector } from '../tronApi/TronWebConnector';
import Loader from '../components/Loader';
import styles from '../styles/Home.module.css'
import Button from 'react-bootstrap/Button';

function WalletState() {
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

  return (
    <div className={ styles.walletState }>
      <section className="content">
        {defaultAccount ?
          <div className='items'>
            <div className='item' ><Button className={ styles.buttonsecond } onClick={() => setDefaultAccount('')} > Disconnect </Button></div>
          </div>
          :
          <div className='items'>
            <div className='item' ><Button className={ styles.button } onClick={() => activate()} > Connect </Button></div>
          </div>
        }
           {/* <Loader stroke="red" /> */}
      </section>
    </div>
  );
}

export default WalletState;
