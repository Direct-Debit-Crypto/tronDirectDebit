import styles from '../styles/Home.module.css'
import { ListViewAddress } from '../constants/ListViewAddress';
import { useState } from 'react';
import Layout from '../components/Layout'
import { TronWebConnector } from '../tronApi/TronWebConnector';
import { ContractInteract } from '../tronApi/ContractInteract';
import BigNumber from 'bignumber.js';
const { trigger, sign, broadcast, send, call, view, deploy, sendTrx, sendToken } = ContractInteract;

// When you add a new vendor at a contract DirectDebit also send the setSmartContractVendor
// so that for that specific Direct Debit contract that I am vendor for is addedin my list 


//Each element of the ListDebits so each Debit should contain:  ONLY VIEWS
// 1. address and tag of the direct debit contracts ---  getAllSmartContractProvicer(this.address) & getAllTagsForAddress
// 2. Budget of each debit contracts --- each address from 1list interogate for getBudget
// 3. Amount Consummed  of each debit contracts --- getVendorAmountUsed
// 4. 


export default function WhitelistedVendors() {

  const [accountsChangedMsg, setAccountsChangedMsg] = useState('');

  const viewContract = async () => {
    const res = await view(
      ListViewAddress.TESTNET_SHASTA_LIST_VENDORS,
      "totalSupply()",
      []
    );

    if (res.length) {
      let totalSupply = new BigNumber(res[0].slice(0, 64), 16).div(1e18);
      setAccountsChangedMsg(`View success, BTT(TRC20) totalSupply is: ${totalSupply.toString()}`);
    } else {
      setAccountsChangedMsg('View failed');
    }
  }

  return (
    <div>
      <main className={styles.main}>
        <h1 className={styles.title}>
          WhitelistedVendors
        </h1>
      </main>
    </div>
  )
}
