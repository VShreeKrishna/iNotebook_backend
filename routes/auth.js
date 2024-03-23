const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const bcrypt =require('bcryptjs')
var jwt = require('jsonwebtoken');
var fetchuser =require('../middleware/fetchuser')


// ROUTE:1:Create user using: POST "/api/auth/createuser" Doesn't require Auth
const JWT_SECRET ="" //kwt
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success =false;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      // Check if the email is already registered
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({message: "Email already registered" })
      }
//hashing a password using the salt method  of bcrypt
      const salt =await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // Create a new user instance
     user =await  User.create({
        name:req.body.name,
        password:secPass,
        email:req.body.email
        });

        const data={
            user:{
                id:user.id
            }
        }

        //jsonwebtoken
      const authtoken =jwt.sign(data,JWT_SECRET)  //sync method
      success=true;
      res.json({success,authtoken})

      //return the values of the user with the hashed password
    //   res.status(201).json(user) // Respond with the saved user
    } catch (error) {
      console.error("Error saving user:", error)
      res.status(500).json({ message: "Server error" })
    }
    
  }
)

//ROUTE:2:authenticate a user using: POST "/api/auth/login".No login required
router.post(
    "/login",
    [
      body("email","enter a valid email").isEmail(),
      body("password","passwor cannot be blank").exists()
   ],
    async (req, res) => {
      let success =false;
      
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }
    const{email,password} =req.body;
    try {
        let user =await User.findOne({email});
        if(!user){
          success =false
            return res.status(400).json({error:"please try to login with correct crendentials"});
        }

        const passwordcomapre = await bcrypt.compare(password,user.password);
        if(!passwordcomapre){
          success=false;
            return res.status(400).json({success,error:"please try to login with correct crendentials"});
        }
        
        const data ={           //displaying the user id only
            user:{
            id:user.id
        }
    }
    const authtoken =jwt.sign(data,JWT_SECRET)  //sync method
    success =true;
    res.json({success,authtoken})

    } catch (error) {
        console.error("Error saving user:", error)
        res.status(500).json({ message: "Server error" }) 
    }
    })

    //ROUTE:3:get user using :POST "/api/auth/getuser login required
    router.post(
        "/getuser",fetchuser,async (req, res) =>{
         try {
            userId=req.user.id;
            const user =await User.findById(userId).select("-password");
            res.send(user);
         } catch (error) {
            console.error("Error saving user:", error)
        res.status(500).json({ message: "Server error" }) 
         }
        })
module.exports = router