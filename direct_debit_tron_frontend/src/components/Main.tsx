import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Connect from '../pages/Connect';
import NewDirectDebit from '../pages/NewDirectDebit';
import ListDebit from '../pages/ListDebit';
import WhitelistedVendors from '../pages/WhitelistedVendors';
import NewInvoice from '../pages/NewInvoice';

const Main = () => {
return (         
    <Routes>
    <Route path='/' element={<Home/>} />
    <Route path='/new-direct-debit' element={<NewDirectDebit/>} />
    <Route path='/list-debits' element={<ListDebit/>} />
    <Route path='/whitelisted-vendors' element={<WhitelistedVendors/>} />
    <Route path='/new-invoice' element={<NewInvoice/>} />
  </Routes>
);
}
export default Main;