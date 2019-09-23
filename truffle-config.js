const HDWalletProvider = require('@truffle/hdwallet-provider');

const MNEMONIC = process.env.CUDOS_MNEMONIC || '';
const INFURA_KEY = process.env.CUDOS__INFURA_KEY || '';

module.exports = {
    // N.B - this seems to crash solidity-coverage so its disabled
    // mocha: {
    //     reporter: 'eth-gas-reporter',
    //     reporterOptions : {
    //         currency: 'GBP',
    //         gasPrice: 5
    //     }
    // },
    compilers: {
        solc: {
            version: '0.5.0',
            settings: {
                optimizer: {
                    enabled: true, // Default: false
                    runs: 200      // Default: 200
                },
            }
        }
    },
    networks: {
        development: {
            host: '127.0.0.1',
            port: 7545,
            gas: 6721975, // <-- Use this high gas value
            gasPrice: 1000000000,    // <-- Use this low gas price
            network_id: '*', // Match any network id
        },
        ganache: {
            host: '127.0.0.1',
            port: 7545,
            gas: 6721975, // <-- Use this high gas value
            gasPrice: 1000000000,    // <-- Use this low gas price
            network_id: '5777', // Match any network id
        },
        coverage: {
            host: "localhost",
            network_id: "*",
            port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
            gas: 0xfffffffffff, // <-- Use this high gas value
            gasPrice: 0x01      // <-- Use this low gas price
        },
        ropsten: {
            provider: function () {
                return new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/v3/${INFURA_KEY}`);
            },
            network_id: 3,
            gas: 7000000, // default = 4712388
            gasPrice: 4000000000, // default = 100 gwei = 100000000000
            skipDryRun: true
        },
        // live: {
        //     provider: function () {
        //         return new HDWalletProvider(MNEMONIC, `https://mainnet.infura.io/v3/${INFURA_KEY}`);
        //     },
        //     network_id: 1,
        //     gas: 6075039,         // default = 4712388
        //     gasPrice: 4100000000, // default = 100 gwei = 100000000000
        //     timeoutBlocks: 200,   // # of blocks before a deployment times out  (minimum/default: 50)
        //     skipDryRun: true      // Skip dry run before migrations? (default: false for public nets )
        // },
    }
};
