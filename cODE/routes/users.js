const express=require('express');
const bcrypt=require('bcrypt');
const { User } = require('../models/User');
const jwt= require('jsonwebtoken');

const router=express.Router();

router.post('/register',async (req,res)=>{
    //recuperation des donnees
   const {login, pwd, pwd2, name} = req.body;
   // verification des donnes
    if(!login || !pwd || !pwd2 || !name)
        return res.status(400).json({message:'all fields are required'});
      
    if(pwd!=pwd2)
        return res.status(400).json({message:'passwords don t match'});
    
    let searchUser = await User.findOne({login:login})
    if(searchUser)
        return res.status(400).json({message:'login already exists'});
    

    const mdpCrypted= await bcrypt.hash(pwd,10)
    const user = new User({
        login:login,
        nom:name,
        pwd:mdpCrypted,
        memos:[]
    })
    user.save().then(() =>res.status(201).json({message:'success'}))
    .catch(err=>res.status(500).json({message:err}))
})

router.post("/login",async (req,res)=>{
    const {login,pwd}=req.body
    console.log(pwd)
    const findUser= await User.findOne({login:login})
    if(!findUser)
        return res.status(404).json({message:'no user found'});
    
    const match = await bcrypt.compare(pwd,findUser.pwd)
    if(match)
    {
        const token = jwt.sign( {login : findUser.login}, process.env.secrect_jwt, { expiresIn: '1h' });
        return res.json({token ,name:findUser.login});//200
    }
    res.status(400).json({message:'incorrect password'});
}) 
router.post("/logout",async (req,res)=>{
    token=""
    res.json({message:'logout success'});
})

module.exports.UserRouter=router;