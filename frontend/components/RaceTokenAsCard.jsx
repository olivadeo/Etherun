
'use client'
import { contractRace, abiRace, contractTicketMarket, abiTicketMarket } from "@/constants";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi"
import { useEffect, useState } from "react";
import { useToast, Card, CardHeader, Heading, CardBody, Text, Button} from "@chakra-ui/react";
import SaleTicketModal from "./SaleTicketModal";


const RaceTokenAsCard = ({ myToken, refetch }) => {

    const { address } = useAccount();

    const { data: ownerOfToken } = useReadContract({
        address: contractRace,
        abi: abiRace,
        functionName: 'ownerOf',
        account: address,
        args: [myToken.args.tokenId]
    });
    console.log("owner  "+ownerOfToken)
   

    const { data: ticketSeller } = useReadContract({
        address: contractTicketMarket,
        abi: abiTicketMarket,
        functionName: 'getTicketOnSaleSeller',
        account: address,
        args: [myToken.args.ticketId]
    });
    console.log("seller  "+ticketSeller)
    
    return (
        <>
            {(ownerOfToken == address || (ticketSeller && ticketSeller == address )) && (
                <Card key={myToken.args.ticketId} size='xs'>
                    <CardHeader p={3}>
                        <Heading size='xs'> Course ID : {(myToken.args.raceId).toString()} Ticket ID : {(myToken.args.ticketId).toString()} </Heading>
                    </CardHeader>
                    <CardBody p={3} align='center'>
                       <Text p={1} fontSize='xs'><b>NFT Token ID :</b> {(myToken.args.tokenId).toString()}</Text>
                       <Text p={1} fontSize='xs'><b>Délivré par :</b> {(myToken.address).toString()}</Text>
                       <Text p={1} fontSize='xs'><b>Owner :</b> {ownerOfToken.toString()}</Text>
                    
                       {ownerOfToken !=address  ? 
                       <Text p={1} fontSize='xs' color = 'red'><b>EN VENTE sur le marché ETHERUN</b></Text>
                       :

                        <SaleTicketModal    refetch={refetch} 
                                            ticketId={myToken.args.ticketId} 
                                            raceId={myToken.args.raceId} 
                                            tokenId={myToken.args.tokenId} />
                       }
                    </CardBody>
                   
                </Card>
            )
            }
        </>

    );
}

export default RaceTokenAsCard
