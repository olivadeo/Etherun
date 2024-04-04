'use client'
import { Card, CardHeader, CardBody, Heading, Text } from '@chakra-ui/react'
import { useAccount } from "wagmi";;
import { useEtherunContext } from "@/app/context/EtherunContext";
import RaceList from './RacesList'

const RunnerRaceRegistering = () => {

    const { connectedProfile, setConnectedProfile } = useEtherunContext();
    const { address, isConnected } = useAccount();

    return (
        <>
            {connectedProfile == "RUNNER" && isConnected ?
                <>
                    <Card align="center" bgColor="white" marginBottom="10" >
                        <CardHeader marginBottom="0" p={3}>
                            <Heading size='sm'>S'inscrire à une course</Heading>
                        </CardHeader>
                        <CardBody p={2} width="100%" textAlign="center"  >
                            <RaceList isSubscription={true} />
                        </CardBody>
                    </Card>
                </>
                :
                <Card>
                    <CardBody bgColor='white'>
                        <Text fontSize='xs' marginBottom={5}>Impossible d'afficher la page. Vous n'êtes pas Runner :-), soit non connecté</Text>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default RunnerRaceRegistering
