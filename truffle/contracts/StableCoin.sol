// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StableCoin is ERC20 {
    uint8 private _decimals;

    constructor(uint256 initialSupply) ERC20("StableCoin", "USDS") {
        _mint(msg.sender, initialSupply);
        _decimals = 18;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
