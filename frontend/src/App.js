import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.min.css';
import DoneToken from './contracts/DoneToken.json';
import StableCoin from './contracts/StableCoin.json';
import Admin from './admin';  // Import Admin component
import Client from './client';  // Import Client component

function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // Request access to user's Ethereum account
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (err) {
        setError('Unable to connect to MetaMask or an error occurred.');
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Router>
      <div className="container mt-5">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h1>Ứng Dụng Huy Động Vốn</h1>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="spinner-border" role="status"><span className="sr-only">Đang tải...</span></div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : account ? (
              <Routes>
                <Route path="/admin" element={<Admin account={account} />} />
                <Route path="/client" element={<Client account={account} />} />
                <Route path="/" element={<Client account={account} />} /> {/* Default route */}
              </Routes>
            ) : (
              <div className="alert alert-warning">Vui lòng kết nối ví Ethereum.</div>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
