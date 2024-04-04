'use client'
import { Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, VStack, useToast } from '@chakra-ui/react'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { contractRace, abiRace } from "@/constants";
import { useState, useEffect } from 'react';
import {  parseEther } from 'viem';
import { useEtherunContext } from "@/app/context/EtherunContext";


const CreateCourse = () => {

    const { connectedProfile, setConnectedProfile } = useEtherunContext();

    const [courseName, setCourseName] = useState("");
    const [coursePrice, setCoursePrice] = useState("");
    const [courseMaxTickets, setCourseMaxTickets] = useState("");
    const [courseDate, setCourseDate] = useState("");

    const toast = useToast();
    const { address, isConnected } = useAccount();
    const [loadingState, setLoadingState] = useState(false)

 
    function createCourse() {

        if (isErrorCourseName || isErrorMaxTickets || isErrorPriceTicket || isErrorCourseDate) {
            toast({
                title: "informations manquantes ...",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        writeContract({
            address: contractRace,
            abi: abiRace,
            functionName: 'createRace',
            account: address,
            args :[courseName, courseMaxTickets, parseEther(coursePrice),address,'',Date.parse(courseDate) ]
          })

    }

    const { data: hash, writeContract } = useWriteContract({
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
                title: 'Creation de la course: SUCCESS',
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [isConfirmed])

    const isErrorCourseName = (courseName === '')
    const isErrorMaxTickets = (courseMaxTickets === '' || courseMaxTickets <=0)
    const isErrorPriceTicket = (coursePrice === ''  )
    const isErrorCourseDate = (courseDate === '')

    const handleCourseName = (e) => setCourseName(e.target.value)
    const handleCourseDate = (e) => setCourseDate(e.target.value)

    const handleMaxTicket = (e) => {
        if (!isNaN(e.target.value)) {
            setCourseMaxTickets(e.target.value);
        }
        else setCourseMaxTickets('');
    }

    const handlePrice = (e) => {
        if (!isNaN(e.target.value)) {
            setCoursePrice(e.target.value);
        }
        else setCoursePrice('');
    }

    return (
        <>
            {connectedProfile == "ORGANIZER" && isConnected ?
                <>
                    <Card align="center" bgColor="white" marginBottom="10" >
                        <CardHeader marginBottom="0" p={3}>
                            <Heading size='sm'>Créer une course</Heading>
                        </CardHeader>
                        <CardBody p={2} width="100%" textAlign="center"  >

                            <VStack spacing='20px' justifyContent="center" >
                                <Input isInvalid={isErrorCourseName} placeholder='Nom de la course' size='xs' width="40%" value={courseName} onChange={handleCourseName} />
                                <Input isInvalid={isErrorPriceTicket} placeholder='prix du ticket' size='xs' width="50" value={coursePrice} onChange={handlePrice} />
                                <Input isInvalid={isErrorMaxTickets} placeholder='nombre max de tickets' size='xs' width="50" value={courseMaxTickets} onChange={handleMaxTicket} />
                                <Input isInvalid={isErrorCourseDate} size='sm' width="50" type="date"   onChange={handleCourseDate} />
                            </VStack> 
                        </CardBody>
                        <CardFooter>
                            {loadingState == true ?
                                <Button isLoading
                                    loadingText='Validation ...'
                                    colorScheme='green' variant='outline'>
                                </Button>
                                :
                                <Button size='sm' colorScheme='green' onClick={createCourse}>Créer la course</Button>
                            }
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardBody bgColor='white'>

                            <Text fontSize='xs' color={'tomato'}>Attention dans cette version Beta de la palteforme, toute création est irréversible</Text>
                        </CardBody>
                    </Card>
                </>
                :
                <Card>
                    <CardBody bgColor='white'>
                        <Text fontSize='xs' marginBottom={5}>Impossible d'afficher la page. Vous n'êtes par orgnaisateur, soit non connecté</Text>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default CreateCourse
