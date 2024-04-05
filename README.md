# Etherun
Projet Final ALYRA


# Deployment frontend :

In frontend directory :

- create .env file with following values :
  
NEXT_PUBLIC_REACT_APP_PROJECTID=*YOUR_WALLETCONNECT_KEY*

NEXT_PUBLIC_INFURA_RPC= *YOUR_INFURA_RPC_URL*

NEXT_PUBLIC_ENV=*SEPOLIA* #if empty = local HARDHAT chain

NEXT_PUBLIC_NFTSTORAGEKEY = *YOUR_NFTSTORAGE_KEY_FOR_IPFS*

IF NEXT_PUBLIC_ENV=SEPOLIA then provide the block number from which poll the log
  NEXT_PUBLIC_STARTING_BLOCK = *BLOCK_NUMBER_FROM_WHICH_LOG_IS_POLL*

launch : 
#yarn install 
#yarn dev

Link to the DAPP : http://localhost:3000/

vidéo dans le repo : frontend/video/Demo_Video_ETHERUN.webm

lien JAM Video  : [ETHERUN_JAM](https://jam.dev/c/330d35f0-5816-4622-8d9f-b003baa41535)
  
Lien Déploiement: [DAPP_VOTING_VERCEL](https://etherun.vercel.app/)  
Déployé sur sépolia


# Deployment Backend :

#yarn install 

Le script de deploiement se trouve ici :

#backend/ignition/modules/RunningNFT.js
 
pour Déployer : 

#yarn hardhat run ./ignition/modules/RunningNFT.js --network <localhost|sepolia>