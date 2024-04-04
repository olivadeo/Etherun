
import { createPublicClient, http } from 'viem'
import { hardhat } from 'viem/chains'
import { sepolia } from './sepolia'


const env = process.env.NEXT_PUBLIC_ENV || ""
let client ='';

if(env && env == 'SEPOLIA')
  client = createPublicClient({ chain: sepolia,transport: http()})
else  
  client = createPublicClient({ chain: hardhat,transport: http()})

export const publicClient = client;
  
