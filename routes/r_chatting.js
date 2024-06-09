const express = require("express");
const router = express.Router();
const TableModel = require("../models/m_chatting");
const rc = require("./../controllers/responseController");
const UserTable = require("../models/m_user_login");
const Messages = require("../models/m_message");
const conversationUser = require("../models/m_chatting_users.message");
const authenticate = require("../config/user_auth");
const asyncErrorHandler = require("../utilis/asyncErrorHandler");
const User_login = require("../models/m_user_login");
const { sendNotification } = require("../controllers/push_notification");

router.post(
  "/create",
  asyncErrorHandler(async (req, res, next) => {
    const { from, to, message } = req.body;
    // first check from and to user is exist or not in the conversationUser collection
    if (to == "11111")
      return res.json({
        success: false,
        msg: "You can't send message to this user",
      });
    const fromUser = await conversationUser.findOne({ user_id: from });
    const toUser = await conversationUser.findOne({ user_id: to });
    if (!fromUser) {
      await conversationUser.create({
        user_id: from,
        conversations: [{ user_id: to }],
      });
    } else {
      const exist = fromUser.conversations.find((conversation) => {
        if (conversation.user_id.toString() === to) {
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
    if (!toUser) {
      await conversationUser.create({
        user_id: to,
        conversations: [{ user_id: from }],
      });
    } else {
      const exist = toUser.conversations.find((conversation) => {
        if (conversation.user_id.toString() === from) {
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
      const User = await UserTable.Table.findOne(
        { username: from },
        { _id: 0, username: 1, user_profile_pic: 1, user_nick_name: 1 }
      );
      if (User) {
        const User1 = await UserTable.Table.findOne(
          { username: to },
          { device_token: 1, _id: 0 }
        );
        if (User1.device_token) {
          let message = `${User.user_nick_name} sent you a message`;
          await sendNotification(User1.device_token, message);
        }
      }
      return res.json({
        success: true,
        msg: "Message added successfully.",
        data: data,
      });
    } else
      return res.json({
        success: false,
        msg: "Failed to add message to the database",
      });
  })
);

router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.getData((err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "All Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.get(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    TableModel.getDataById(id, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: doc,
        });
      }
    });
  }
);

router.post(
  "/byField",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        let arr = new Array();
        for (let x in Object.keys(docs)) arr[x] = docs[x].to_user_id;
        let unique = arr.filter((item, i, ar) => ar.indexOf(item) === i);
        // console.log(unique);
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: { chatWiths: unique },
        });
      }
    });
  }
);

router.post(
  "/byFields",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        /**
         * @description this function for sorting the data based on date and time
         */

        function compare(a, b) {
          if (a.created_at < b.created_at) {
            return -1;
          }
          if (a.created_at > b.created_at) {
            return 1;
          }
          return 0;
        }

        docs.sort(compare);
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);
router.post(
  "/chatwiths",
  asyncErrorHandler(async (req, res, next) => {
    const { primary_user } = req.body;
    if (
      !primary_user ||
      primary_user == "" ||
      primary_user == null ||
      primary_user == undefined
    )
      return res.json({
        success: false,
        msg: "Please provide primary user",
      });
    const isUser = await conversationUser.findOne({ user_id: primary_user });
    if (!isUser) {
      return res.json({
        success: false,
        msg: "No chat found with anyone",
      });
    }
    // sort
    // Your sorting logic remains the same
    isUser.conversations.sort((a, b) => {
      return b?.updated_at - a?.updated_at;
    });

    // Extract user_ids after sorting conversations
    const users = isUser.conversations.map((conversation) => {
      return conversation.user_id;
    });

    // Aggregate pipeline to fetch user details and maintain the sorted sequence
    const user_details = await User_login.aggregate([
      {
        $match: {
          username: {
            $in: users,
          },
          status: "unblock",
        },
      },
      {
        $addFields: {
          sort_order: {
            $indexOfArray: [users, "$username"],
          },
        },
      },
      {
        $sort: {
          sort_order: 1, // Sort based on the sort_order field
        },
      },
      {
        $project: {
          username: 1,
          user_profile_pic: 1,
          user_nick_name: 1,
          email: 1,
          sort_order: 1, // Optionally exclude sort_order if not needed in the output
        },
      },
    ]);
    if (!user_details) {
      return res.json({
        success: false,
        msg: "Something went wrong",
      });
    }
    return res.json({
      success: true,
      msg: "Data fetched",
      data: user_details,
    });
  })
);

/**
 * @description this router get the message of specific to user to friend @jokhendra
 */

router.post("/getmsg", async (req, res, next) => {
  try {
    const { from, to } = req.body;
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    // console.log(messages);
    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from ? "sender" : "receiver",
        message: msg.message.text,
        time: msg.time,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
});

router.put(
  "/update/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.updateRow(req.params.id, req.body, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Updated",
          data: docs,
        });
      }
    });
  }
);

router.delete(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.deleteTableById(req.params.id, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Deleted",
          data: docs,
        });
      }
    });
  }
);

module.exports = router;
