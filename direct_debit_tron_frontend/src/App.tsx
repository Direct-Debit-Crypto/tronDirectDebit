import styles from './styles/Home.module.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Layout from './components/Layout'
import Main from './components/Main'

export default function App() {
  return (
    <div>
      <Layout>
        <Main />
      </Layout>
    </div>
  )
}
