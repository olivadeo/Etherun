'use client';

import { useAccount } from "wagmi";
import { useEtherunContext } from "./context/EtherunContext";

import { Flex, IconButton, SimpleGrid, Button } from "@chakra-ui/react";
import { AiFillHome, AiOutlineSearch, AiOutlinePlus, AiOutlineUser } from "react-icons/ai";
import NextLink from "next/link";
import UserProfile from "@/components/UserProfile";

export default function Home() {

  const { isConnected } = useAccount()
  const { connectedProfile, setConnectedProfile } = useEtherunContext();

  return (
    <>
      {isConnected && connectedProfile == 'UNKNOWN' ? (
        <SimpleGrid columns={1} spacing={10} >
          <NextLink href="/registrationOrganizer">
            <Button width="100%" p={20} colorScheme="green">S'inscrire en tant qu'organisateur</Button>
          </NextLink>
          <NextLink href="/registrationRunner">
            <Button width="100%" p={20} colorScheme="green">S'inscrire en tant que runner</Button>
          </NextLink>
        </SimpleGrid>
      ) : null}

      {isConnected && connectedProfile == 'RUNNER' ? (
        <SimpleGrid columns={1} spacing={10} >

          <NextLink href="/runnerTokens">
            <Button width="100%" p={20} colorScheme="green">Mes tickets</Button>
          </NextLink>
          <NextLink href="/runnerRaceRegistering">
            <Button width="100%" p={20} colorScheme="green">S'inscrire à une course</Button>
          </NextLink>
          <NextLink href="/runnersTokensSale">
            <Button width="100%" p={20} colorScheme="blue">Market : Acheter des tickets </Button>
          </NextLink>

        </SimpleGrid>
      ) : null}

      {isConnected && connectedProfile == 'OWNER' ? (
        <SimpleGrid columns={1} spacing={10} >
          <NextLink href="/validateAccounts">
            <Button width="100%" p={20} colorScheme="green">Valider les comptes en attente</Button>
          </NextLink>
        </SimpleGrid>
      ) : null}

      {isConnected && connectedProfile == 'ORGANIZER' ? (
        <SimpleGrid columns={1} spacing={10} >
          <NextLink href="/createCourse">
            <Button width="100%" p={20} colorScheme="green">Creer une course</Button>
          </NextLink>
         
        </SimpleGrid>
      ) : null} 
    </>
  );
}