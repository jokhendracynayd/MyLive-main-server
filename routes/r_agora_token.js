const express = require('express');
const router = express.Router();
const rc = require('./../controllers/responseController');
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')
router.post('/',(req, res) => {
USERID = req.body.user_id;
const channelName  = 'dona_live'+USERID;
const appID = '1cba4eaf7bb5490bb4cc0d1d9ac8f656'
const appCertificate = '8a74c58c45fb43b3bf1975483e60026b';
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 86400
const currentTimestamp = Math.floor(Date.now() / 1000)
const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
// IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

// // Build token with uid
const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 0, role, privilegeExpiredTs);
console.log("Token With Integer Number Uid: " + tokenA);

// Build token with user account
// const tokenB = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, account, role, privilegeExpiredTs);
// console.log("Token With UserAccount: " + tokenB);

let Data = {
    channel_name : channelName,
    token : tokenA
    }
    return rc.setResponse(res, {
        success: true,
        msg: 'Token Generated',
        data: Data
        });
    }
);


module.exports = router;