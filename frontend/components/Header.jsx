"use client"
import { Flex, Text, Image } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import UserProfile from './UserProfile'

const Header = () => {
  return (
   <> <Flex
        justifyContent="space-between"
        alignItems="center"
        p={1}  
       >
      <Image w='35%' src='./etherun.jpg' />
      <UserProfile/>
      <ConnectButton showBalance={false} label="Connect" accountStatus={{smallScreen: 'avatar', largeScreen: 'full',}}/>
    </Flex>
   
   
</>
  )
}

export default Header