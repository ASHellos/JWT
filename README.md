Release by: Adil Erraad

# Methodology:

In this project, we decided to create a website that revolves around a note application so that anyone can create an account with it and get his own page in which he publishes his notes, where three pages of a registration page, a login page, and a health page have been created for the user, where he can publish and delete his notes
We used a set of tools:
- Node js
- express
- bycrypt
- jsonwebtoken
- mongodb

## JWT
Simple introduction about JSON Web Tokens with simple program that uses it

### Definition :
  JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.
  
### Why should use JWT :
  **Authorization**: This is the most common scenario for using JWT. Once the user is logged in, each     subsequent request will include the JWT, allowing the user to access routes, services, and         resources that are permitted with that token. Single Sign On is a feature that widely uses JWT     nowadays, because of its small overhead and its ability to be easily used across different          domains.
  
### JWT Structure :
  In its compact form, JSON Web Tokens consist of three parts separated by dots (.)  which are:
 - Header
 - Payload
 - Signature
Therefore, a JWT typically looks like the following.

xxxxx.yyyyy.zzzzz

1. Header

```js
{
  "alg": "HS256",
  "typ": "JWT"
}

```

The header typically consists of two parts: the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA.

2. Payload

The second part of the token is the payload, which contains the claims. Claims are statements about an entity (typically, the user) and additional data

```js

{
  "pwd": "1234567890",
  "name": "adil",
  "login": "true"
}

```

3. Signature

To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.

``` js

HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
  
  ```
  
  **Putting all together**
  
The output is three Base64-URL strings separated by dots that can be easily passed in HTML and HTTP environments, while being more compact when compared to XML-based standards such as SAML.

