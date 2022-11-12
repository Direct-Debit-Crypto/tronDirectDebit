import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import styles from '../styles/Home.module.css'
import WalletState from '../interactTronAPI/WalletState'
import logo from '../styles/logo.png'


const Header = () => {
  
    return (
      <Navbar className={styles.header}>
        
        {/* Brand logo */}
        <Navbar.Brand className={styles.headerLogo}>
          <img src={logo} alt="Logo" width="300"/>
        </Navbar.Brand>

        {/* All Available links */}
        <Nav className={styles.allnav}>
          <Nav.Item>
            <Nav.Link href="/list-debits">List Debit</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/new-direct-debit">New Debit</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/whitelisted-vendors">My Payers</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="/new-invoice">New Invoice</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Third element the Connect Button */}
        <WalletState />
      </Navbar>
    );
  };
  
  export default Header;
  