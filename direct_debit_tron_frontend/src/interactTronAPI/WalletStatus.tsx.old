
import { TronWebConnector } from '../tronApi/TronWebConnector';
import { Endpoints }  from '../constants/Endpoints';
import BigNumber from 'bignumber.js';
import React, { useState, useEffect } from 'react';

'use strict';


const trxPrecision = 1e6;


export class StatusWallet {

    public connected: boolean = false;
    public loading: boolean = false;
    public userDefaultAddress: any;
    public accountBalance: String = '--';

    checkLoginStatus = async () => {
        const tronwebRes = await TronWebConnector.activate(false); // init tronweb without login
        tronwebRes.setFullNode(Endpoints.TESTNET_NILE_API_ENDPOINT)
        tronwebRes.setSolidityNode(Endpoints.TESTNET_NILE_API_ENDPOINT)
        tronwebRes.setEventServer(Endpoints.TESTNET_NILE_API_ENDPOINT)
        if (tronwebRes?.defaultAddress?.base58) {
            this.userDefaultAddress = tronwebRes.defaultAddress.base58;
        } else {
            this.connected = false;
        }
    };

    updateAccountBalance = async (userAddress : any) => {
        const accountInfo = await (window as any).tronWeb.trx.getAccount(userAddress? userAddress: this.userDefaultAddress);
        if (accountInfo?.balance) {
          const accountBalance = new BigNumber(accountInfo.balance).div(trxPrecision).toString();
          this.accountBalance = accountBalance;
        } else {
            this.accountBalance =  '--';
        }
    };

    const initUserInfo = async (userAddress : any) => {
      this.userDefaultAddress = (userAddress);
      this.updateAccountBalance(userAddress);
    };


    useEffect(
        () => {
            if ((window as any).tronWeb?.defaultAddress) {
            this.initUserInfo((window as any).tronWeb.defaultAddress.base58);
            setInterval(() => {
                this.updateAccountBalance((window as any).tronWeb.defaultAddress.base58);
            }, 60000);
            }
            setAccountsChangedMsg('');
            setLoading(false);
            checkLoginStatus();
            addListener();

            return;
        },
        []
    );

    
    const addListener = (this) => {
        TronWebConnector.on('accountsChanged', async (res :any) => {
        console.log(res);
        this.checkLoginStatus();
        })

        TronWebConnector.on('chainChanged', async (res :any) => {
        console.log(res);
        setAccountsChangedMsg(`Current account fullNode is: ${res.data.node.fullNode}`);
        this.checkLoginStatus();
        })

        TronWebConnector.on('disconnectWeb', async (res :any) => {
        console.log(res);
        setAccountsChangedMsg(`disconnect website name: ${res.data.websiteName}`);
        resetDefaultAccount();
        })

        TronWebConnector.on('connectWeb', async (res :any) => {
        console.log(res);
        setAccountsChangedMsg(`connect website name: ${res.data.websiteName}`);
        this.checkLoginStatus();
        })
    };

}

export const WalletStatus = new StatusWallet();