![JWT](https://user-images.githubusercontent.com/93819249/215848021-5d93987b-2d7a-433a-bbac-c3ebcb302d40.png)

# Server Side

## MongoDB:

MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. MongoDB is developed by MongoDB Inc. and licensed under the Server Side Public License which is deemed non-free by several distributions

### MongoDB Atlas:

MongoDB Atlas is a multi-cloud database service by the same people that build MongoDB. Atlas simplifies deploying and managing your databases while offering the versatility you need to build resilient and performant global applications on the cloud providers of your choice

**To use mongo db in our project we need after instalation to make a models for table of dbs**

## Models

For each table in our dbs we need to create his own models in our project we need just two table one for users and the other for notes but in this project we will link the user table with the notes table ---> Each user has his own notes.

So the models must be  : 

### Memo.js

``` js

const { default: mongoose } = require("mongoose");
const schema= new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }
})
const Memo=mongoose.model("memos",schema)
module.exports={schemaMemo:schema,Memo:Memo}

```

In this code we make schema of notes each note have a time of publish and content type string and exports in mongo db with the name memos
And in last line we export Schema of memo for using of users and Memo for the whole memo space 

### User.js

``` js

const { default: mongoose } = require("mongoose");
const { schemaMemo } = require("./Memo");

const schema= new mongoose.Schema({
    login:{
        type:String,
        required:true
    },
    pwd:{
        type:String,
        required:true
    },
    nom:{
        type:String,
        required:true
    },
    memos:[schemaMemo]
})
const User=mongoose.model("users",schema)
module.exports.User=User

```

Each user need  login,name,pwd,and his own space in memo table of type memo  And take in the dbs the name of users
And in the last line export the table of all users for others uses

***So the Models in the Mongodb is template that defines the structure and behavior of the data in a collection. A model defines the fields (or attributes) that the documents in a collection can contain, as well as the methods and validations that can be performed on the data.***


## Routes

First we need to import some Module for make the work easy

### memos.js (/memos)

```js

const express= require('express') --->for have acces to express framework for Node.js that makes it easy to build web applications
const {Memo} = require('../models/Memo');  ---> For having access to schema of memo 
const { User } = require('../models/User');  ---> For having access to schema of user 
const router = express.Router();  ---> For making the app separated not in only one  file 
const jwt = require("jsonwebtoken");  ---> For having access to jwt

```

```js

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
    
```
This is the firt middleware using when have something to do with user 
we using this middlware for check the authentification for example :

**const token = req.headers.authorization** we used to extract the token from the header of each request send to '/users' routes like register /login

**if (!token)** It's Condition to check if is it there any token in the header or not if not return the erreur 401 UnAuthorized so this user who do this don't log in yet

**const bearer = token.split(" ")** we take the token from the header and split to parts by space(when find space this is part) and must be two parts : [Barear] [Token] will talk about this in client side

**const decoded = jwt.verify(bearer[1], process.env.secrect_jwt)** In this parts using jwt.verify thats is methode of jwt take two argument the token and Secret key
to check is the token coded by the sercretkey of server or not because the token have the user identity

*So this Middleware using to check the token is valid for this server and generate by them to have the access to other infrmation*

#### **_Post methode_**

``` js

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

```
In This code first we take some information from the body of the request in this exapmle take the date and the content
and afte check if the user write this information or not if not we tell him to we need the information otherwise we cdo search for get the profile of notes of this user by get his login from the token and we create a new schema for notes to receive this information from this user and storage the information to the profile of this user 

#### **_GET methode_**

``` js

    const login =  req.user.login;
    const user=await User.findOne({login:login})
    const nbr = req.query.nbr || user.memos.length
    const dataToSend=user.memos.filter((elem,index)=>index<nbr)
    res.json(dataToSend)
    
```

first we receive the login of user and search in the database for his profile and check i he write the number of notes who need to see or not if he write number will show just the first notes until the number if not will show all notes of his profile and send it to client


#### **_DELETE methode_**

``` js
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

```

In there methode delete we receive the information by the methode get so we use information in the url and send it to the server and we take this information using the syntax **req.params.[info]**
and after take the login from the user and check is there's any memo have this id in the dbs of ths user if not he don't have the right to delet it otherwise we will delet it and search in the dbs of memo for this notes and delet it also  and after save his new memo table
and send the client the message of successful deleted

#### **_PUT methode_**

``` js

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
module.exports.memosRouter= router;

```

Put methode is the methode we give as th right of modifier something in the dbs
we use it in this code to modifier a notes have already write it  by tiken his id and the login of his user  with the new information of this notes so the content and date the time generated automaticly and the new content will send it in the body of request

and after check the note ownership if is of user or not  and after find this memo in memo dbs and change it and  after find this memo in user profile and change it by the new one because when create note it's like give each user his own table of notes so if change it in the Memo dbs it's not changed in the user notes so thats why change it in the two parts
and the last line for export this script for user in the main script


**So In the part of Rout Memos we find we are using middleware first for check the token it's legal or not for the server and after see the different methode using for give response for the request of the client like get/post/put/delet**


### users.js (/users)


#### **_Importation_**

``` js

const express=require('express');
const bcrypt=require('bcrypt');
const { User } = require('../models/User');
const jwt= require('jsonwebtoken');

``` 
In this Code we required the same modules of memos.js
we have just one module new it's **bcrypt** module
The using of this module is simple it's password hashing to make some security in this project by make the password thats received from the user when he register or log in the website go in his hashing format not the sample format so will storage the password hashed inthe database



#### **_POST methode Register_** (/register)

``` js

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

``` 
This script using for receive the information from user when have his first register in the server so don't have account yet   after this checking if it fill all cases of form and if the two password is the same  and after little cheking is there another user using the same login or not because the login important for log into account and we don't want to find two users with the same name thats will getb some trouble for out project
and after this tests we take the password and make it in his crypted format to send it to the dbs by using the module of bcrypt
and after we create new user withe this information in out dbs
with tell him it's creates with success

**so every user send his information will check it and make the important crypted and store it to dbs**

#### **_POST methode Login_** (/Login)

``` js

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

``` 
In this part will receive the information of authentification from the body login-pwd
and check the user table for this user is it there or not and check his password by comparing the new with what we have in the dbs by the module bcrypt because the module generate his salt randomly
and if is the password the same in this time will using the fonctio jwt.sign
this function of jwt using to generate token uding secret key and some user information in this case we user the login because his the one who need each time
and after we send to the client the token and the name of this user

**So when we login into my account with successful the server send a token who identify me for the futur communication 

#### **_POST methode Log Out_** (/Logout)

``` js

router.post("/logout",async (req,res)=>{
    token=""
    
    res.json({message:'logout success'});
})

module.exports.UserRouter=router;

``` 
As what we see in this script we log out from the account so i don't need the token for other user of this user

**So in the user Route Whe find we have using just post methode from generate the toke for each log in to remove it in the log out with the secure when the register of the account**


## App.js (/)


### **_Importation_**

``` js

const mongoose= require('mongoose')
const express = require('express')
const dotenv=require('dotenv');
const { UserRouter } = require('./routes/users');
const { memosRouter } = require('./routes/memos');

```
In these importation we call mongoose module for get connction to mongodb
And the dotenv for receive the variable from the .env file for make some variable as environment variable so we can use it were we need by using the syntax **process.env.[name_variable]
And call the previeus Route code users and memos

### **_Initialisation_*

``` js

dotenv.config(); // require('dotenv').config()
//mongodb
mongoose.connect
(process.env.chaine_connection)
.then(()=>console.log("connected to mongodb atlas"))
.catch(err=>console.log(err))

//express
const app=express();

app.use(express.static("./public"))

```

In this simple code we star with dotenv.config() to let it start his work by receive the env variable from .env file
and after using the script for connect our server with the mongo dbs who will tell as if the connection work or there is problem
with chaine_connection this env variable who have the link  of connection with user and password of dbs 
and after user express.static to make the server take the front-end from the directory ./public


### **_Routing_**
``` js
app.use(express.json())

app.use('/users',UserRouter)
app.use('/memos',memosRouter)

app.get('/hi',(req,res)=>{
    res.send({message:"hi"});
})

```
code to import the route of users and memos requests
with a new get route named  /hi it's just for test if it's work or nt  and will show hi

### **_Routing_**

``` js

const port =process.env.port || 3000
app.listen(port, ()=>{
    console.log('server listening on port : ',port)
})

```

//In this part check if we chose a port for server or not if not chose port 3000 to listen on them


# Client Side

Client-side technologies include HTML, CSS, and JavaScript, which are used to build the user interface and provide dynamic behavior in the browser


## CSS

Whe have in file of css a lot of stylesheet for each element we have in this code so when you see the code knew there is for each element different styly to be what are you see

## JS

### **_Auth.js_**

#### **Importation**
``` js

import { loginElement, logoutElement, url } from "./config.js"
import { viderLogin, viderRegister } from "./main.js";

```
importing some element and variable from other file in the same directory 

#### **authentification**

``` js

export const authentifier=(login,pwd)=>{
    const dataToSend = {login:login,pwd:pwd}
    fetch(url+"/users/login",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res=>res.json().then(data=>{
        
        if(res.ok)
        {
            viderLogin();
            const {name,token}=data;
            localStorage.setItem("token",token);
            window.location="#application"
            loginElement.classList.add("hidden")
            logoutElement.classList.remove("hidden")
            logoutElement.children[0].innerText="Logout("+name+")"  
        }
        else{
            alert("echec d'authentification")
            
        }
    }).catch(err=>alert(err)))
    .catch(err=>console.log(err));
    
}

```
This is fonction export into another file for using 
In this script we receive some information as argument from the function and after this we send request to the server by using fetch request of methode POST with sending the received data from function with this request in the body with specific the type of content  and stand for the response

When we receive the response from the server check it if it success or failed and if is success
we take it to form json to take from them the data of response and make the login page inputs vide if someone come after to stole it  and we receive as response token and name and store it to variable
and take this token and store it to localstorage of browser with the name of "token" aith the value who receive from  the request
and now will redirect the user from login  page to application page
with change the login button to logout button with the name of user but if will refresh the page will return into login but after will fix it

#### **LogOut**


``` js
 
export const logout=()=>{

    fetch(url+"/users/logout",{ // tu dois injecter le token dans la requete
        method:"POST"
    }).then(res=>{
        if(res.ok)
        {
            localStorage.removeItem('token');
            logoutElement.classList.add("hidden")
            loginElement.classList.remove("hidden")
            // suppression du JWT  du local Storage
        }
        else{
            alert("error dans le logout")
        }
    })
    .catch(err=>alert(err));
}

```

this function is will export for other file use
As u can see we send request of type POST  to the server without any data  with the url of lougout and stand for response

if success will remove the token from localstorage who will whou don't let as do anything if we don't log in 
with change of log out button to log in

#### **Register**


``` js
 
export const register =(email,name,pwd,pwd2)=>{

    const dataToSend={
        login:email,
        name:name,
        pwd:pwd,
        pwd2:pwd2
    }
    fetch(url+"/users/register",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res=>{
        if(res.ok)
        {
            alert("success");
            window.location="#login"
            viderRegister();
            //vider
        }
        else{
            res.json()
            .then(data=>{
                const {message}=data;
                alert(message)
            })
            .catch(err=>{ alert("erreur");
                        console.log(err);
                    })
        }
    })
    .catch(err=>{
        alert("erreur");
        console.log(err);
    });

}

```

This function his using from other file
And we see we receive some information for register into dbs email pwd pw2 name
and store it into a object with change his name with the names of what we have in dbs
and send request of type post to register route into the server with the object who already create before and send it  
if the response is success well make the register page input elemnt empty and redirect to login page with alert of the register finished with success
if not we will see the erreur as alert


### **_Config.js_**

``` js
 
export const url=" http://localhost:3000"

export const loginBtn = document.getElementById("loginBtn");
export const emailLogin = document.getElementById("emailLogin");
export const passwordLogin = document.getElementById("passwordLogin");
export const welcomeElement = document.getElementById("welcomeElement");
export const applicationElement = document.getElementById("applicationElement");
export const loginElement = document.getElementById("loginElement");
export const registerElement = document.getElementById("registerElement");
export const memoInput = document.getElementById("memoInput");
export const resetBtn = document.getElementById("resetBtn");
export const addBtn = document.getElementById("addBtn");
export const tbody = document.getElementById("tbody");
export const emailRegister = document.getElementById("emailRegister");
export const nameRegister = document.getElementById("nameRegister");
export const passwordRegister = document.getElementById("passwordRegister");
export const passwordRegister2 = document.getElementById("passwordRegister2");
export const registerBtn = document.getElementById("registerBtn");
export const logoutElement = document.getElementById("logoutElement");
export const loading = document.getElementById("loading");
export const memoUpdate= document.getElementById("memoUpdate");


```

This code exports a series of constant variables in a JavaScript module
Start from the url of server who we send the requests to
The exported variables are references to HTML elements on a web page that have been selected using the document.getElementById method.
to get his value or fonctionality
we will see how it is work after
### **_Memos.js_**

#### **Verify Log in**

``` js
import { loading, tbody, url } from "./config.js";
import { addMemoToTable } from "./main.js";

export const virif=()=>{
    let c=localStorage.getItem("token")
    if(c){
        loginElement.classList.add("hidden")
        logoutElement.classList.remove("hidden")
    }
}

```
This code exports a constant function in a JavaScript module to other file with import others
this script first store from localstorage the token to  variable named c
and check is there value or not in the variable 
if true hide the login button and change it to log out button so fix the problem if u refresh th page by hide the log in  and show the log out

#### **Load Information**

``` js

export const load=async()=>{

    loading.classList.remove("hidden")
     const token = localStorage.getItem("token");
    fetch(url+"/memos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      }).then(res=>res.json()).then(data=>{
     
        data.forEach(element => {
            addMemoToTable(element)
        });

    })
    .catch(err=>{
        alert("error");
        console.log(err)
    }).finally(()=>{
        loading.classList.add("hidden")
    })
}

```

This code exports a constant function in a JavaScript module to other file
first you wil see after log in to account the loading elemnt shown and after these will store the token from the localstorage
now will send request of type get to the server without data but with specific header with type of content and send with the header authentification information (token)using the convention authorization wih the **format Authorization: Bearer [token]**  
with the Bearer keyword who used to indicate the type of authentification which in this case is jwt  
and the Authorization header is commonly used to transmit authentication information
By sending the token in this format, it is clear to both the client and server what type of authentication is being used, and the token can be easily extracted from the header for use by the server
after this if the  response is success we will send the data received into other fonction  named  by **addMemoToTable(element)** we will show the data i  table

#### **Add Notes**

``` js

export const addMemo=async(content)=>{
    const token = await localStorage.getItem("token");

    const dataToSend = {
        content:content,
        date:new Date()
    }
    fetch(url+"/memos",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }).then(res=>{
        if(res.ok)
        {
            res.json().then(data=>{
                addMemoToTable(data)
            })
        }
        else{
            alert("erreur")
        }
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}

```

in this code will receive the data from the client to this function who store the token from localstorage
and create new object  witch parameter content and date so this function is for add notes to user dbs 

and after we send request of type post to server with token in header and data in the body and if the response is success we will see this data in table of  notes when u log into the account

#### **Remove Notes **

``` js

export const deleteMemo=async(id)=>{
    const token = await localStorage.getItem("token");

    fetch(url+"/memos/"+id,{
        method:"DELETE",
        headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    }).then(res=>{
        if(res.ok)
        {
            document.getElementById(id).remove();
        }
        else
            alert("error")
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}

```

int this code will receive as argument id of a notes and after will store the token from the storage of browser 

and will send request of type delete to the server with the id in the url with toekn in header
and if success we will see the selected notes dispeare from the table


#### **Update Notes**
export const updateMemo=async(id,content)=>{
    const token = await localStorage.getItem("token");
    const dataToUpdate={
        content:content,
        date:new Date()
    }
    //console.log(contents)
    console.log(dataToUpdate)

    fetch(url+"/memos/"+id,{
        method:"PUT",
        headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body:JSON.stringify(dataToUpdate)
    }).then(res=>{
        if(res.ok)
        {
            window.location.reload();        
        }
        else
            alert("error")
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}

``` js

export const updateMemo=async(id,content)=>{
    const token = await localStorage.getItem("token");
    const dataToUpdate={
        content:content,
        date:new Date()
    }
    //console.log(contents)
    console.log(dataToUpdate)

    fetch(url+"/memos/"+id,{
        method:"PUT",
        headers:{
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body:JSON.stringify(dataToUpdate)
    }).then(res=>{
        if(res.ok)
        {
            window.location.reload();        
        }
        else
            alert("error")
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}


```
in this code will receive as argument id and the new content of notes from the main script and after this will receive from the localstorage of browser the token this token will send it in the header of request of type put using fetch to do it with data: new data and the new content 

ans stand for response if the response true will reload the page to see the new version of table


### **_Main.js_**

#### **Importation**

``` js

import {addBtn, emailLogin, emailRegister, loginBtn, logoutElement, memoInput,memoUpdate, nameRegister, passwordLogin, passwordRegister, passwordRegister2, registerBtn, resetBtn, tbody} from "./config.js"
import {authentifier, logout, register} from "./auth.js"
import { addMemo, deleteMemo, load,virif,updateMemo } from "./memos.js";

window.addEventListener('popstate', function (event) {
	singlePageManger(getPath())

});

```

Import series of elemnt from other files  fith function and button
as we can see this function give the user the possibility of make page is updated correctly when the user navigates through history entries in the browser. This is commonly used to implement single-page applications

#### **Button**

``` js

loginBtn.addEventListener('click',()=>{
   const login = emailLogin.value
   const pwd = passwordLogin.value
   if(!login  || !pwd)
        return alert("please complete all fileds")
    
    authentifier(login,pwd)
   
})

logoutElement.addEventListener('click',()=>{
    logout();
})

resetBtn.addEventListener('click',()=>{
    memoInput.value=""
})

addBtn.addEventListener('click',()=>{
    const content=memoInput.value
    if(!content)
        return alert("please provide a content for your memo")
    
    addMemo(content)
})
registerBtn.addEventListener('click',()=>{
    // Recuperation des valeurs
    const email = emailRegister.value
    const name = nameRegister.value
    const pwd = passwordRegister.value
    const pwd2 = passwordRegister2.value

    // verification des valeurs
    if(!email || !name || !pwd || !pwd2)
        return alert("please fill all inputs")

    if(pwd!=pwd2)
        return alert("passwords didn't match")
    
   
    // appel de la methode register
    register(email,name,pwd,pwd2)

})

```

in this script we give the button event to do when we click it as:
- *loginbtn* when clique he will receive data from inputs of login from the element of the login
and after get his value and check it if is write something or not and send the data to authentification funtion
- *logoutbtn* this button make the logout work
- *resetbtn* this button make the value of input memo empty
- *AddBtn*  this take the value of input and check it and send the value to addMemo function to added
- *RegisterBtn* This button take the value of the element of form of registration  and check it  and send it to register function to go to the server

#### **Vider**

``` js

export const viderRegister = ()=>{
    emailRegister.value=""
    nameRegister.value=""
    passwordRegister.value=""
    passwordRegister2.value=""
}
export const viderLogin = ()=>{
    passwordLogin.value=""
    emailLogin.value=""
}

```

These two function do the same thing for difference elemnet by emptying his input value

#### **Add to Table**

``` js

export const addMemoToTable=(memo)=>{
    const {date,content,_id} = memo

    // creation des elemments
    const tr= document.createElement("tr")
    const td1= document.createElement("td")
    const td2= document.createElement("td")
    const td3= document.createElement("td")
    const td4= document.createElement("td")
    const btn= document.createElement("button")
    const btn1= document.createElement("button")

    // liaison parent.appendChild(fils)
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    td4.appendChild(btn)
    td4.appendChild(btn1)
    
    tr.setAttribute("id",_id);
    //remplissage
    td1.innerText=_id
    td2.innerText=content
    td3.innerText=date
    btn.innerText="delete"
    btn1.innerText="Modifiee"

    btn.classList.add("delete")
    btn1.classList.add("modifier")
    btn.addEventListener("click",()=>{
        //TODO : call fetch delete + delete row
        deleteMemo(_id)
    })
    btn1.addEventListener('click',()=>{
        const content=memoUpdate.value
        if(!content)
            alert("please provide a content for memo updated")
        else
            updateMemo(_id,content)
        
    })

    tbody.appendChild(tr)
}

```

In these script will receive data as argument and create number of element for this data and append it to a table  and show all the data in the same table with two new button of option who is delete btn and modifier button who give the user the possibility to remove and modifier his  notes by add event to each button and send the id od notes to a function

#### **

``` js

const getPath=()=>window.location.hash || '#welcome'
const singlePageManger =(path)=>{
    console.log(path)
    if(path=="#application")
    {
        
        tbody.innerText=""
        load();
    }
    const components=document.getElementsByClassName("component")
    Array.from(components).forEach(element=>{
        element.classList.add('hidden');
    })
    const links=document.querySelectorAll('header nav li')
    Array.from(links).forEach(element=>{
        element.classList.remove('selected');
    })
    document.querySelector(path).classList.remove('hidden')
    document.querySelector('header nav li:has(a[href="'+path+'"])').classList.add('selected')
}
singlePageManger(getPath())

virif()

```
In the first line we have function to receive the path of the page where we are if there's no page will send us to the welcome page
and if the path is application will remove the innertext of tbody and call the load() function
after get all the element of type element with class component and make it hidden

and after find all elemnt of (li) inside a nav  isode a header elemnt  will remove selected class from them

**The purpose of this function is to dynamically update the content of the single-page application based on the URL path, by hiding and showing different elements and updating the styling of navigation links.**

# **_Conclusion_**
In conclusion to  build project using jwt technologies you need to knew a lot of other technologies and knew how it's work the find a way to link between theme without erreur
because of project work with server and client side using JSON Web Tokens (JWT) allows for secure communication between the two parties. The server generates a JWT containing user information and sends it to the client after successful authentication. The client can then use this token for subsequent requests to access protected resources from the server, without having to send the user credentials every time. This reduces the risk of sensitive information being intercepted and improves the overall security of the application.
