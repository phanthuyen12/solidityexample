import { useEffect, useState } from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.min.css';
import DoneToken from './contracts/DoneToken.json'; // ABI for DoneToken contract
import StableCoin from './contracts/StableCoin.json'; // ABI for StableCoin contract

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFundingActive, setIsFundingActive] = useState(true);
  const [goalReached, setGoalReached] = useState(false);
  const [totalFunds, setTotalFunds] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tokenPrice, setTokenPrice] = useState(null);
  const [donations, setDonations] = useState([]); 

  const contractAddress = '0xC8dF34b47A6C7fA528DAC82988173F4F9609D280';
  const usdsAddress = '0x5cD401Af7D10d9B09eD6281E83099D4fa708761C'; 


  useEffect(() => {
    async function load() {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const balanceWei = await web3.eth.getBalance(accounts[0]);
        console.log('gia tri accoutn'+account)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(balanceEth);

        const contract = new web3.eth.Contract(DoneToken.abi, contractAddress);
        console.log('hớp đồng'+contract)
        const usdsContract = new web3.eth.Contract(StableCoin.abi, usdsAddress);
        console.log('tổng kê gọi vốn'+usdsContract)

        const sumToken = await usdsContract.methods.balanceOf(accounts[0]).call();
        const sumTokenFormatted = web3.utils.fromWei(sumToken, 'ether');
        setTokenBalance(sumTokenFormatted);

        const fundingActive = await contract.methods.fundingActive().call();
        console.log('trạng thái khuyên góp'+fundingActive)

        const totalFunds = await contract.methods.totalStableCoins().call();
        console.log('tong acc oucnt'+totalFunds)

        // setGoalReached(totalFunds >= fundingGoal);
        setIsFundingActive(fundingActive);
        setTotalFunds(web3.utils.fromWei(totalFunds, 'ether'));

        const response = await fetch('http://localhost:3000/donations');
        const donationsData = await response.json();
        console.log(donationsData);
        setDonations(donationsData);
      } catch (err) {
        setError('Unable to connect to MetaMask or an error occurred.');
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleWithdrawFunds = async () => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(DoneToken.abi, contractAddress);
  
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
  

  
      // Gửi giao dịch
      const tx = await contract.methods.withdrawFunds().send({
        from: account,
        gas: 300000, 
      });
  
      alert('Funds withdrawn successfully!');
    } catch (err) {
      setError('Error occurred while withdrawing funds. Details: ' + err.message);
      console.error(err);
    }
  };
  

  const handleEndFunding = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }
  
      const web3 = new Web3(window.ethereum);
  
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0]; 
  
      if (!contractAddress) {
        alert('Contract address is not set!');
        return;
      }
  
      const contract = new web3.eth.Contract(DoneToken.abi, contractAddress);
  
      const tx = await contract.methods.endFunding().send({
        from: account,
        gas: 300000, //
      });
  
      alert('Funding campaign ended successfully!');
      setIsFundingActive(false); 
    } catch (err) {
      console.error(err);
      setError('Error occurred while ending the funding campaign. Details: ' + err.message);
    }
  };
  
  return (
    <div className="container mt-4">
      <div className="card-body">
        {loading && <div className="spinner-border" role="status"><span className="sr-only">Đang tải...</span></div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {account ? (
          <div>
            <h5>Tài khoản của bạn:</h5>
            <p>{account}</p>
            <h5>Số dư trong ví:</h5>
            <p>{balance} ETH</p>
            <h5>Số dư USDS trong ví:</h5>
            <p>{tokenBalance} USDS</p>
            <div className="mt-3">
              <h5>Thông tin về Quỹ</h5>
              <p>Trạng thái huy động: {isFundingActive ? 'Đang hoạt động' : 'Dừng lại'}</p>
              <p>Tổng số vốn đã huy động: {totalFunds} USDS</p>
              {goalReached && <p className="text-success">Mục tiêu huy động vốn đã đạt!</p>}
            </div>
            <div className="mt-4">

  <div className="d-flex justify-content-between">
    <button className="btn btn-danger" onClick={handleEndFunding}>
      Kết thúc chiến dịch huy động
    </button>
    <button className="btn btn-success" onClick={handleWithdrawFunds}>
      Rút tiền khỏi hợp đồng
    </button>
  </div>
</div>

            <h5 className="mt-4">Danh sách quyên góp</h5>
            <table class="table">
            <thead>
    <tr>
      <th>Tài Khoản</th>
      <th>Tổng Tiền</th>
    </tr>
  </thead>
  <tbody>
    {donations.map((item) => (
      <tr key={item._id}>
        <td>{item.user}</td>
        <td>{item.amount}</td>
      </tr>
    ))}
  </tbody>
</table>


       
          </div>
        ) : (
          <div>
            <p>Bạn chưa kết nối ví MetaMask. Vui lòng kết nối ví để tham gia dự án.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
