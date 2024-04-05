'use client'
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractRace, abiRace } from "@/constants";
import {
  useToast, Center,Text,Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input, Stack
} from "@chakra-ui/react";
import { parseEther } from "viem";

const SaleTicketModal = ({ refetch, ticketId, raceId, tokenId, ownedByMarket }) => {

  const [isModalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const toast = useToast();
  const { address } = useAccount();
  const [loadingState, setLoadingState] = useState(false)

  const isErrorPrice = (price === '')

  const handlePrice = (e) => {
    if (!isNaN(e.target.value)) {
      setPrice(e.target.value);
    }
    else setPrice('');
  }

  const handleModalOpen = () => {
    setPrice('');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleSaleTicket = () => {
    if (price) {
      saleTicket();
      handleModalClose();
    }
  };

  function updateLoadingState(state) {
    setLoadingState(state);
  }

  const { data: hash, isPending, writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Mise en vente du ticket : IN PROGRESS",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        updateLoadingState(true);
      },
      onError: (error) => {
        console.log({ error });
        updateLoadingState(false);
        toast({
          title: "Echec de mise en vente du ticket",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    },
  })


  function saleTicket() {
    writeContract({
      address: contractRace,
      abi: abiRace,
      functionName: 'putTicketOnMarketForSale',
      account: address,
     //args: [ticketId,raceId,tokenId,parseEther(price)]
      args: [ticketId,tokenId,parseEther(price)]
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed) {
      const getAllEvents = async () => {
        await refetch(); 
      }
      getAllEvents();

      updateLoadingState(false);
      toast({
        title: 'Mise en vente du ticket : SUCCESS',
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConfirmed])


  return (
    <>

      <div width='100%'><center>
        {loadingState == true ?
          <Button isLoading
            loadingText='Validating transaction'
            colorScheme='teal' variant='outline'>
          </Button>
          :
          <Button mt={4} p={4} size='xs' width="200px" align='center' colorScheme="red" onClick={handleModalOpen}>Mettre en vente</Button>
        }
      </center></div>
      <Stack spacing={4} p={4}>
        <Modal isOpen={isModalOpen} onClose={handleModalClose}  >
          <ModalOverlay />
          <ModalContent >
            <ModalHeader fontSize='xs' textAlign="center">Mettre en vente le ticket : {ticketId.toString()} pour la course : {raceId.toString()}</ModalHeader>
            <ModalCloseButton />
            <ModalBody alignContent="align-center">
            <Center>
                <Text p={3} fontSize='xs'>Prix de vente (ETH) &nbsp;   
                <Input type="text"fontSize='xs' size='xs' width="20" isInvalid={isErrorPrice}  value={price} onChange={handlePrice}  />
                </Text>
              </Center>
              <Center> <Button mt={1} size='sm' colorScheme="blue"  onClick={handleSaleTicket}>
                Valider
              </Button></Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>

    </>
  )
}

export default SaleTicketModal


