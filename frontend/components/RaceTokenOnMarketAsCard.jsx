
'use client'
import { contractTicketMarket, abiTicketMarket } from "@/constants";
import { useAccount, useReadContract } from "wagmi"
import { Card, CardHeader, Heading, CardBody, Text} from "@chakra-ui/react";
import BuyTicketOnMarketModal from "./BuyTicketOnMarketModal";
import { formatEther } from "viem";


const RaceTokenOnMarketAsCard = ({ myToken, refetch }) => {

    const { address } = useAccount();

    const { data: ticketSeller } = useReadContract({
        address: contractTicketMarket,
        abi: abiTicketMarket,
        functionName: 'getTicketOnSaleSeller',
        account: address,
        args: [myToken.args.ticketId]
    });

    //console.log("seller:"+ticketSeller+" ticket Id "+myToken.args.ticketId);
    return (
        <>
            {ticketSeller && (
                <Card key={myToken.args.ticketId} size='xs'>
                    <CardHeader p={3}>
                        <Heading size='xs'> Course ID : {(myToken.args.raceId).toString()} Ticket ID : {(myToken.args.ticketId).toString()} </Heading>
                    </CardHeader>
                    <CardBody p={3} align='center'>
                       <Text p={1} fontSize='xs'><b>NFT :</b> {(myToken.args.tokenId).toString()}</Text>
                       <Text p={1} fontSize='xs'><b>Vendeur :</b> {(myToken.args.seller).toString()}</Text>
                       <Text p={1} fontSize='xs'><b>PRIX de vente :</b> {formatEther((myToken.args.price).toString())}</Text>
                    
                       
                        <BuyTicketOnMarketModal refetch={refetch} 
                                                ticketId={myToken.args.ticketId} 
                                                price={myToken.args.price} 
                                                seller={myToken.args.seller} />
                    </CardBody>
                   
                </Card>
            )
            }
        </>

    );
}

export default RaceTokenOnMarketAsCard
