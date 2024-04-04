// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalCertificateNFT is ERC721, Ownable {

    mapping(uint256 => string) private tokenURIs;
    address[] private authorizedContracts;
    uint256 private nextToken = 1 ;

    constructor() Ownable(msg.sender) ERC721("Medical Certificate NFT", "MCNFT") {}
        
    event ContractAuthorized(address contrat);

    function mintMedicalCertificateNFT(address _runner, string memory _metadata) external returns (uint)  {
        require(isContractAuthorized(msg.sender),"Not authorized"); // contrat appelant autoriser a delivrer le NFT

        uint tokenId = uint(keccak256(abi.encodePacked(block.timestamp, _runner, nextToken)));
        _safeMint(_runner, tokenId);
        _setTokenUri(tokenId,_metadata);
        nextToken++;
        return tokenId;
    }

    function _setTokenUri(uint256 _tokenId, string memory _tokenUri) private {
        tokenURIs[_tokenId] = _tokenUri;
    }

    function authorizeContract(address _contract) external onlyOwner{
        authorizedContracts.push(_contract);

        emit ContractAuthorized(_contract);
    }

    function isContractAuthorized(address _contract) private view returns(bool) {
    
        // if(_contract == msg.sender) return true;
        if(_contract == owner()) return true;

        for(uint i = 0; i< authorizedContracts.length ; i++){
            if(authorizedContracts[i] == _contract)
                return true;
        }
        return false;
    }

    /* //NOT USED YET 
    function getTokenUri(uint256 tokenId) external view returns (string memory) {
        require (msg.sender == owner() || ownerOf(tokenId) == msg.sender);
        return tokenURIs[tokenId];
    }`*/
}

