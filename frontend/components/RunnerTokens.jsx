'use client'
import { useState, useEffect } from 'react';
import { Stack,Table, TableContainer, Tr, Th, Td, Thead, Tbody, Tfoot, Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, HStack, useToast } from '@chakra-ui/react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractRace, abiRace, contractTicketMarket } from "@/constants";
import { encodeFunctionData, parseEther } from 'viem';
import { PublicActions } from 'viem';
import { publicClient } from "@/app/utils/clients";
import { parseAbiItem } from 'viem';
import { targetEnv, startingBlock } from "@/app/RainbowKitAndChakraProvider";
import RaceTokenAsCard from './RaceTokenAsCard';

const RunnerTokens = () => {

    const [tokens, setTokens] = useState([])
    const { address, isConnected } = useAccount();

    const getEvents = async () => {
        const RaceRegistrationEvents = await publicClient.getLogs({
            address: contractRace,
            event: parseAbiItem('event RunnerRegisteredOnRace(address indexed runner, uint indexed raceId, uint ticketId, uint tokenId)'),
            fromBlock: (targetEnv == 'SEPOLIA' ? BigInt(startingBlock) : 0n),
            toBlock: 'latest'
        })
        console.log(RaceRegistrationEvents);
        setTokens(RaceRegistrationEvents);

        /*
        const OnRec = await publicClient.getLogs({
            address: contractTicketMarket,
            event: parseAbiItem('event TicketReceivedOnMarket(uint indexed ticketId, uint indexed raceId, uint indexed tokenId, address seller, uint price)'),
            fromBlock: (targetEnv == 'SEPOLIA' ? BigInt(startingBlock) : 0n),
            toBlock: 'latest'
        })
        console.log(OnRec);*/

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
                tokens.map((raceToken) => (
                    <RaceTokenAsCard myToken={raceToken} refetch={getEvents}/>
                ))
             }
           </Stack>
        </>
    );
};



export default RunnerTokens;
