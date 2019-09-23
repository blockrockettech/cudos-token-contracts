pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";

contract CudosToken is ERC20, ERC20Detailed, WhitelistedRole {

    bool public transfersEnabled = false;

    uint256 constant internal ONE_HUNDRED_BILLION = 100000000000;

    constructor () public ERC20Detailed("CudosToken", "CUDOS", 18) {
        _mint(msg.sender, ONE_HUNDRED_BILLION  * (10 ** uint256(decimals())));
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(isWhitelisted(msg.sender), "Caller can not currently transfer");

        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(isWhitelisted(msg.sender), "Caller can not currently transfer");

        return super.transferFrom(sender, recipient, amount);
    }

    function enableTransfers() external onlyWhitelistAdmin {
        require(!transfersEnabled, "Transfers have been enabled");

        transfersEnabled = true;
    }
}

