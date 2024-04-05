'use client'
import { useState, useEffect } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { contractTicketMarket, abiTicketMarket } from "@/constants";
import {
  useToast, Br, Center, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input, Stack, FormControl, FormLabel,
} from "@chakra-ui/react";
import { encodeFunctionData,formatEther, parseEther } from "viem";

const BuyTicketOnMarketModal = ({ refetch, ticketId, price, seller }) => {

  const [isModalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const { address } = useAccount();
  const [loadingState, setLoadingState] = useState(false)

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleBuyTicket = () => {
    buyTicket();
    handleModalClose();
  };

  function updateLoadingState(state) {
    setLoadingState(state);
  }

  const { data: hash, sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Achat du ticket : IN PROGRESS",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        updateLoadingState(true);
        refetch()
      },
      onError: (error) => {
        updateLoadingState(false);
        toast({
          title: "Echec de l'achat du ticket",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    },
  })

  function buyTicket() {

    let data = encodeFunctionData({
      abi: abiTicketMarket,
      functionName: 'buyTicket',
      args: [ticketId]
    })

    sendTransaction({
      address: contractTicketMarket,
      to: contractTicketMarket,
      value: price,
      data
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
        title: 'Achat du ticket : SUCCESS',
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
          <Button mt={4} p={4} size='xs' width="200px" align='center' colorScheme="blue" onClick={handleModalOpen}>ACHETER</Button>
        }
      </center></div>
      <Stack spacing={4} p={4}>
        <Modal isOpen={isModalOpen} onClose={handleModalClose}  >
          <ModalOverlay />
          <ModalContent >
            <ModalHeader fontSize='xsms' textAlign="center">Ticket : {ticketId.toString()}</ModalHeader>
            <ModalCloseButton />
            <ModalBody alignContent="align-center" >
              <Center>
                <Text p={5} fontSize='md' color="red">Prix d'achat : <b>{formatEther(price.toString())} ETH </b> </Text>
              </Center>

              <Center> <Button mt={1} size='md' colorScheme="blue" onClick={handleBuyTicket}>
                Valider l'achat
              </Button></Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>

    </>
  )
}

export default BuyTicketOnMarketModal


