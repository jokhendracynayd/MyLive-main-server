const mongoose = require('mongoose');

const TableName = 'moderator';
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const ModeratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (email) {
                return emailRegex.test(email);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    hashedPassword:{
        type:String,
        required:true,
        trim:true
    },
    account_status:{
        type:String,
        enum:['active','inactive'],
        default:'active'
    },
    role:{
        type:String,
        default:'moderator'
    },  
    createdAt:{
        type:Date,
        default:Date.now()
    },
});

const Moderator = mongoose.model(TableName, ModeratorSchema);

module.exports = Moderator;