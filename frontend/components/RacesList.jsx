'use client'
import { useState, useEffect } from 'react';
import { Table, TableContainer, Tr, Th, Td, Thead, Tbody, Tfoot, Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, HStack, useToast } from '@chakra-ui/react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractRace, abiRace } from "@/constants";
import { encodeFunctionData, parseEther } from 'viem';
import { PublicActions } from 'viem';
import { publicClient } from "@/app/utils/clients";
import { parseAbiItem } from 'viem';
import { targetEnv, startingBlock } from "@/app/RainbowKitAndChakraProvider";

import RaceAsCard from './RaceAsCard';

const RacesList = ({ isSubscription }) => {

    const [raceIds, setRaceIds] = useState([])
    const { address, isConnected } = useAccount();

    const getEvents = async () => {
        const courseCreatedEvents = await publicClient.getLogs({
            address: contractRace,
            event: parseAbiItem('event RaceCreated(uint indexed raceId, uint maxTickets, uint ticketPrice)'),
            fromBlock: (targetEnv == 'SEPOLIA' ? BigInt(startingBlock) : 0n),
            toBlock: 'latest'
        })
        console.log(courseCreatedEvents);
        console.log(courseCreatedEvents.map((race) => race.args.raceId));
        setRaceIds(courseCreatedEvents.map((race) => race.args.raceId));
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
          {raceIds.length > 0 ?
                            raceIds.map((raceId, raceMapId) => (
                                <RaceAsCard id={raceId}/>

                            ))
                            : null
                        }
   
        </>
    );
};



export default RacesList;
