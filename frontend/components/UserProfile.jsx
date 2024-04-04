import { useAccount, useReadContract } from "wagmi";
import { useEffect } from "react";
import { Badge, HStack,Text,Center } from "@chakra-ui/react";
import { contractRace, contractRaceOrganizer, contractRunners, abiRace, abiRunners, abiRaceOrganizer } from "@/constants";
import { useEtherunContext } from "@/app/context/EtherunContext";
import { BsFileMedical } from "react-icons/bs";
import NextLink from "next/link";


const UserProfile = () => {

    const { address, isConnected } = useAccount();
    const { connectedProfile, setConnectedProfile } = useEtherunContext();

    let profile = 'UNKNOWN'
    const { data: ownerAddress} = useReadContract({
        address: contractRace,
        abi: abiRace,
        functionName: 'owner',
        account: address
    })
  
    console.log(ownerAddress + ' ' + address)

    const { data: organizer} = useReadContract({
        address: contractRaceOrganizer,
        abi: abiRaceOrganizer,
        functionName: 'getOrganizerById',
        args: [address],
        account: address
    })
    console.log(organizer)

    const { data: runner } = useReadContract({
        address: contractRunners,
        abi: abiRunners,
        functionName: 'getRunnerById',
        args: [address],
        account: address
    })
    console.log(runner)

    if (ownerAddress == address) profile = 'OWNER'
    else if (organizer && organizer.name) profile = 'ORGANIZER'
    else if (runner && runner.firstName) profile = 'RUNNER'

    useEffect(() => {
        setConnectedProfile(profile)
    }, [profile])

    console.log(profile)

    return (
        <>
            {connectedProfile != 'UNKNOWN' && isConnected ?
                <HStack>
                    <Badge colorScheme='green'>{connectedProfile}</Badge>
                    {connectedProfile == 'RUNNER' ? 
                    
                        <NextLink href="/runnerMedicCertificate" passHref >
                            <Center><BsFileMedical color="red" size="30" /> 
                            <Text fontSize="xs" color="red">Certificat</Text>
                            </Center>
                        </NextLink>
                        : null}
                </HStack>
                :
                null}
        </>

    )
}

export default UserProfile
