// Tải các hợp đồng cần thiết
const DoneToken = artifacts.require("DoneToken");
const ProjectToken = artifacts.require("ProjectToken");
const StableCoin = artifacts.require("StableCoin");

module.exports = async function (deployer) {

  await deployer.deploy(ProjectToken, web3.utils.toWei("1000000", "ether"));


  await deployer.deploy(StableCoin, web3.utils.toWei("1000000", "ether"));


  const projectTokenInstance = await ProjectToken.deployed();
  const stableCoinInstance = await StableCoin.deployed();

  const rateToken = 100;
  const fundingGoal = web3.utils.toWei("500000", "ether"); 
  const fundingDeadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; 
  const nameToken = "DoneToken"; // Tên token của dự án


  await deployer.deploy(
    DoneToken,
    projectTokenInstance.address, 
    stableCoinInstance.address, 
    rateToken,
    fundingGoal,
    fundingDeadline,
    nameToken 
  );
};
