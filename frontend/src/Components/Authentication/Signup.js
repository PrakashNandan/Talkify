import React, { useState } from 'react'
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { set } from 'mongoose';
import { useToast } from '@chakra-ui/react'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
// import { use } from '../../../../backend/routes/userRoutes';


function Signup() {

    const [show, setShow] = useState(false);

  
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [picLoading, setPicLoading] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();
 


    const postDetails = (pics) => {
      setPicLoading(true);
      console.log('Post details function called with:', pics);


      if(pics === undefined){
        return toast({
          title: "warning",
          description: "Please select an image",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        })
        
      }


      if(pics.type === "image/jpeg" || pics.type === "image/png" || pics.type === "image/jpg"){

            const data = new FormData();

            data.append("file", pics);
            data.append("upload_preset", "chat-app" ); 
            data.append("cloud_name", "dws221ke9" );

            fetch("https://api.cloudinary.com/v1_1/dws221ke9/image/upload", {
              method: "post",
              body: data
              }).then(res => res.json())
              .then(data => {
                console.log(data);
                setPic(data.url.toString());
                setPicLoading(false);
              })
             .catch((err) => {
              console.log(err);
              setPicLoading(false);
             })


      }
      else{
        return toast({
          title: "warning",
          description: "Please select an image of either JPEG, PNG or JPG format",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right"
        })
      
      }

    }

    const handleClick = () => setShow(!show);

    const submitHandler = async() => {  

        setPicLoading(true);

        if(!email || !password || !name || !confirmpassword){
          return toast({
            title: "warning",
            description: "Please fill all the fields",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top-right"
          })
        }

        if(password !== confirmpassword){
          return toast({
            title: "warning",
            description: "Passwords do not match",
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

          const {data} = await axios.post('http://localhost:5000/api/user', {
            name,
            email,
            password,
            pic
          },  config );


          toast({
            title: "Successfully registered",
            description: "You have successfully registered to Talkify",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right"
          })


          localStorage.setItem("userInfo", JSON.stringify(data));

          setPicLoading(false);

          


        }catch(err){
          console.log(err);
        }




     }





  return (
    <VStack spacing="5px" >
    <FormControl id="first-name" isRequired>
      <FormLabel>Name</FormLabel>
      <Input
        placeholder="Enter Your Name"
        onChange={(e) => setName(e.target.value)}
        border={"1px solid black"}
      />
    </FormControl>
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
    <FormControl id="password" isRequired>
      <FormLabel>Confirm Password</FormLabel>
      <InputGroup size="md">
        <Input
          type={show ? "text" : "password"}
          placeholder="Confirm password"
          onChange={(e) => setConfirmpassword(e.target.value)}
          border={"1px solid black"}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
    <FormControl id="pic">
      <FormLabel>Upload your Picture</FormLabel>
      <Input
        type="file"
        p={1.5}
        // accept="image/*"
        onChange={(e) => postDetails(e.target.files[0])}
        
      />
    </FormControl>
    <Button
      colorScheme="blue"
      width="100%"
      style={{ marginTop: 15 }}
      onClick={submitHandler}
      isLoading={picLoading}
    >
      Sign Up
    </Button>
  </VStack>
  )
}

export default Signup