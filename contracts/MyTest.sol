//SDPX-License-Identifier:UNLICENSED
pragma solidity ^0.8.19;

//Importanr hardhat console
import "hardhat/console.sol";
contract MyTest{
    uint256 public unlockedTime;
    address payable public owner;

    event Withdrawal(uint256 amount, uint256 when);

    constructor(uint256 _unlockedTime) payable {
        require(block.timestamp < _unlockedTime,"Unlock time should be in future");
        unlockedTime=_unlockedTime;
        owner =payable(msg.sender);
    }
    // receive() payable external{}
    function withdraw()public{
        require(block.timestamp>=unlockedTime,"wait untill time period completed");
        require(msg.sender == owner,"u r not Owner");
        emit Withdrawal(address(this).balance,block.timestamp);

    owner.transfer(address(this).balance);
    }
}

