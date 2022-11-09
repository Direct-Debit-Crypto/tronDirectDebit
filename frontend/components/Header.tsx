import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import styles from '../styles/Home.module.css'
import WalletState from '../interactTronAPI/WalletState'
import Image from 'next/image'


const Header = () => {
  
    return (
      <Navbar className={styles.header}>
        
        {/* Brand logo */}
        <Navbar.Brand className={styles.headerLogo}>
          <Image src="/logo.svg"
            alt="Direct Debit Tron Logo"  
            width="300"
            height="100"/>
        </Navbar.Brand>

        {/* All Available links */}
        <Nav className={styles.allnav}>
          <Nav.Item>
            <Nav.Link href="/">Providers</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/">Vendors</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/">Add Provider</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/">Add Vendor</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Third element the Connect Button */}
        <WalletState />
      </Navbar>
    );
  };
  
  export default Header;
  