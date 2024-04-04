// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MedicalCertificateNFT.sol";

contract Runners is Ownable {
    struct Runner {
        bool isRegistered;
        bool isMedicalCertificateValidated;
        string firstName;
        string lastName;
        uint age;
        string medicalCertificate; // IPFS hash 
        string medicalCertificateNftUrl;
    }

    mapping(address => Runner) private runners;
    mapping(address => uint256) private runnersMedicCertifTokenIds;
    address[] private pendingValidationRunners;
    uint256 private runnerCounter;
    MedicalCertificateNFT private medicalCertificateNFTContract;

    constructor (MedicalCertificateNFT _medicalCertificateNFTContract)  Ownable (msg.sender){
        medicalCertificateNFTContract = _medicalCertificateNFTContract;
    }

    event RunnerRegistered( address indexed runner, 
                            string firstName, 
                            string lastName, 
                            uint age, 
                            bool isMedicalCertificateValidated);
    event RunnerMedicalCertificateUpdated( address indexed runner);
    event RunnerMedicalCertificateValidated( address indexed runner);
    event RunnerBalanceCollected(address owner,uint balance);
    event EtherReceived(address runner, uint256 value);


    function isRunnerRegisteredAndHasAValidMedicalCertificate(address _runner) external view returns(bool){

        Runner storage runner = runners[_runner];
        if( runner.isRegistered && runner.isMedicalCertificateValidated) {
            return true;
        }
        return false;
    }

    function registerRunner(    string memory _firstName, 
                                string memory _lastName, 
                                uint _age
                            ) external payable {
       
        require(!runners[msg.sender].isRegistered, "You are already registered as a runner");
        require(bytes(_firstName).length > 0, "Please give your first name");
        require(bytes(_lastName).length > 0, "Please give your last name");
        require(_age > 0, "Please give your age");
        require(msg.value == 0.01 ether, "The registration cost on the platform is 0.01 ETH");

        runners[msg.sender] = Runner(   true, 
                                        false, 
                                        _firstName, 
                                        _lastName, 
                                        _age, 
                                        '' , '');
        runnerCounter++;

        pendingValidationRunners.push(msg.sender);

        emit RunnerRegistered(  msg.sender,
                                _firstName, 
                                _lastName, 
                                _age, 
                                false   );
    }

    function setMedicalCertificate(address _runner, string memory _ipfsCerificate, string memory _medicNftUrl) external {
        require(msg.sender == _runner, "You are not authorized");
        require(runners[_runner].isRegistered, "You are not registered as a runner");
        
        runners[msg.sender].medicalCertificate = _ipfsCerificate;
        runners[msg.sender].medicalCertificateNftUrl = _medicNftUrl;
        runners[msg.sender].isMedicalCertificateValidated = false;
        runnersMedicCertifTokenIds[msg.sender] = 0;
        
        pendingValidationRunners.push(msg.sender);

        emit RunnerMedicalCertificateUpdated( _runner);

    }

    function validatePendingMedicalCertificates() external onlyOwner() {
        require (pendingValidationRunners.length > 0, "Nothing to validate");
        address runnerAddress;

        for(uint i = 0 ; i<= pendingValidationRunners.length -1 ; i++){
            
            runnerAddress = pendingValidationRunners[i];

            uint tokenId = medicalCertificateNFTContract.mintMedicalCertificateNFT(     runnerAddress,
                                                                                        runners[runnerAddress].medicalCertificateNftUrl);
            runnersMedicCertifTokenIds[runnerAddress] = tokenId;
            runners[runnerAddress].isMedicalCertificateValidated = true;

            emit RunnerMedicalCertificateValidated(runnerAddress);
        }
        delete pendingValidationRunners;
    }

/*
    function getRunnersMedicCertifTokenId(address _runner) external view returns(uint256){
        require(_runner != address(0), "Please give the runner address");
        require(msg.sender == owner() || msg.sender == _runner, "Not authorized");

        return runnersMedicCertifTokenIds[_runner];

    }*/
    
    function getRunnerById(address _runner) external view returns (Runner memory){
        require (msg.sender == _runner || msg.sender == owner(), "You are not authorized");
        return runners[_runner];
    }

    //GIMME $$$$
    function withdraw() external onlyOwner {
        
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
        
        emit RunnerBalanceCollected(msg.sender,balance);
    }

    receive() external payable {
        emit EtherReceived(msg.sender, msg.value);
    }

}
