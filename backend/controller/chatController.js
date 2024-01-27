const express = require('express');
const Chat = require('../model/ChatModel');
const User = require('../model/userModel');



const accessChat = async(req, res) => {

    const {userId} = req.body;


    if(!userId){
        console.log('User ID is required');
        return res.status(400).json({message: 'User ID is required'});
    }

    var isChat = await Chat.find({

        isGroupChat : false,
        $and : [
            {users : {$elemMatch : {$eq : req.user._id}}},
            {users : {$elemMatch : {$eq : userId}}},

       ]
    }).populate("users","-password").populate('latestMessage')

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    })


    if(isChat.length > 0){
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try{
            const newChat = await Chat.create(chatData);
            
            const Fullchat = await Chat.findById(newChat._id).populate("users","-password")

            res.status(200).send(Fullchat);


        }catch(err){
            console.log(err);
            res.status(400).send(err.message);
        }

    }

}

// const fetchChats = async(req, res) => {

//     try{
//         const chats = await Chat.find({
//             users : {$elemMatch : {$eq : req.user._id}}
//         }).populate("users","-password").populate("groupAdmin", "-password").populate('latestMessage')
//         .sort({updatedAt : -1});

//         const Fullchat = await User.populate(chats, {
//             path: "latestMessage.sender",
//             select: "name pic email",
//         })

//         res.status(200).send(Fullchat);
//     }catch(err){
//         console.log(err);
//         res.status(400).send(err.message);
//     }

// }
const fetchChats = async(req, res) => {

    try{
        const chats = await Chat.find({
            users : {$elemMatch : {$eq : req.user._id}}
        }).populate("users","-password").populate("groupAdmin", "-password").populate('latestMessage')
        .sort({updatedAt : -1})
        .then(async (results) => {
            results = await User.populate(results, {
              path: "latestMessage.sender",
              select: "name pic email",
            });
            res.status(200).send(results);
          });
       
    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }

}


const createGroupChat = async(req, res) => {


    if(!req.body.users || !req.body.name){
        console.log('Users and name are required');
        return res.status(400).send('Users and name are required');
    }


    var users = JSON.parse(req.body.users);

    if(req.body.users.length <2){
        console.log('Group chat must have atleast 2 users');
        return res.status(400).send('Group chat must have atleast 2 users');
    }


    users.push(req.user);

    try{

        const newChat = await Chat.create({
            chatName: req.body.name,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user,
        })

        const Fullchat = await Chat.findById(newChat._id).populate("users","-password").populate("groupAdmin", "-password")

        res.status(200).send(Fullchat);

    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }







}

const renameGroup = async(req, res) => {

    const  {chatId, chatName} = req.body;

    if(!chatId || !chatName){
        console.log('Chat ID and chat name are required');
        return res.status(400).send('Chat ID and chat name are required');
    }


    try{

        const chat = await Chat.findById(chatId).populate("users", "-password").populate("groupAdmin", "-password");

        if(!chat){
            console.log('Chat not found');
            return res.status(400).send('Chat not found');
        }

        if(chat.groupAdmin._id.toString() !== req.user._id.toString()){
            console.log('Only admin can rename the group');
            return res.status(400).send('Only admin can rename the group');
        }

        chat.chatName = chatName;
        await chat.save();

        res.status(200).send(chat);

    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }


}

const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        console.log('Chat ID and user ID are required');
        return res.status(400).send('Chat ID and user ID are required');
    }

    try {

        const chat1 = await Chat.findById(chatId).populate('users', '-password').populate('groupAdmin', '-password');

        if (chat1.users.find((u) => u._id.toString() === userId.toString())) {
            console.log('User is already a member of the group');
            return res.status(400).send('User is already a member of the group');
        }

        if (chat1.groupAdmin._id.toString() !== req.user._id.toString()) {
            console.log('Only admin can add users to the group');
            return res.status(400).send('Only admin can add users to the group');
        }

        
        if (!chat1) {
            console.log('Chat not found');
            return res.status(400).send('Chat not found');
        }

        const chat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

            
        res.status(200).send(chat);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};

const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        console.log('Chat ID and user ID are required');
        return res.status(400).send('Chat ID and user ID are required');
    }

    try {
        const chat = await Chat.findById(chatId).populate('users', '-password').populate('groupAdmin', '-password');

        if (!chat) {
            console.log('Chat not found');
            return res.status(400).send('Chat not found');
        }

        if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
            console.log('Only admin can remove users from the group');
            return res.status(400).send('Only admin can remove users from the group');
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).send(updatedChat);
    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
};


module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup};






