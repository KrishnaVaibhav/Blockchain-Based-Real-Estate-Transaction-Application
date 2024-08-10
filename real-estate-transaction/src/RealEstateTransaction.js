import Web3 from "web3";
import RealEstateTransaction from "./RealEstateTransaction.json";

const getWeb3 = async () => {
  return new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
};

const getContract = async (web3) => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = RealEstateTransaction.networks[networkId];
  const instance = new web3.eth.Contract(
    RealEstateTransaction.abi,
    deployedNetwork && deployedNetwork.address
  );
  return instance;
};

export { getWeb3, getContract };
