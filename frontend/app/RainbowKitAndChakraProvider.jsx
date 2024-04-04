//'use client';
import { ChakraProvider } from '@chakra-ui/react'
import { getDefaultConfig, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { sepolia } from './utils/sepolia';
import '@rainbow-me/rainbowkit/styles.css';
import {QueryClientProvider,QueryClient,} from "@tanstack/react-query";

let deployedConfig ='';

export const targetEnv = process.env.NEXT_PUBLIC_ENV || ""
let block=process.env.NEXT_PUBLIC_STARTING_BLOCK || ""

if(!block) block=0n 

export const startingBlock = block

if( targetEnv && targetEnv ==='SEPOLIA'){
 
 deployedConfig = getDefaultConfig({
    appName: 'ALYRA-COURS',
    projectId: process.env.NEXT_PUBLIC_REACT_APP_PROJECTID,
    chains: [sepolia],
    ssr:true
  });
}
else{
  deployedConfig = getDefaultConfig({
    appName: 'ALYRA-COURS',
    projectId: process.env.NEXT_PUBLIC_REACT_APP_PROJECTID,
    chains: [hardhat],
    ssr:true
  });
}
/*
const config = getDefaultConfig({
  appName: 'ALYRA-COURS',
  projectId: process.env.NEXT_PUBLIC_REACT_APP_PROJECTID,
  chains: [hardhat],
  ssr:true
});

const sepoliaConfig = getDefaultConfig({
  appName: 'ALYRA-COURS',
  projectId: process.env.NEXT_PUBLIC_REACT_APP_PROJECTID,
  chains: [sepolia],
  ssr:true
});
*/
const config = deployedConfig;

const queryClient = new QueryClient();


const RainbowKitAndChakraProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
       <QueryClientProvider client={queryClient}>
         <RainbowKitProvider>
             <ChakraProvider>
                {children}
            </ChakraProvider>
         </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitAndChakraProvider