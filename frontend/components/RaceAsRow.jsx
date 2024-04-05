
'use client'
import { contractRace, abiRace,  NFTStorageKey} from "@/constants";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useSendTransaction  } from "wagmi"
import { useEffect, useState } from "react";
import { useToast, Tr, Td, Button } from "@chakra-ui/react";
import { encodeFunctionData } from "viem";
import { NFTStorage } from 'nft.storage';


const RaceAsRow = ({ id, isSubscription }) => {

    const { address } = useAccount();
    const [loadingState, setLoadingState] = useState(false)

    const toast = useToast();

    const { data: race } = useReadContract({
        address: contractRace,
        abi: abiRace,
        functionName: 'getRaceById',
        account: address,
        args: [id]
    });

    function updateLoadingState(state) {
        setLoadingState(state);
    }

    const { data: hash, isPending, sendTransaction } = useSendTransaction({
        mutation: {
            onSuccess: () => {
                updateLoadingState(true);
                toast({
                    title: "Inscription en cours",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                });
            },
            onError: (error) => {
                updateLoadingState(false);
                console.log({ error });
                toast({
                    title: "Echec de l'inscription",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            },
        },
    })

    async function registerforRace () {

        const fileLogo = await fetch('./raceTicket.png'); 
        const image = await fileLogo.blob();
         
        const nftRace = {
            image,
            name: 'ETHERUN RACE TICKET',
            description: 'Ticket ETHERUN',
            attributes: {
                raceId: id.toString(),
              }
            };
            console.log(nftRace);
        
        const client = new NFTStorage({ token: NFTStorageKey });
        const nftRaceMetadata = await client.store(nftRace);
        console.log(nftRaceMetadata.url)

        let data = encodeFunctionData({
            abi: abiRace,
            functionName: 'registerRunner',
            args: [id,nftRaceMetadata.url] 
        })
         
         sendTransaction({
            address: contractRace,
            to: contractRace,
            value : race.ticketPrice,
            data
         });
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    useEffect(() => {
        if (isConfirmed) {
           
            updateLoadingState(false);
            toast({
                title: 'Inscription OK !',
                status: "success",
                duration: 5000,
                isClosable: true,
            });

        }
    }, [isConfirmed])


    function formatDate(val) {
        let ts = Number(val);
        let dt = new Date(ts)
        return dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
    }

    return (
        <>
            {race && (
                <Tr >
                    <Td>{race.name}</Td>
                    <Td>{(race.maxTickets).toString()}</Td>
                    <Td>{(race.ticketPrice).toString()}</Td>
                    <Td>{(race.ticketsSoldCount).toString()}</Td>
                    <Td>{formatDate(race.raceDate)}</Td>
                    {isSubscription ? (<Td verticalAlign="middle">
                        {loadingState == true ?
                            <Button size='xs' isLoading
                                loadingText='Validation...'
                                colorScheme='teal' variant='outline'>
                            </Button>
                            :
                            <Button mt={4} size='xs' 
                                colorScheme="red"
                                onClick={registerforRace}>S'inscrire</Button>}
                    </Td>
                    ): null
                    }
                </Tr>
            )
            }
        </>

    );
}

export default RaceAsRow
