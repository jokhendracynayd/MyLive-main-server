//Production


const admin = require("firebase-admin");
const serviceAccount = require("../config/mylive-app-serviceAccountKey.json");
const android = require("../config/android_key.js");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Replace YOUR_SERVER_KEY with your Firebase Cloud Messaging server key
  apiKey: android.apiKey,
  authDomain: android.authDomain,
  projectId: android.projectId,
  messagingSenderId: android.messagingSenderId,
  appId: android.appId,
});


async function testNotification(token , message) {
  const payload = {
    notification: {
      title: 'My Live Notification',
      icon: 'default',
      sound: 'default',
      // click_action: 'dona_live',
      body: message,
      // image:img,
      image:"https://15.207.180.128:3000/api/file/download/1694520930427_dona_live_profile.png",
    },
  };
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24,
  };
  try {
    const response = await admin.messaging().sendToDevice(token, payload, options);
    // console.log('Push notification sent successfully:', response);
  } catch (error) {
    // console.error('Error sending push notification:', error);
  }
}

let token = 'd3laEdBkTRidZ3Phw1LuIb:APA91bFtgYoYbxv36W3M-2DuSSn718qlYX8nY2jdzC-ZlaA-nPH-vL1ZeJcRGWwS5S9pmc_1BW0uMtSdQCALU_tSDcbWSCcloZxSi4ZVNiMv_D6YC9Om2JFyXkgu333NjuQmuVCgVmBi';
let msg = 'This is a test message';
testNotification(token,msg);

async function sendNotification(registrationToken,msg) {
  const message = {
    notification: {
      title: 'My Live Notification',
      icon: 'default',
      sound: 'default',
      // click_action: 'dona_live',
      body: msg,
      // image:img,
      // image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZIRGawHRiUgFhzi9iW9VqJgDwNmBPJHGwyG0s9p4&s",
    },
  };
  try {
    const response = await admin.messaging().sendToDevice(registrationToken, message);
    // console.log('Push notification sent successfully:', response);
  } catch (error) {
    // console.error('Error sending push notification:', error);
  }
}



async function sendBulkNotifications(registrationTokens,msg,img) {
  const message = {
    notification: {
      title: 'My Live Notification',
      icon: 'default',
      sound: 'default',
      // click_action: 'dona_live',
      body: msg,
      image:img,
      // image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZIRGawHRiUgFhzi9iW9VqJgDwNmBPJHGwyG0s9p4&s",
    },
  };

  try {
    const response = await admin.messaging().sendToDevice(registrationTokens, message);
    // console.log('Bulk push notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending bulk push notification:', error);
  }
}

module.exports = {sendBulkNotifications,sendNotification};