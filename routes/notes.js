const express =require('express');
const { body, validationResult } = require("express-validator")
const router =express.Router();
const fetchuser =require('../middleware/fetchuser')
const Note = require("../models/Note")

// ROUTE:1:fetch the user: get "/api/notes/fetchalluser". login required
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
        
       const notes = await Note.find({user:req.user.id})
        res.json(notes)
    } 
    catch (error) {
        console.error("Error saving user:", error)
        res.status(500).json({ message: "Server error" })
    }
        
})


// ROUTE:2: add notes: POST "/api/notes/addnote".login required

router.post('/addnote',fetchuser,[
    body("title","enter a valid title").isLength({ min: 3 }),
    body("description","Description must be atleast 5 characters").isLength({ min: 5 }),
  ],async (req,res)=>{
    try {
    const {title, description,tag} = req.body;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const note =new Note({
        title,description,tag,user:req.user.id
    })
    const savednote =await note.save()
     res.json(savednote)
    } 
    catch (error) {
        console.error("Error saving user:", error)
        res.status(500).json({ message: "Server error" })
    }
 })
 // ROUTE:3: updatenotes: PUT "/api/notes/updatenote".login required

router.put('/updatenote/:id',fetchuser,async (req,res)=>{
  try {
   
   const{title,description,tag}=req.body;
   const newNote ={};
   if(title) {newNote.title=title};
   if(description) {newNote.description=description};
   if(tag) {newNote.tag=tag};

//find the note to be updated and update it
  let note = await Note.findById(req.params.id);
  if( !note ) {res.status(404).send("Not Found")}

  if(note.user.toString()!==req.user.id){
    return res.status(401).send("Not allowed")
  }
  
  //to set the updated note
  note =await Note.findByIdAndUpdate(req.params.id, {$set:newNote},{new:true})
  res.json({note})
} 
catch (error) {
  console.error("Error saving user:", error)
  res.status(500).json({ message: "Server error" })
}

})



// ROUTE:4: deleting an existing note :updatenotes: DELETE "/api/notes/deletenote".login required

router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
  try {
    
    //find the note to be delete and delete it
let note = await Note.findById(req.params.id);
 if( !note ) {res.status(404).send("Not Found")}

 //allow deletion if the owner owns the note
 if(note.user.toString()!==req.user.id){
   return res.status(401).send("Not allowed")
 }
 
 //to set the updated note
 note =await Note.findByIdAndDelete(req.params.id)
 res.json({"success":"Note has been deleted",note:note})
}
 catch (error) {
  console.error("Error saving user:", error)
  res.status(500).json({ message: "Server error" })
}
})

module.exports =router
