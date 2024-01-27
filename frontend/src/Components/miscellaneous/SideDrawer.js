import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BellIcon, TriangleDownIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatLoading from "../ChatLoading";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/chatLogics";
import { Effect } from "react-notification-badge"
import NotificationBadge from "react-notification-badge/lib/components/NotificationBadge";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat, chats, setChats] = useState(false);

  const { user, setSelectedChat, notification, setNotification } = ChatState();
  const navigate = useNavigate();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Search field is empty",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(`/api/user/?search=${search}`, config);
      setLoading(false);
      setSearchResults(data);
    } catch (err) {
      console.log(err);
      toast({
        title: "Something went wrong in searching",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-bottom",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoadingChat(true);

      const { data } = await axios.post("/api/chat/", { userId }, config);
      console.log(chats);
      if (chats && !chats?.find((c) => c._id === data._id))
        setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (err) {
      console.log(err);
      toast({
        title: "Something went wrong in accessing chat",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"white"}
        w={"100%"}
        p={"5px 10px 5px 10px"}
        borderWidth={"5px"}
      >
        <Tooltip label="search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" backgroundColor={"gray.200"} onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              {" "}
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize={"2xl"} color={"black"} fontFamily={"sans work"}>
          {" "}
          Talkify
        </Text>
        <div>
          <Menu>
            <MenuButton p={2}>
              <NotificationBadge 
                count={notification.length}
                effect={Effect.SCALE}
              
              />
              <BellIcon fontSize={"2xl"} color={"black"} marginRight={3} />
            </MenuButton>
            <MenuList>
              {!notification.length && "No New Messages "}
              {console.log(notification)}
              {notification && notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification((prevNotifications) =>
                      prevNotifications.filter((n) => n !== notif)
                    );
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>

              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Search User</DrawerHeader>

          <DrawerBody>
            <Box display={"flex"} pb={2}>
              <Input
                placeholder="Search by name or email"
                value={search}
                mr={2}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
