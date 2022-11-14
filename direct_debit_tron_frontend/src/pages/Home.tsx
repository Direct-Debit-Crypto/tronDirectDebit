import styles from '../styles/Home.module.css'
import Layout from '../components/Layout'

export default function Home() {


  return (
    <div>
      <main className={styles.main}>
        <h3>Tron Direct Debit</h3>
        <p>Thing of a better way to make payment. There are some interesting tech that already exist as design(meaning Direct Debit Payment) and build on top of that concept but adapted to the blockchain tech.</p>
        <b>What it's does?</b>

        <p>A trust enviroment in a trustless world.</p>
        <p>The main goal is to pay the people that offered you some services in an automatic way.</p>
        <p>For that a provider/direct debit account is created and is top up with a certain amount(This would be in CeFi a client with a bank account).</p>
        <p>Now we have a global budget.</p>
        <p>The next step is to set some vendors/suppliers/members of DAO in a whitelist(This would be the old supplier ex: electricity company, phone company, etc).</p>
        <p>Now every vendor can emit an "invoice" which would be paid automatic.</p>
        <p>It relies heavily on trust. As magnifican as is a trustless way of payments it's important to remember that we are humans and we rely on trust.</p>

      </main>
    </div>
  )
}
