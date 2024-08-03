const RealEstateTransaction = artifacts.require("RealEstateTransaction");

module.exports = function (deployer) {
  const sellerAddress = "0x8505C9F29f8cb997f85b3Af92EE8e0BA6b46c454"; // Replace with actual seller address
  deployer.deploy(RealEstateTransaction, sellerAddress);
};
