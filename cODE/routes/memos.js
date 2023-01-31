const express= require('express')
const {Memo} = require('../models/Memo');
const { User } = require('../models/User');
const router = express.Router();
const jwt = require("jsonwebtoken");


router.use("", (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token)
            return res.status(401).json({ message: "Authentication failed, No token provided" });
        const bearer = token.split(" ");
        if (bearer.length !== 2)
            return res.status(401).json({ message: "Authentication failed, Invalid token format" });
        const decoded = jwt.verify(bearer[1], process.env.secrect_jwt);
        req.user = decoded;
        //console.log(token)
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Authentication failed, Token expired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Authentication failed, Invalid token" });
        } else
            return res.status(401).json({message: "Authentication failed"});
    }
    });
    // ajouter
router.post("",async (req,res)=>{

    // recuperation des donnees envoyees
   const {date, content} =  req.body
   // verification
   if(!date || !content)
    return res.status(400).json({message:"date and content are required"})

    // creer une instance du model
    const memo=new Memo({
        date:date,
        content:content
    })
    const login =  req.user.login;
    try{
    const dataMemo =  await memo.save()
    const user=await User.findOne({login:login})
    user.memos.push(dataMemo)
    const data = await user.save();
    res.json(data.memos[data.memos.length-1]);
    }catch(err)
    {
        res.status(500).send({message:err})
    }

})

// lister
router.get("",async (req,res)=>{
    const login =  req.user.login;
    const user=await User.findOne({login:login})
    const nbr = req.query.nbr || user.memos.length
    const dataToSend=user.memos.filter((elem,index)=>index<nbr)
    res.json(dataToSend)
    
})

// selectionner


// modifier
router.put("/:idMemo",async (req,res)=>{
    const idMemo = req.params.idMemo
    const login =  req.user.login;
    const {date,content}=req.body
    try{
        const user= await User.findOne({login:login})
    
        if(!user.memos.find(memo=>memo._id==idMemo))
            throw ("not allowed sorry")
        // modifier depuis la collection des memos
        const updatedMemo = await Memo.findByIdAndUpdate(idMemo, { date, content }, { new: true });
        //modifier la memo  envoyé
        user.memos = user.memos.map(memo => memo._id == idMemo ? updatedMemo : memo);
        await user.save();
        res.json({message:'Update with success'})
        }
        catch(err){
            res.status(500).send({message:err})
        }
})

//delete
router.delete("/:idMemo",async (req,res)=>{
    
    const idMemo = req.params.idMemo
    const login =  req.user.login;
    try{
    const user= await User.findOne({login:login})

    if(!user.memos.find(memo=>memo._id==idMemo))
        throw ("not allowed sorry")
        
    // suppression depuis la collection des memos
    await Memo.findByIdAndDelete(idMemo)
    user.memos.remove({_id:idMemo})
    await user.save();

    res.json({message:'delete with success'})    
    }
    catch(err){
        res.status(500).send({message:err})
    }
})

module.exports.memosRouter= router;
