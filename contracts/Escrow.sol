//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Escrow {
    address public payer;
    address payable public payee;
    address public lawyer;
    uint256 public amount;

    constructor(
        address _payer,
        address payable _payee,
        uint256 _amount
    ) {
        payer = _payer;
        payee = _payee;
        lawyer = msg.sender;
        amount = _amount;
    }

    function deposit() public payable {
        require(msg.sender == payer, "Only Payer can deposit the funds");
        require(
            address(this).balance <= amount,
            "Cant send more than escrow amount"
        );
    }

    function release() public {
        require(
            address(this).balance == amount,
            "Insufficient funds for release"
        );
        require(msg.sender == lawyer, "only Lawyer can release the funds");
        payee.transfer(amount);
    }

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }
}
