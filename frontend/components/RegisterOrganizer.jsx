'use client'
import { Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, HStack, useToast } from '@chakra-ui/react'
import { useAccount, useWaitForTransactionReceipt,useSendTransaction ,} from "wagmi";
import { contractRaceOrganizer, abiRaceOrganizer } from "@/constants";
import { useState, useEffect } from 'react';
import { encodeFunctionData, parseEther } from 'viem';

const RegisterOrganizer = () => {

    const [pseudo, setPseudo] = useState("");
    const toast = useToast();
    const { address } = useAccount();
    const [loadingState, setLoadingState] = useState(false)

    function registerOrganizer() {
        
        let data = encodeFunctionData({
            abi: abiRaceOrganizer,
            functionName: 'registerOrganizer',
            args: [pseudo]
        })
        
        if (pseudo && pseudo != 'undefined') {
           
            sendTransaction({
                address: contractRaceOrganizer,
                to: contractRaceOrganizer,
                value : parseEther('0.03'),
                data
            })
        }
        else {
            toast({
                title: "Veuillez entrer un pseudo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    const { data: hash,  sendTransaction } = useSendTransaction({
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
                    title: "Echec de l'inscription",
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

    const handlePseudoChange = (event) => {
        setPseudo(event.target.value);
    };

    return (
        <>
            <Card align='center' bgColor='white' marginBottom="10" >
                <CardHeader marginBottom="0" p={3}>
                    <Heading size='sm'>Inscription Organisateur **</Heading>
                </CardHeader>
                <CardBody p={2} width="100%" textAlign="center"  >
                    <Text p={3} fontSize='xs' color='tomato' ><b>L'inscription vous coutera 0.03 ETH</b></Text>
                    <HStack spacing='10px' justifyContent="center" >
                        <Text p={3} fontSize='xs' value={pseudo}><b>Pseudo :</b></Text>
                        <Input placeholder='' size='xs' width="40" onChange={handlePseudoChange} />
                    </HStack>

                </CardBody>
                <CardFooter>
                    {loadingState == true ?
                        <Button isLoading
                            loadingText='Validation ...'
                            colorScheme='green' variant='outline'>
                        </Button>
                        :
                        <Button size='sm' colorScheme='green' onClick={registerOrganizer}>S'inscrire</Button>
                    }
                </CardFooter>
            </Card>
            <Card>
                <CardBody bgColor='white'>
                    <Text fontSize='xs' marginBottom={5}>** Vous inscrire vous donne la possibilité de créer des évenenements running et la vente de billets associées.</Text>

                    <Text fontSize='xs'>** A noter que chaque billet vendu au travers de la platforme <b>ETHERUN</b> implique le prélevement de <b>10%</b> de la valeur faciale du billet</Text>
                </CardBody>
            </Card>
        </>
    )
}

export default RegisterOrganizer
