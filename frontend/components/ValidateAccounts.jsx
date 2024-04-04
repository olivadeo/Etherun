'use client'
import { Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, useToast } from '@chakra-ui/react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { abiRunners, contractRunners } from "@/constants";
import { useState, useEffect } from 'react';
import { useEtherunContext } from "@/app/context/EtherunContext";

const ValidateAccounts = () => {

    const toast = useToast();
    const { address, isConnected } = useAccount();
    const [loadingState, setLoadingState] = useState(false)
    const { connectedProfile, setConnectedProfile } = useEtherunContext();

    function bulkValidate() {
        writeContract({
            address: contractRunners,
            abi: abiRunners,
            functionName: 'validatePendingMedicalCertificates',
            account: address
          })

    }

    const { data: hash, isPending, writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                toast({
                    title: "Validation en cours",
                    status: "info",
                    duration: 5000,
                    isClosable: true,
                });
                setLoadingState(true);
            },
            onError: (error) => {
                console.log({ error });
                setLoadingState(false);
                toast({
                    title: error.cause.reason,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            },
        },
    })

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    useEffect(() => {
        if (isConfirmed) {
            setLoadingState(false);
            toast({
                title: 'Validation des comptes : SUCCESS',
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [isConfirmed])


    return (
        <>
            {connectedProfile == "OWNER" && isConnected ?
                <>
                    <Card align='center' bgColor='white' marginBottom="10" >
                        <CardHeader marginBottom="0" p={3}>
                            <Heading size='sm'>Validation des comptes "Runner" en attente</Heading>
                        </CardHeader>
                        <CardBody p={2} width="100%" textAlign="center"  >
                            <Text p={3} fontSize='xs' color='tomato' >Le lancement de l'operation va valider en masse les certificats médicaux fournis par les inscrits. Cela activera de fait leur compte sur <b>ETHERUN</b></Text>
                        </CardBody>
                        <CardFooter>
                            {loadingState == true ?
                                <Button isLoading
                                    loadingText='Validation ...'
                                    colorScheme='red' variant='outline'>
                                </Button>
                                :
                                <Button size='sm' colorScheme='red' onClick={bulkValidate}>Valider les inscriptions</Button>
                            }
                        </CardFooter>
                    </Card>
                </>
                :
                <Card>
                    <CardBody bgColor='white'>
                        <Text fontSize='xs' marginBottom={5}>Impossible d'afficher la page. Vous n'êtes pas Administrateur, soit non connecté</Text>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default ValidateAccounts
