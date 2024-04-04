"use client"
import { Flex,IconButton } from '@chakra-ui/react'
import { AiFillHome, AiOutlineSearch, AiOutlinePlus, AiOutlineUser } from "react-icons/ai";
import NextLink from "next/link";

const Footer = () => {
  return (

    <Flex
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="gray.100"
      borderTop="1px solid"
      borderColor="gray.200"
      justifyContent="space-around"
      padding="2"
    >
      <NextLink href="/" passHref>
        <IconButton icon={<AiFillHome />} aria-label="Accueil" />
      </NextLink>
    
    </Flex>



  )
}

export default Footer