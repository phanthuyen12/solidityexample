const ProjectToken = artifacts.require("ProjectToken");

module.exports = async function(deployer) {
  const initialSupply = 1000000;  // Đây là số lượng token ban đầu
  await deployer.deploy(ProjectToken, initialSupply);
};
