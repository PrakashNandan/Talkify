import React, { useState } from 'react'
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react'
import axios from 'axios';
import { set } from 'mongoose';

function Login() {

    const [show, setShow] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);


    const navigate = useNavigate();
    const toast = useToast();

    const handleClick = () => setShow(!show);

    const submitHandler = async() => {  

      setLoading(true);

      
      if(!email || !password){
        return toast({
          title: "warning",
          description: "Please fill all the fields",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        })
      }

      const config = {  
        headers: {
          "content-type": "application/json"
      }
    }

      try{

        const {data} = await axios.post('/api/user/login', {
          email,
          password,
        },  config );


        toast({
          title: "Successfully Logged In",
          description: "You have successfully Logged in to Talkify",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        })


        localStorage.setItem("userInfo", JSON.stringify(data));

        setLoading(false);
        navigate('/chat');
         // Refresh the page after successful login
        window.location.reload();


      }catch(err){
        setLoading(false);
        console.log(err);
        toast({
          title: "Invalid Credintials",
          description: "Or there is some problem while logging in",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        })
      }





    }



  return (
    <VStack spacing="5px" >
  
    <FormControl id="email" isRequired>
      <FormLabel>Email Address</FormLabel>
      <Input
        type="email"
        placeholder="Enter Your Email Address"
        onChange={(e) => setEmail(e.target.value)}
        border={"1px solid black"}
      />
    </FormControl>
    <FormControl id="password" isRequired>
      <FormLabel>Password</FormLabel>
      <InputGroup size="md">
        <Input
          type={show ? "text" : "password"}
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
          border={"1px solid black"}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  
    <Button
      colorScheme="blue"
      width="100%"
      style={{ marginTop: 15 }}
      onClick={submitHandler}
      isLoading={loading}
    >
      Login
    </Button>
  </VStack>
  )
}

export default Login