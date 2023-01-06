// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract MyTest {
    uint256 public unlockedTime;
        address payable public owner;
        event Withdrawal(uint256 amount, uint256 when);

    constructor(uint256 _unlockedTime) payable {
        require(block.timestamp < _unlockedTime, "unlocked time should be in future");
        unlockedTime = _unlockedTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(block.timestamp >= unlockedTime, "wait till the time period completed");
        require(msg.sender == owner, "You are not an owner");

        emit Withdrawal(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);

    }
}