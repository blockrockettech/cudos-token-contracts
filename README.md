# cudos-token

Contracts are 

### Cudos Token Smart Contract

* Is ERC20 compliant
* Responsible for holding all tokens balances on the Cudos platform infrastructure
* The **CudosToken** has the following properties
  * Defines a token `name` - `CudosToken`
  * Defines a token `symbol` - `CUDOS`
  * Defines the number of `decimals` the token is divisible by - `18`
  * Defines the total supply of tokens - `10 billion` tokens are created upon contract creation
* The token has a `transfersEnabled` flag that can be called once and once only to enable transfers for all. Only whitelisted admin addresses can call this function.
* The token has a `whitelisted` addresses that can transfer tokens even if the `transfersEnabled` flag is set to false. Only whitelisted admin addresses can add other addresses to the whitelist.


## Local Installation & Testing

1. Install [Truffle](http://truffleframework.com), [Ganache](https://www.trufflesuite.com/ganache) and [NodeJs](https://nodejs.org/en/)(version 10.x upwards) globally
```bash
npm install -g truffle
```
	
2. Install dependencies.
```bash
npm install
```

3. Run tests. 
```bash
npm run test
```

### Code Coverage

* Code coverage and instrumentation performed by [solidity-coverage](https://github.com/sc-forks/solidity-coverage)

* To run code coverage `npm run coverage` - this will produce the following:
  * Configuration found in `./solcover.js`
  * HTML output in `/coverage/index.html`
  * JSON output in `./.coverage.json`
  * Terminal output
