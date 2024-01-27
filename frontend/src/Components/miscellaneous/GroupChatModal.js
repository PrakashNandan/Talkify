import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
  Input,
  FormControl,
  Spinner,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { set } from "mongoose";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

function GroupChatModal({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user/?search=${search}`, config);
      // console.log(data)
      setLoading(false);
      setSearchResults(data);
    } catch (err) {
      console.log(err);
      toast({
        title: "Something went wrong in searching users",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleSubmit = async () => {

    if(!groupChatName){
      toast({
        title: "Group Chat Name is empty",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if(selectedUsers.length < 2){

        toast({
            title: "Select atleast 2 users",
            status: "warning",
            duration: 4000,
            isClosable: true,
            position: "top-right",
            });
            return;
    }

    try{

        const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };

          const {data} = await axios.post('/api/chat/group', {
            name: groupChatName, 
            users: JSON.stringify(selectedUsers.map((user) => user._id))}
            ,config);
          console.log(data);
          setChats([data, ...chats]);
          onClose();

            toast({
                title: "Group Chat Created",
                status: "success",
                duration: 4000,
                isClosable: true,
                position: "top-right",
                });
            
            setGroupChatName("");
            setSelectedUsers([]);


    }
    catch(err){
        console.log(err);
        toast({
            title: "Something went wrong in creating group chat",
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top-right",
          });
    }







  };



  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (userToDelete) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userToDelete._id));
  }


  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Input
                placeholder="Add User"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {/* selected users */}
            <Box w={'100%'} display="flex" flexWrap={'wrap'}>
              {selectedUsers.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>
            {/* rendered searched users */}
            {loading ? (
              <Spinner></Spinner>
            ) : (
              searchResults
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default GroupChatModal;
