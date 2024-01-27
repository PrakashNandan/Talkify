import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";



const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);  
  

   
    useEffect(() => {

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if(userInfo){
          setUser(userInfo.user);
          // console.log(userInfo.user);
        }
        // console.log(userInfo);

       if(!userInfo){
        //    window.location.href = "/login";
        <Link to={'/'}></Link>
       }

    }, [Link]);




  return (
    <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat ,chats, setChats, notification, setNotification}}>
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
