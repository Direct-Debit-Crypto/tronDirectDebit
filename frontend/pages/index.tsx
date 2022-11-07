import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {


  return (
    <div className={styles.container}>
      <Head>
        <title>Direct Debit Tron Network</title>
        <meta name="description" content="Direct Debit Tron Network App Solution" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to DIRECT DEBIT TRON NETWORK SOLUTION!
        </h1>
      </main>

      
      <Footer />
    </div>
  )
}
