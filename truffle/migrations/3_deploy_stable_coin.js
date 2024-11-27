const StableCoin = artifacts.require("StableCoin");

module.exports = function (deployer) {
  const initialSupply = web3.utils.toWei("1000000", "ether"); // Tổng số lượng StableCoin ban đầu
  const recipient = "0x462142AF79Dfe7f6caf6A9738328293846E0575F"; // Địa chỉ ví nhận StableCoin
  deployer.deploy(StableCoin, initialSupply).then(function (instance) {
    return instance.transfer(recipient, initialSupply);
  });
};
