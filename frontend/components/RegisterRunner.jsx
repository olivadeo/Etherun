'use client'
import { Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, VStack, useToast, Box, Alert, AlertIcon, AlertDescription, AlertTitle } from '@chakra-ui/react'
import { useAccount, useWaitForTransactionReceipt, useSendTransaction } from "wagmi";
import { contractRunners, abiRunners } from "@/constants";
import { useState, useEffect } from 'react';
import { encodeFunctionData, parseEther } from 'viem';
import { useEtherunContext } from "@/app/context/EtherunContext";


const RegisterRunner = () => {

    const { connectedProfile, setConnectedProfile } = useEtherunContext();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");

    const toast = useToast();
    const { address, isConnected } = useAccount();
    const [loadingState, setLoadingState] = useState(false)

    function registerTheRunner() {

        if (isErrorAge || isErrorFirstName || isErrorLasttName) {
            toast({
                title: "informations manquantes ...",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        console.log("firstname : " + firstName);
        console.log("lastname : " + lastName);
        console.log("age : " + age);
     
        let data = encodeFunctionData({
            abi: abiRunners,
            functionName: 'registerRunner',
            args: [firstName, lastName, age]
        })

        sendTransaction({
            address: contractRunners,
            to: contractRunners,
            value: parseEther('0.01'),
            data
        })
    }

    const { data: hash, sendTransaction } = useSendTransaction({
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
                    title: "error.cause.reason",
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
                title: 'Inscription organisateur : SUCCESS',
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [isConfirmed])

    const isErrorFirstName = (firstName === '')
    const isErrorLasttName = (lastName === '')
    const isErrorAge = (age === '')

    const handleFirstNameChange = (e) => setFirstName(e.target.value)
    const handleLastNameChange = (e) => setLastName(e.target.value)

    const handleAgeChange = (e) => {
        if (!isNaN(e.target.value)) {
            setAge(e.target.value);
        }
        else setAge('');
    }

    return (
        <>
            {connectedProfile != "RUNNER" && isConnected ?
                <>
                    <Card align="center" bgColor="white" marginBottom="10" >
                        <CardHeader marginBottom="0" p={3}>
                            <Heading size='sm'>Inscription Runner **</Heading>
                        </CardHeader>
                        <CardBody p={2} width="100%" textAlign="center"  >
                            <Text p={3} fontSize='xs' color='tomato' ><b>L'inscription vous coutera 0.01 ETH</b></Text>

                            <VStack spacing='20px' justifyContent="center" >
                                <Input isInvalid={isErrorFirstName} placeholder='Prénom' size='xs' width="100" value={firstName} onChange={handleFirstNameChange} />
                                <Input isInvalid={isErrorLasttName} placeholder='Nom' size='xs' width="50" value={lastName} onChange={handleLastNameChange} />
                                <Input isInvalid={isErrorAge} placeholder='Age' size='xs' width="50" value={age} onChange={handleAgeChange} />
                                <Text fontSize='xs' marginBottom={1}>* Vous pourrez uploader votre certificat médical d'aptitude un fois inscrit *</Text>

                            </VStack>
                        </CardBody>
                        <CardFooter>
                            {loadingState == true ?
                                <Button isLoading
                                    loadingText='Validation ...'
                                    colorScheme='green' variant='outline'>
                                </Button>
                                :
                                <Button size='sm' colorScheme='green' onClick={registerTheRunner}>S'inscrire</Button>
                            }
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardBody bgColor='white'>
                            <Text fontSize='xs' marginBottom={5}>** Vous inscrire vous donne la possibilité de participer des évenenements running</Text>

                            <Text fontSize='xs'>** A noter que chaque billet acheté au travers de la platforme <b>ETHERUN</b> peut être remis en vente via la place de marché de la plateforme, et ce de manière sécurisée</Text>
                        </CardBody>
                    </Card>
                </>
                :
                <Card>
                    <CardBody bgColor='white'>
                        <Text fontSize='xs' marginBottom={5}>Impossible d'afficher la page. Vous êtes, soit déja Runner :-), soit non connecté</Text>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default RegisterRunner
