'use client'
import { Link, Card, CardHeader, CardBody, CardFooter, Heading, Text, Button, Input, VStack, useToast, Box, Alert, AlertIcon, AlertDescription, AlertTitle } from '@chakra-ui/react'
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { contractRunners, abiRunners, NFTStorageKey } from "@/constants";
import { useState, useEffect } from 'react';
import { NFTStorage } from 'nft.storage';
import { useEtherunContext } from "@/app/context/EtherunContext";
import { ExternalLinkIcon } from '@chakra-ui/icons'

const RunnerMedicCertificate = () => {

    const { connectedProfile, setConnectedProfile } = useEtherunContext();
    const [selectedFile, setSelectedFile] = useState(null);
    const [certifIpfs, setCertifIpfs] = useState("");
    const { address, isConnected } = useAccount();
    const [loadingState, setLoadingState] = useState(false)

    const toast = useToast();

    const uploadCertificate = async () => {

        if (isErrorCertif) {
            toast({
                title: "Veuillez sélectionner un certificat médical ...",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const client = new NFTStorage({ token: NFTStorageKey });
        const fileMetadata = await client.storeBlob(selectedFile);
        setCertifIpfs ("ipfs://"+fileMetadata);
        console.log("lien IPFS certif "+fileMetadata)

        const fileLogo = await fetch('./medic-proof.png'); 
        const image = await fileLogo.blob();
         
        const nftMedic = {
            image,
            name: 'RUNNER MEDICAL PROOF',
            description: 'Certificat medical',
            attributes: {
                type: "Medical-proof",
                ipfs: "ipfs://"+fileMetadata
              }
            };
            console.log(nftMedic);

        const nftMedicMetadata = await client.store(nftMedic);
        console.log(nftMedicMetadata)
        console.log(nftMedicMetadata.url)
     
        writeContract({
            address: contractRunners,
            abi: abiRunners,
            functionName: 'setMedicalCertificate',
            account: address,
            args :[address, fileMetadata, nftMedicMetadata.url]
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
                title: 'Upload du certificat médical : SUCCESS',
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [isConfirmed])


    const isErrorCertif = (selectedFile === '')

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    return (
        <>
            {connectedProfile == "RUNNER" && isConnected ?
                <>
                    <Card align="center" bgColor="white" marginBottom="10" >
                        <CardHeader marginBottom="0" p={3}>
                            <Heading size='sm'>Upload de votre certificat médical</Heading>
                        </CardHeader>
                        <CardBody p={2} width="100%" textAlign="center"  >

                            <VStack spacing='20px' justifyContent="center" >
                                <Box>
                                    <Input isInvalid={isErrorCertif} type="file" id="medicCert" onChange={handleFileChange} position="absolute" opacity="0" cursor="pointer" zIndex="2" />
                                  
                                     <Button size='sm' fontSize='xs' zIndex="1" colorScheme='yellow' onClick={() => document.getElementById("medicCert").click()}>Sélectionnez un fichier</Button>
                                    {selectedFile && (
                                        <Text fontSize='xs' mt={2}>Certificat sélectionné : <b>{selectedFile.name}</b></Text>
                                    )}

                                </Box>
                                {certifIpfs && (
                                    <Box>
                                        <Link fontSize='sm' color='teal.500' href={certifIpfs}>
                                            Lien IPFS du certificat uploadé <ExternalLinkIcon mx='2px' />
                                        </Link>
                                    </Box>
                                )}

                            </VStack>
                        </CardBody>
                        <CardFooter>
                            {loadingState == true ?
                                <Button isLoading
                                    loadingText='Validation ...'
                                    colorScheme='green' variant='outline'>
                                </Button>
                                :
                                <Button size='sm' colorScheme='green' onClick={uploadCertificate}>Upload</Button>
                            }
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardBody bgColor='white'>
                            <Text fontSize='xs' marginBottom={5}>Les organisateurs d'évenements, ainsi que <b>ETHERUN</b> ne sont pas responsables de la validité des documents
                                que vous uploadez ici. Vous avez l'unique responsabilité de fournir un certificat médical valide, délivré par un médecin.</Text>
                            <Text fontSize='xs' marginBottom={5}>Une fois uploadé, votre certificat fera l'objet d'une vérification par un administrateur, qui activera votre compte</Text>
                            <Text fontSize='xs' color='tomato' marginBottom={5}><b>Attention</b> : Tout nouvel upload verra votre compte suspendu en attente de sa validation par un administrateur</Text>
                       </CardBody>
                    </Card>
                </>
                :
                <Card>
                    <CardBody bgColor='white'>
                        <Text fontSize='xs' marginBottom={5}>Impossible d'afficher la page. Vous êtes pas Runner :-), soit non connecté</Text>
                    </CardBody>
                </Card>
            }
        </>
    )
}

export default RunnerMedicCertificate
