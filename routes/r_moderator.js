const router = require('express').Router();
const Moderator = require('../models/m_moderator');
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const bcrypt = require('bcryptjs');

// Path: /moderator

// Get all moderators
router.get('/', asyncErrorHandler(async (req, res) => {
    const moderators = await Moderator.find({}, { _id: 1, name: 1, email: 1, account_status: 1 });
    res.json({
      success: true,
      data: moderators,
      msg: 'All moderators'
    })
}));


// create a moderator

router.post('/create', asyncErrorHandler(async (req, res) => {
    const {name,email,password} = req.body;
    // check all fields are available and not empty and undefined
    if(!name || !email || !password){
        return res.json({
            success:false,
            msg:'Please provide all fields'
        })
    }
    // check if email already exists
    const isModerator = await Moderator.findOne({email});
    if(isModerator){
        return res.json({
            success:false,
            msg:'Email already exists'
        })
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password,10);
    const moderator = await Moderator.create({
        name,
        email,
        password,
        hashedPassword
    });
    res.json({
      success: true,
      data: moderator,
      msg: 'Moderator created'
    })
}));


// login moderator

router.post('/login', asyncErrorHandler(async (req, res) => {
    const {email,password} = req.body;
    // check all fields are available and not empty and undefined
    if(!email || !password){
        return res.json({
            success:false,
            msg:'Please provide all fields'
        })
    }
    // check if email exists
    const moderator = await Moderator.findOne({email},{_id:1,email:1,name:1,hashedPassword:1,account_status:1});
    if(!moderator){
        return res.json({
            success:false,
            msg:'Email does not exist'
        })
    }
    // check if password is correct
    const isMatch = await bcrypt.compare(password,moderator.hashedPassword);
    if(!isMatch){
        return res.json({
            success:false,
            msg:'Password is incorrect'
        })
    }
    res.json({
      success: true,
      data: {
            id:moderator._id,
            name:moderator.name,
            email:moderator.email,
            account_status:moderator.account_status
      },
      msg: 'Moderator logged in'
    })
}));


// update moderator

router.put('/update/:id', asyncErrorHandler(async (req, res) => {
    const {id} = req.params;
    const {account_status} = req.body;
    // validate id
    if(!id || !account_status){
        return res.json({
            success:false,
            msg:'Please provide id'
        })
    }
    // check if moderator exists
    const moderator = await Moderator.findByIdAndUpdate(id,{account_status},{new:true});
    if(!moderator){
        return res.json({
            success:false,
            msg:'Moderator does not exist'
        })
    }
    res.json({
      success: true,
      data: moderator,
      msg: 'Moderator updated'
    })
}));

module.exports = router;