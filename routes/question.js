const express=require('express');
const passport = require('passport');
const router=express.Router();
const Question=require('../database models/questions')

router.get('/question/test',passport.authenticate('jwt',{session:false}),(req,res)=>{
    console.log('test passed')
})

router.post('/question/add',passport.authenticate('jwt',{session:false}),(req,res)=>{
    const {name,difficulty,url,topic}=req.body;
    Question.findOne({url:url})
    .then((foundQuestion)=>{
        if(foundQuestion)
        {
            return res.status(400).json({error:"question with such url already exists:",question:foundQuestion})
        }
        const newQuestion=new Question({
            questionName:name,
            difficulty,
            url,
            topic
        })
        newQuestion.save()
        .then((savedQuestion)=>{
            return res.status(200).json({question:savedQuestion})
        })
        .catch((err)=>{
            console.log(err)
        })
    })
    .catch((err)=>{
        console.log(err);
    })
})


module.exports=router;