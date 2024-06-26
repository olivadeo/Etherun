'use client'
import { useState, useEffect } from 'react';
import { Stack } from '@chakra-ui/react'
import { useAccount,  } from "wagmi";
import { contractTicketMarket } from "@/constants";
import { publicClient } from "@/app/utils/clients";
import { parseAbiItem } from 'viem';
import { targetEnv, startingBlock } from "@/app/RainbowKitAndChakraProvider";
import RaceTokenOnMarketAsCard from './RaceTokenOnMarketAsCard';

const RunnerTokensOnMarket = () => {

    const [tokens, setTokens] = useState([])
    const { address, isConnected } = useAccount();

    const getEvents = async () => {
      
        const ticketOnMarket = await publicClient.getLogs({
            address: contractTicketMarket,
            event: parseAbiItem('event TicketReceivedOnMarket(uint indexed ticketId, uint indexed raceId, uint indexed tokenId, address seller, uint price, uint saleId)'),
            fromBlock: (targetEnv == 'SEPOLIA' ? BigInt(startingBlock) : 0n),
            toBlock: 'latest'
        })

        const filteredSales = Object.values(ticketOnMarket.reduce((sales, event) => {

            if (!sales[event.args.ticketId] || sales[event.args.ticketId].args.saleId < event.args.saleId) {
                sales[event.args.ticketId] = event;
            }
            
            return sales;
        }, {}));


        //console.log(filteredSales);
        setTokens(filteredSales);
    }

    useEffect(() => {
        const getAllEvents = async () => {
            if (address !== 'undefined') {
                await getEvents();
            }
        }
        getAllEvents();
    }, [address])

    return (
        <>
           <Stack spacing='4'>
            {  
                tokens.map((tokenSale) => (
                    <RaceTokenOnMarketAsCard myToken={tokenSale} refetch={getEvents}/>
                ))
             }
           </Stack>
        </>
    );
};



export default RunnerTokensOnMarket;
