// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./RaceOrganizer.sol";
import "./Runners.sol";
import "./TicketMarket.sol";

contract Race is Ownable , ERC721 {

    struct RaceInfo {
        string name;
        uint maxTickets;
        uint ticketPrice;
        uint ticketsSoldCount;
        bool isActive;
        address payable organizer;
        string ipfsLogo; // NOT YET USED
        uint raceDate; 
    }

    struct Ticket {
        uint256 ticketId;
        uint256 tokenId;
        uint256 raceId;
        string metadata;
        uint256 sellingPrice; 
    }
    
    mapping (address => Ticket[]) private runnerTickets;
    mapping (uint256 => address) private ownerOfTokens;
    mapping (address => RaceInfo[]) private racesOrganizer;
    mapping(uint256 => string) private tokenURIs;

    RaceInfo[] public races;

    uint private nextRaceId;
    uint private ticketId;
    uint private maxRace = 500; 

    RaceOrganizer private raceOrganizerContract;
    Runners private runnerContract;
    address private ticketMarketContract;
    address[] private authorizedContracts;

    event RaceCreated(uint indexed raceId, uint maxTickets, uint ticketPrice);
    event Received(address indexed from , uint256 value);
    event RaceBalanceCollected(address indexed owner, uint256 balance);
    event RunnerRegisteredOnRace(address indexed runner, uint indexed raceId, uint ticketId, uint tokenId);
    event TicketOwnerChanged(uint256 _ticketId, address indexed _initialOwner, address indexed _newOwner);
    event TicketPutOnMarketForSale(uint _ticketId, uint _tokenId, address _runner, uint _price);

    constructor(address payable _raceOrganizerContract, address payable _runnerContract) 
    Ownable(msg.sender)
    ERC721("Race Registration NFT","RRTK") {
        
        raceOrganizerContract = RaceOrganizer(_raceOrganizerContract);
        runnerContract = Runners(_runnerContract);
    }


    function setTicketMarket(address _ticketMarketAddress) external onlyOwner(){
        ticketMarketContract = _ticketMarketAddress; //apres le déploiement, on assigne l'adresse de la marketplace de ticket
    }

    function hasTheRunnerATicketforRace(uint _raceId) private view returns (bool) {
        Ticket[] storage ticketList = runnerTickets[msg.sender];

        for (uint i = 0; i < ticketList.length; i++) {
            if (ticketList[i].raceId == _raceId) {
                return true;
            }
        }
        return false;
    }

    function createRace(string memory _name, uint _maxTickets, uint _ticketPrice, address payable _organizer, string memory _ipfsLogo, uint _raceDate) external  {
        require(msg.sender == owner() || raceOrganizerContract.isOrganizerRegistred(msg.sender) , "Not a registered organizer");
        require(nextRaceId < maxRace, "to many races on the platform" );

        RaceInfo memory raceInfo = RaceInfo(_name, _maxTickets, _ticketPrice, 0, true, _organizer ,_ipfsLogo, _raceDate);
        races.push(raceInfo);
        racesOrganizer[msg.sender].push(raceInfo);
        nextRaceId++;
        
        emit RaceCreated(nextRaceId-1, _maxTickets, _ticketPrice);
    }

    function registerRunner(uint _raceId, string memory _metadata) external payable {
        require(races[_raceId].ticketsSoldCount < races[_raceId].maxTickets, "No more tickets available");
        require(runnerContract.isRunnerRegisteredAndHasAValidMedicalCertificate(msg.sender), "You must be registered and have a medical certificate NFT to register for the race");
        require(msg.value == races[_raceId].ticketPrice, "Please provide the right ticket price ");
        require(!hasTheRunnerATicketforRace(_raceId), "You already have a ticket for the race");

        // token de course
        uint tokenId =  _mintRaceToken(ticketId,_raceId,_metadata);

        ticketId++;
        races[_raceId].ticketsSoldCount++;

        uint256 organizerAmount ;
        bool success;
        (success,organizerAmount) = Math.tryMul(9,msg.value);
        (success,organizerAmount) = Math.tryDiv(organizerAmount,10); 
        
        (races[_raceId].organizer).transfer(organizerAmount); // 90% du montant a l'organizer, 10% de comm

        // Émettre un événement pour l'inscription du participant à la course
        emit RunnerRegisteredOnRace(msg.sender, _raceId, ticketId-1,tokenId) ;
    }

    function _mintRaceToken(uint _ticketId,uint _raceId, string memory _metadata) private returns(uint) {

        uint tokenId = uint(keccak256(abi.encodePacked(block.timestamp, address(this), msg.sender,_ticketId)));
        _safeMint(msg.sender, tokenId);
        _setTokenUri(tokenId,_metadata);

        approve(address(this), tokenId); // autorise a transferer le NFT

        runnerTickets[msg.sender].push((Ticket(_ticketId,tokenId,_raceId,_metadata,0)));
        ownerOfTokens[tokenId]= msg.sender;

        return tokenId;
    }

    function putTicketOnMarketForSale(uint256 _ticketId, uint256 _tokenId, uint256 _price) external {
        require(ownerOf(_tokenId) == msg.sender, "Not owner or not found or already to sale on market");
        require(_price > 0, "No price provided");

        // on assigne le prix de vente au ticket
        for (uint256 i = 0; i <  runnerTickets[msg.sender].length; i++) {
            if ( runnerTickets[msg.sender][i].ticketId == _ticketId) {
                 runnerTickets[msg.sender][i].sellingPrice = _price;
            }
        }
        //transfert du ticket NFT
        safeTransferFrom(msg.sender, ticketMarketContract, _tokenId);

        // Vérifier que le transfert s'est effectué avec succès
        require(ownerOf(_tokenId) == ticketMarketContract, "NFT Transfer failed");
        
        emit TicketPutOnMarketForSale(_ticketId, _tokenId, msg.sender, _price);
    }

    function getTicketInfo(address _owner, uint256 _tokenId) public view returns (uint[3] memory ){
        require(isContractAuthorized(msg.sender),"Caller not Authorized");
       
        uint[3] memory  ticketData;
        Ticket storage ticket;

        //Recuperation des information id de course / id ticket / prix de vente 
        for (uint256 i = 0; i <  runnerTickets[_owner].length; i++) {
            if ( runnerTickets[_owner][i].tokenId == _tokenId) {
               
                ticket  =  runnerTickets[_owner][i];
                ticketData = [ticket.raceId,ticket.ticketId,ticket.sellingPrice];

                return ticketData;
            }
        }
       //  ticketData = [uint(0),uint(0),uint(0)];
        return ticketData;
    }

 function updateTicketOwner(address _newOwner, address _initialOwner, uint256 _ticketId) external {
        require(isContractAuthorized(msg.sender),"Caller not Authorized");

        for (uint256 i = 0; i <  runnerTickets[_initialOwner].length; i++) {
            if ( runnerTickets[_initialOwner][i].ticketId == _ticketId) {
                //affectation du nouveau proprietaire
                ownerOfTokens[runnerTickets[_initialOwner][i].tokenId] = _newOwner;

                //creation du ticket pour l'acheteur
                runnerTickets[_newOwner].push((Ticket(  _ticketId,
                                                         runnerTickets[_initialOwner][i].tokenId,
                                                         runnerTickets[_initialOwner][i].raceId,
                                                         runnerTickets[_initialOwner][i].metadata,
                                                         0  )));

                //suppression du ticket du précedent owner (vendeur)
                runnerTickets[_initialOwner][i] =  runnerTickets[_initialOwner][runnerTickets[_initialOwner].length - 1]; // Remplacer par le dernier élément
                runnerTickets[_initialOwner].pop(); // Supprimer le dernier élément
 
                 return; 
            }
        }
        emit TicketOwnerChanged(_ticketId, _initialOwner,_newOwner);
    }

    function getTicketsByRunner(address _runner) external view returns ( Ticket[] memory )  {
        require (msg.sender == _runner || msg.sender == owner() , "You are not authorized");
        return runnerTickets[_runner];
    }
   

    function authorizeContract(address _contract) external onlyOwner{
        authorizedContracts.push(_contract);
    }

    function isContractAuthorized(address _contract) private view returns(bool) {
        
        if(_contract == owner()) return true;

        for(uint i = 0; i< authorizedContracts.length ; i++){
            if(authorizedContracts[i] == _contract)
                return true;
        }
        return false;
    }


    function _setTokenUri(uint256 _tokenId, string memory _tokenUri) private {
        tokenURIs[_tokenId] = _tokenUri;
    }
   
    function withdraw() external onlyOwner {
        
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);

        emit RaceBalanceCollected(msg.sender, balance);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function getRaceById(uint256 _raceId) external view returns (RaceInfo memory) {
        return races[_raceId];
    }


}
