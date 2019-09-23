pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";


contract CudosToken is ERC20, ERC20Detailed {
    constructor () public ERC20Detailed("CudosToken", "CUDOS", 18) {
        _mint(msg.sender, 10000000000  * (10 ** uint256(decimals())));
    }
}

