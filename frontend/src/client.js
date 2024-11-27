import { useEffect, useState } from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.min.css';
import DoneToken from './contracts/DoneToken.json';
import StableCoin from './contracts/StableCoin.json';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contribution, setContribution] = useState('');
  const [receivedTokens, setReceivedTokens] = useState(null);
  const [isFundingActive, setIsFundingActive] = useState(true);
  const [goalReached, setGoalReached] = useState(false);
  const [totalTokensContributed, setTotalTokensContributed] = useState(null);

  // Khai báo các biến tổng
  const CONTRACT_ADDRESS = '0xC8dF34b47A6C7fA528DAC82988173F4F9609D280'; 
  const USDS_ADDRESS = '0x5cD401Af7D10d9B09eD6281E83099D4fa708761C'; 


  useEffect(() => {
    async function load() {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const balanceWei = await web3.eth.getBalance(accounts[0]);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(balanceEth);

        // Sử dụng CONTRACT_ADDRESS và USDS_ADDRESS thay vì hardcode địa chỉ
        const contract = new web3.eth.Contract(DoneToken.abi, CONTRACT_ADDRESS);
        const totalTokens = await contract.methods.getTotalTokensReceived(accounts[0]).call();
        console.log(totalTokens);
        setTotalTokensContributed(web3.utils.fromWei(totalTokens, 'ether'));

        const usdsContract = new web3.eth.Contract(StableCoin.abi, USDS_ADDRESS);
        const sumToken = await usdsContract.methods.balanceOf(accounts[0]).call();
        const sumTokenFormatted = web3.utils.fromWei(sumToken, 'ether');
        setTokenBalance(sumTokenFormatted);

        const fundingActive = await contract.methods.fundingActive().call();
        const fundingGoal = await contract.methods.fundingGoal().call();
        const totalFunds = await contract.methods.totalStableCoins().call();
        setGoalReached(totalFunds >= fundingGoal);
        setIsFundingActive(fundingActive);
      } catch (err) {
        setError('Unable to connect to MetaMask or an error occurred.');
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleContributionChange = (event) => {
    setContribution(event.target.value);
  };

  const handleContribution = async () => {
    if (account && contribution) {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(DoneToken.abi, CONTRACT_ADDRESS);
      const usdsContract = new web3.eth.Contract(StableCoin.abi, USDS_ADDRESS);

      try {
        const amountInWei = web3.utils.toWei(contribution, 'ether');

        const approveTx = await usdsContract.methods.approve(CONTRACT_ADDRESS, amountInWei).send({ from: account });
        console.log('Approve Transaction:', approveTx);

        const tx = await contract.methods.fundProject(amountInWei).send({ from: account, gas: 200000 });
        console.log('Contribution Transaction:', tx);

        const data = {
          user: account,
          amount: contribution
        };
        console.log(data);

        // Gửi dữ liệu đóng góp tới server
        fetch('http://localhost:3000/donate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data) // Chuyển đối tượng data thành chuỗi JSON
        })
          .then(response => response.json()) // Xử lý phản hồi từ server
          .then(result => {
            console.log('Kết quả từ server:', result);
          })
          .catch(error => {
            console.error('Lỗi khi gửi yêu cầu:', error);
          });

        alert('Contribution successful!');

        // Lấy số token đã nhận sau khi đóng góp
        const tokensReceived = await contract.methods.balanceOfTokens(account).call();
        setReceivedTokens(web3.utils.fromWei(tokensReceived, 'ether'));
      } catch (err) {
        console.error('Transaction error:', err);
        setError('An error occurred while making the contribution. Details: ' + err.message);
      }
    } else {
      setError('Please enter a valid amount of stablecoin and try again.');
    }
  };

  const handleClaimTokens = async () => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(DoneToken.abi, CONTRACT_ADDRESS);

    try {
      const tx = await contract.methods.claimTokens().send({ from: account, gas: 200000 });
      console.log('Claim Tokens Transaction:', tx);
      alert('Tokens claimed successfully!');
    } catch (err) {
      console.error('Error claiming tokens:', err);
      setError('Error occurred while claiming tokens. Details: ' + err.message);
    }
  };

  return (
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
          <h5>Tổng số token bạn đã khuyên góp:</h5>
          <p>{totalTokensContributed} DoneToken</p>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">Nhập Số Stable Coin Khuyên Góp</span>
            </div>
            <input
              type="text"
              className="form-control"
              value={contribution}
              onChange={handleContributionChange}
              placeholder="Số lượng Stablecoin"
              aria-label="Stablecoin Amount"
              aria-describedby="basic-addon1"
            />
          </div>
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" type="button" onClick={handleContribution}>Khuyên Góp</button>
          </div>

          {receivedTokens && (
            <div className="mt-3">
              <h5>Số token bạn nhận được:</h5>
              <p>{receivedTokens} DoneToken</p>
            </div>
          )}

          {goalReached && !isFundingActive && (
            <div className="mt-3">
              <button className="btn btn-success" onClick={handleClaimTokens}>Claim Tokens</button>
            </div>
          )}
        </div>
      ) : (
        !loading && <div className="alert alert-warning">Vui lòng kết nối ví Ethereum.</div>
      )}
    </div>
  );
}

export default App;
