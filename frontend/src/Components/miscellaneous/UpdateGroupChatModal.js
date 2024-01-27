import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import axios from "axios";
import { set } from "mongoose";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = ChatState();

  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      return toast({
        title: "Only admin can remove users",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }


    // if(selectedChat.groupAdmin._id === userToRemove._id){
    //   return toast({
    //     title: "Admin cannot remove himself",
    //     status: "warning",
    //     duration: 4000,
    //     isClosable: true,
    //     position: "top-right",
    //   });
    // }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id, 
          userId: userToRemove._id 
        },
        config
      );



    userToRemove._id === user._id ? setSelectedChat():setSelectedChat(data);
    setFetchAgain(!fetchAgain);
    fetchMessages();
    setLoading(false);

    if(selectedChat.groupAdmin._id === userToRemove._id){
      return toast({
        title: ` Group Deleted successfully`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }

        toast({
          title: `"${userToRemove.name}" removed successfully`,
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });



    } catch (err) {
      console.log(err);
      return toast({
        title: "Something went wrong in removing user",
        description: err.response.data.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }



  };





  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setRenameLoading(false);
      setFetchAgain(!fetchAgain);
      //   onClose()
    } catch (err) {
      console.log(err);
      return toast({
        title: "Something went wrong in updating group name",
        description: err.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setRenameLoading(false);
    }

    setGroupChatName("");
  };


  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((user) => user._id === userToAdd._id)) {
      return toast({
        title: "User already in group",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      return toast({
        title: "Only admin can add users",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );

      setSelectedChat(data);
      setLoading(false);
      setFetchAgain(!fetchAgain);
    } catch (err) {
      console.log(err);
      return toast({
        title: "Something went wrong in adding user",
        description: err.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
      setSearchResult(data);
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

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody  display="flex" flexDir="column" alignItems="center">
            <Box  w="100%" d="flex" flexWrap="wrap" pb={3}>
              { (
              selectedChat.users.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              )))}
            </Box>

            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add user to Group"
                mb={1}
               
                onChange={(e) => {
                  handleSearch(e.target.value);
                }}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
