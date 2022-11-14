import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import styles from '../styles/Home.module.css'
import WalletConnect from '../interactTronAPI/WalletConnect';
import { setTimeout } from "timers/promises";


type GetJsxComponent = (num: JSX.Element) => Promise<JSX.Element>;


interface Props {
    children: JSX.Element
  }

const Layout = ({children} : Props) => (
    <div>
      <Header />
        <div className={styles.main}>
           <WalletConnect componentInput={children} />
        </div>
      <Footer />
    </div>
  );

export default Layout;
