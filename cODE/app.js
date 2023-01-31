const mongoose= require('mongoose')
const express = require('express')
const dotenv=require('dotenv');
//const session = require('express-session')
const { UserRouter } = require('./routes/users');
const { memosRouter } = require('./routes/memos');

dotenv.config(); // require('dotenv').config()
//mongodb
mongoose.connect
(process.env.chaine_connection)
.then(()=>console.log("connected to mongodb atlas"))
.catch(err=>console.log(err))

//express
const app=express();

app.use(express.static("./public"))

//middleware to parse json data on body request
app.use(express.json())


app.use('/users',UserRouter)


app.use('/memos',memosRouter)

app.get('/hi',(req,res)=>{
    res.send({message:"hi"});
})

// check authentification (gard / interceptor)




const port =process.env.port || 3000
app.listen(port, ()=>{
    console.log('server listening on port : ',port)
})