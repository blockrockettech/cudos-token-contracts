const CudosToken = artifacts.require('CudosToken');

module.exports = async function(deployer) {
  deployer.deploy(CudosToken);
};
