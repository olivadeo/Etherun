
'use client'
import { contractRace, abiRace, NFTStorageKey } from "@/constants";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useSendTransaction } from "wagmi"
import { useEffect, useState } from "react";
import { useToast, Tr, Td, Button, Card, Image, CardBody, Stack, Heading, CardFooter, Text, SimpleGrid, Box } from "@chakra-ui/react";
import { encodeFunctionData, formatEther } from "viem";
import { NFTStorage } from 'nft.storage';



const RaceAsCard = ({ id }) => {

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
        console.log('update_loading state ' + state)
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
                    title: error.cause.reason,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            },
        },
    })

    async function registerforRace() {

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
        console.log(nftRaceMetadata)
        console.log(nftRaceMetadata.url)

        let data = encodeFunctionData({
            abi: abiRace,
            functionName: 'registerRunner',
            args: [id, nftRaceMetadata.url]
        })

        sendTransaction({
            address: contractRace,
            to: contractRace,
            value: race.ticketPrice,
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
                <Card
                    direction={{ base: 'column', sm: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >

                    <Stack width="100%">
                        <CardBody >
                            <Heading size='sm'>{race.name}</Heading>

                            <SimpleGrid minChildWidth='90px' spacing='5px' alignItems="center" justifyContent="center">
                                <Box >    <Image margin="auto"
                                    objectFit='cover'
                                    width="50px"
                                    height="50px"
                                    src='./logo-course.jpeg'

                                /></Box>
                                <Box><Text fontSize='sm'> <b>Places :</b> {(race.maxTickets).toString()} </Text></Box>
                                <Box><Text fontSize='sm'> <b>Prix :</b> {formatEther((race.ticketPrice).toString())} </Text></Box>
                                <Box><Text fontSize='sm'> <b>Tickets vendus:</b> {(race.ticketsSoldCount).toString()} </Text></Box>
                                <Box> <Text fontSize='sm'> <b>Date :</b> {formatDate((race.raceDate).toString())} </Text></Box>
                                <Box> {loadingState ?
                                    <Button size='xs' isLoading
                                        loadingText='Validation...'
                                        colorScheme='teal' variant='outline'>
                                    </Button>
                                    :
                                    <Button mt={4} size='sm' margin="auto"
                                        colorScheme="red"
                                        onClick={registerforRace}>S'inscrire</Button>
                                }</Box>
                            </SimpleGrid>

                        </CardBody>

                    </Stack>
                </Card>


            )
            }
        </>

    );
}

export default RaceAsCard
