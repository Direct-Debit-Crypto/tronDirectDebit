import React from 'react';
import { Navbar as BsNavbar, NavItem, Nav } from 'react-bootstrap';
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import WalletState from '../interactTronAPI/WalletState'
import Image from 'next/image'


const Navbar = () => {
  
    return (
      <BsNavbar className={styles.container}>
        <div className={styles.container}>
          <Link
            className={styles.logo }
            href="/"
          >
            <Image src="/logo.svg" alt="Direct Debit Tron Logo" />
          </Link>
  
          <Nav className={styles.container}>
              <NavItem>
                  <WalletState />
              </NavItem>
          </Nav>
        </div>
      </BsNavbar>
    );
  };
  
  export default Navbar;
  