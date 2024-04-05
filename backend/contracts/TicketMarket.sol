// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./Race.sol";
import "./Runners.sol";


contract TicketMarket is Ownable,  IERC721Receiver  {
    struct TicketForSale {
        uint raceId;
        uint tokenId;
        address seller;
        uint price;
        uint marketSaleId;
    }

    mapping(uint => TicketForSale) private ticketsForSale;
    address payable private raceContracAddress;

    Runners private runnerContract;
    uint private saleId;

    event TicketReceivedOnMarket(uint indexed ticketId, uint indexed raceId, uint indexed tokenId, address seller, uint price, uint saleId);
    event TicketSoldOnMarket(uint indexed ticketId, uint indexed raceId, uint indexed tokenId, address seller, uint price, address buyer);

    constructor(address payable _raceContract,address payable _runnerContract ) Ownable(msg.sender) 
    {
        raceContracAddress=_raceContract;
        runnerContract = Runners(_runnerContract);
        saleId =1;
    }

    function onERC721Received(address _from, address _to, uint256 _tokenId, bytes memory _data) external override returns (bytes4) {
        uint[3] memory ticketData; 
        ticketData = Race(raceContracAddress).getTicketInfo(_from,_tokenId);

        require (ticketData[2] >0, "No selling price");
        require (ticketsForSale[ticketData[1]].tokenId == 0, "Ticket is already to sale" );

        ticketsForSale[ticketData[1]] = TicketForSale(ticketData[0], _tokenId, _from, ticketData[2],saleId);
        saleId++;

        emit TicketReceivedOnMarket(ticketData[1], ticketData[0], _tokenId, _from,  ticketData[2],saleId -1);

        return this.onERC721Received.selector;
    }

    function buyTicket(uint _ticketId) external payable {
       // require(IERC721(raceContracAddress).ownerOf(ticketsForSale[_ticketId].tokenId) == address(this),"NOT OWNER");
        require(runnerContract.isRunnerRegisteredAndHasAValidMedicalCertificate(msg.sender), "Not a runner with a valid medical certificate");
        require(msg.value == ticketsForSale[_ticketId].price, "please provide the expected amount");
        
        TicketForSale memory ticket = ticketsForSale[_ticketId];
        
        IERC721(raceContracAddress).safeTransferFrom(address(this), msg.sender, ticket.tokenId);
        
        require(IERC721(raceContracAddress).ownerOf(ticketsForSale[_ticketId].tokenId) == msg.sender, "NFT Transfer failed");
        Race(raceContracAddress).updateTicketOwner(msg.sender, ticket.seller, _ticketId);

        address payable seller = payable(ticket.seller);
        payable(seller).transfer(msg.value);

        //cleaning
        ticketsForSale[_ticketId].seller = address(0);
        ticketsForSale[_ticketId].price = 0;
        ticketsForSale[_ticketId].tokenId = 0;
        ticketsForSale[_ticketId].raceId = 0;
        ticketsForSale[_ticketId].marketSaleId = 0;

        emit TicketSoldOnMarket(_ticketId, ticket.raceId, ticket.tokenId, ticket.seller, msg.value, msg.sender);
    }

    function getTicketOnSaleSeller(uint _ticketId) external view returns (address){
        return ticketsForSale[_ticketId].seller;
    }

    /*
    function isMarketToken(uint256 _tokenId) external view returns (bool) {
        return IERC721(raceContracAddress).ownerOf(_tokenId) == address(this);
    }

    
    }*/
}
