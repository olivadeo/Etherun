// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RaceOrganizer is Ownable {
    
    struct Organizer {
        bool isRegistered;
        string name;
    }

    mapping(address => Organizer) private organizers;
    uint256 private organizerCounter;

    constructor() Ownable(msg.sender) {}

    event OrganizerDeactivated(address indexed organizer, string name);
    event OrganizerRegistered(address indexed organizer, string name);
    event RaceOrganizerBalanceCollected (address organizer, uint256 value);
    event EtherReceived(address organizer, uint256 value);

    function isOrganizerRegistred(address _organizer) external view returns(bool){

        Organizer storage organizer = organizers[_organizer];
        return (organizer.isRegistered);
    }

    function registerOrganizer(string memory _name) external payable {
        require(!organizers[msg.sender].isRegistered, "You are already registered as an organizer");
        require(msg.value == 0.03 ether, "Registering as Organizer cost : 0.03 ETH");
        
        organizers[msg.sender] = Organizer(true,  _name);
        organizerCounter++;

        emit OrganizerRegistered(msg.sender, _name);
    }

    function getOrganizerById(address _organizer) external view returns (Organizer memory){
        require (msg.sender == _organizer || msg.sender == owner(), "You are not authorized");
        return organizers[_organizer];
    }
    
    //GIMME $$$$
    function withdraw() external onlyOwner {
        
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);

        emit RaceOrganizerBalanceCollected(msg.sender, balance);
    }

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }
}
