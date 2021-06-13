require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const { projectId, mnemonic } = require('./secret.json');
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() { 
       return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${projectId}`);
      },
      network_id: 4,
      gas: 5500000,      
      confirmations: 2,   
      timeoutBlocks: 200,  
      skipDryRun: true 
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: ">=0.6.0 <0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}