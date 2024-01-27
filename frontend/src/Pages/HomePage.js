import React, { useEffect } from 'react'
import { Box, Center, Container, Text } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Login from '../Components/Authentication/Login'
import Signup from '../Components/Authentication/Signup'
import { useNavigate } from 'react-router-dom'




function HomePage() {


  const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('userInfo'));

       if(user){
        navigate('/chat');
       }

    }, [navigate]);



  return (
    <Container maxW="xl" centerContent>
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        p={2}
        bg={'white'}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="10px"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Text fontSize="4xl" fontFamily="Lilita One" color="black"  textAlign='center' >Talkify</Text>
      </Box>
      <Box bg="white" w={"100%"} p={4} borderRadius={"lg"} color={"black"} borderWidth={"1px"}  backgroundColor={"#F7FAFC"} >
       
          <Tabs variant='soft-rounded'  >
            <TabList>
              <Tab width={"50%"}>Login</Tab>
              <Tab width={"50%"}>Sign-up</Tab>
            </TabList>
           
            <TabPanels >
              <TabPanel>
               <Login></Login>
              </TabPanel>
              <TabPanel >
               <Signup></Signup>
              </TabPanel>
            </TabPanels>
          </Tabs>

      </Box>
    </Container>
  )
}

export default HomePage