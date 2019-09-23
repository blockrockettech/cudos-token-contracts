pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";


contract CudosToken is ERC20, ERC20Detailed, WhitelistedRole {
    constructor () public ERC20Detailed("CudosToken", "CUDOS", 18) {
        _mint(msg.sender, 10000000000  * (10 ** uint256(decimals())));
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    function enableTransfers() public view onlyWhitelistAdmin {
        // solhint-disable-previous-line no-empty-blocks
    }

    // FIXME do we need this?
    function removeWhitelistAdmin(address account) public {
        _removeWhitelistAdmin(account);
    }

    function _removeWhitelistAdmin(address account) internal {
        super._removeWhitelistAdmin(account);
    }
}

