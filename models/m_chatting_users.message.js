const mongoose = require('mongoose');

const conversationUserSchema = new mongoose.Schema({
  user_id:{
    type:String,
    unique:true,
    required:true,
  },
},{
  timestamps:{
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  }
}); 

conversationUserSchema.set('timestamps', { createdAt: 'created_at', updatedAt: 'updated_at', setDefaultsOnInsert: true });

const UserSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true,
  },
  // Add more user-related fields as needed
  conversations: [conversationUserSchema],
});
UserSchema.index({ user_id: 1 });
UserSchema.index({ 'conversations.user_id': 1 });
const User = mongoose.model('UserConversation', UserSchema);
module.exports =  User;
