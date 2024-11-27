// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProjectToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("ProjectToken", "PTK") {
        _mint(msg.sender, initialSupply);  // Phát hành số token ban đầu cho địa chỉ của người triển khai
    }
}
