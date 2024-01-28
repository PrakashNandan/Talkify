const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chats = require('./data/data');
const connectDB = require('./config/db');
const userRouter = require('./routes/userRoutes');
const chatRouter = require('./routes/chatRoutes');
const messageRouter = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddlewares');
const path = require('path');


const app = express();
dotenv.config();
app.use(cors());
connectDB();

app.use(express.json());  // to accept the json data from req.body


 app.use('/api/user', userRouter)
 app.use('/api/chat', chatRouter)
 app.use('/api/message', messageRouter)



 // -----------------------Deployment------------------


const __dirname1 = path.resolve();

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res)=>{
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  })
}
else{
      app.get("/", (req,res)=>{
        res.send("API is running Successfully")
      })
}





 //  ----------------------Deployment-------------------
















 app.use(notFound);
 app.use(errorHandler);


 const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server started at PORT:${PORT}`);
});



const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  }, 
});

io.on("connection", (socket)=>{
    console.log("connected to socket.io");

    socket.on("setup", (userData)=>{
      socket.join(userData._id);
      socket.emit("connected");
    });

    socket.on("join room", (room)=>{
        socket.join(room);
        console.log("User joined Room : " + room);
    });


    socket.on("typing", (room)=> socket.in(room).emit("typing"));
    socket.on("stop typing", (room)=> socket.in(room).emit("stop typing"));


    socket.on("new message", (newMessageReceived)=>{

      var chat = newMessageReceived.chat;

      if(!chat.users) return console.log("chat users not defined");

      chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
      });

    })

    socket.off("setup", ()=>{
      console.log("User DISCONNECTED");
      socket.leave(userData._id);
    });



});










