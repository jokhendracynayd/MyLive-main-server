const Messages =require('../models/m_message');
const conversationUser = require('../models/m_chatting_users.message')
const UserTable = require('../models/m_user_login');
const {sendNotification} = require('../controllers/push_notification')
async function sendRechargeMessage(from, to, message){
    // first check from and to user is exist or not in the conversationUser collection
    const fromUser = await conversationUser.findOne({ user_id: from });
    const toUser = await conversationUser.findOne({ user_id: to });
    if(!fromUser){
        await conversationUser.create({user_id:from,conversations:[{user_id:to}]})
    }else{
        const exist = fromUser.conversations.find((conversation) => {
            if(conversation.user_id.toString() === to){
                conversation.updated_at = Date.now();
                fromUser.save();
                return true;
            }
            return false;
        });
        if (!exist) {
            fromUser.conversations.push({ user_id: to });
            await fromUser.save();
        }
    }
    if(!toUser){
        await conversationUser.create({user_id:to,conversations:[{user_id:from}]})
    }
    else{
        const exist = toUser.conversations.find((conversation) => {
            if(conversation.user_id.toString() === from){
                conversation.updated_at = Date.now();
                toUser.save();
                return true;
            }
            return false;
        });
        if (!exist) {
            toUser.conversations.push({ user_id: from });
            await toUser.save();
        }
    }
    const data = await Messages.create({
        message: { text: message },
        users: [from, to],
        sender: from,
    });
    if (data) {
        // send notification to the user
        const User = await UserTable.Table.findOne({username:from},{_id:0,username:1,user_profile_pic:1,user_nick_name:1});
        if(User){
            const User1 = await UserTable.Table.findOne({username:to},{device_token:1,_id:0})
            if(User1.device_token){
                let msg = `${User.user_nick_name} sent you a message`;
                await sendNotification(User1.device_token,msg,);
                await sendNotification(User1.device_token,message,);
            }
        }
        return {
            success:true,
            msg: "Message added successfully.",
            data:data
        };
    }
    else return { 
        success:false,
        msg: "Failed to add message to the database" 
    };
}

module.exports = {
  sendRechargeMessage
};