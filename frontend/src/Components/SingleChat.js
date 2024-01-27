import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Center,
  FormControl,
  Icon,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/chatLogics";
import { get } from "mongoose";
import ProfileModal from "./miscellaneous/ProfileModal";

import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from "axios";
import '../Components/styles.css'
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie"
import animationData from "../animation/typing.json";
// import { use } from "../../../backend/routes/userRoutes";




const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;


function SingleChat({ fetchAgain, setFetchAgain }) {
  const [Messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping , setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );


      setMessages(data);
      setLoading(false);

      
      socket.emit("join room", selectedChat._id);

    } catch (error) {
      console.log(error);
      setLoading(false);
      toast({
        title: "Error occurred.",
        description: "Unable to fetch messages.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(()=>{
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", ()=>{
      setSocketConnected(true);
    });

    socket.on('typing', ()=>setIsTyping(true));
    socket.on('stop typing', ()=>setIsTyping(false));

},[])
            
  

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  console.log(notification, "noty........")

  useEffect(()=>{

    socket.on("message received", (newMessageReceived)=>{

        if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
              if(!notification.includes(newMessageReceived)){
                setNotification([newMessageReceived, ...notification]);
                setFetchAgain(!fetchAgain);
              }
        }
        else{
          setMessages([...Messages, newMessageReceived]);
        }
    })




  })

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      setNewMessage("");
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

      

        setMessages([...Messages, data]);

        socket.emit("new message", data);
      
      } catch (err) {
        toast({
          title: "Error occurred.",
          description: "Unable to send message.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if(!socketConected){
      return ;
    }

    // if this function run means user is typing, so make the typin true

    if(typing === false){
        setTyping(true);
        socket.emit("typing", selectedChat._id)
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    
    setTimeout(()=>{
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if(timeDiff >= timerLength && typing){
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);


  }




  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchagain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              // <Spinner
              //   thickness="4px"
              //   speed="0.65s"
              //   emptyColor="gray.200"
              //   color="blue.800"
              //   size="xl"
              //   alignSelf="center"
              //   margin='auto'
              
              // />

              <Spinner
              size="xl"
              w={20}
              h={20}
              color="blue.800"
              alignSelf="center"
              margin="auto"
            />
            ) : (
              <div className="messages">
                <ScrollableChat messages={Messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div><Lottie
                 options={defaultOptions}
                width={70}
                style={{ marginBottom: 15, marginLeft: 15 }}
              
              
              /> </div>: null}
              <Input
                variant={"filled"}
                bg={"#E0E0E0"}
                placeholder={"Type a message"}
                onChange={typingHandler}
                value={newMessage}
                border={"1px solid black"}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
}


export default SingleChat;
