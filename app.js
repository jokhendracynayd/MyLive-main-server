// Production:

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
// var UserLoginModel = require("./models/m_user_login");
// var config = require('./config/database');
// var io=require("socket.io")
require('./routes/cron_job')
const globalErrorHandler = require("./controllers/errorController");
// const logger = require("./utilis/logger");


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use((req, res, next) => {
  // req.logger = logger;
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "50mb" })); // req.body ---> form data fetch krne ke lie || body parser can also be used in this place.
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const file = require("./routes/file");
app.use("/api/file", file);

const fileConvert=require('./routes/convertTopdf/r_fileConvert');
app.use("/api/fileConvert",fileConvert);
const {profitController,currentGameProfit} = require('./controllers/gamesProfit')
app.get('/api/game-profit/:type',profitController)
app.get('/api/current-game-profit',currentGameProfit)


// // url logging start
// const jwt = require("jsonwebtoken");

// app.use(function (req, res, next) {
//   if (req.headers.authorization) {
//     const authHeader = req.headers.authorization.split(" ")[1];
//     // verify a token symmetric - synchronous
//     var decoded = jwt.verify(authHeader, config.secret);
//     // console.log(req.headers);
//     if (req.headers) {  
//       UserLoginModel.updateLastRoute(
      
//         decoded.id,
//         req.url,
//         req.method,
//         req.headers,
//         Object.assign({}, req.params),
//         Object.assign({}, req.body)
//       );

//       // console.log(decoded);
//     }
//   }
//   next();
// });
// url logging end

/*** ################################## Importing routers start ########################################### */
// import Routers





const indexRouter= require("./routes/index");
const userLogin= require("./routes/r_user_login");
const OTPGen= require("./routes/r_otp_gen");
const AgoraToken= require("./routes/r_agora_token");
const LiveStramingRouter= require("./routes/r_live_streaming");
const comments= require("./routes/r_comments");
const LiveStreamingUserJoined= require("./routes/r_live_streaming_user_joined");
const MessagingSystem= require("./routes/r_chatting");
const SMSSystem= require("./routes/r_sms");
const userInformation= require("./routes/r_user_info");
const LiveStreamingJoinUserRequest  = require("./routes/r_live_streaming_join_user_requests");
const OfficalTelent= require("./routes/r_offical_talent");
const SubAdmin= require("./routes/r_sub_admin");
const StcikerMaster= require("./routes/r_sticker_master");
const userLevel= require("./routes/r_user_level");
const coinsConfiguration= require("./routes/r_coins_configurations");
const agencyInformation= require("./routes/r_agency_info");
const SupportMessage= require("./routes/r_support");
const UserFollowFollwing= require("./routes/r_user_follower");
const chattingSystem= require("./routes/r_chatting");
const walletBalance= require("./routes/r_user_wallet_balance");
const gifting= require("./routes/r_user_gifting");
const transaction= require("./routes/r_user_wallet_trxn");
const stickerPath= require("./routes/r_user_trxn_sticker");
const payment= require("./routes/r_paytment");
const userCurrentBalance= require("./routes/r_user_current_balance");
const reseller_agency_tranx=require('./routes/r_reseller_agency_balence_tranx');
const reseller_agency_balance=require('./routes/r_reseller_agency_balence');
const banner=require('./routes/r_banner');
const announcement = require('./routes/r_annoumcement');
const teen_Pati=require('./routes/teen_pati/r_game_teen_pati')
const fruit_game=require('./routes/teen_pati/r_game_fruit')
const transaction_history=require('./routes/r_transactions');
const moderator=require('./routes/r_moderator');
const giftingPath = require('./routes/r_gifting');
const vipItems = require('./routes/r_vip.items');

/*** ################################## Importing routers ends ########################################### */



/*** ################################## Apply routers in middleware starts ########################################### */
// Applying Routes As A Middleware


app.use("/", indexRouter);
app.use("/api/user_login", userLogin);
app.use("/api/otp_gen", OTPGen);
app.use("/api/AgoraToken", AgoraToken);
app.use("/api/live_streaming", LiveStramingRouter);
app.use("/api/comments", comments);
app.use("/api/liveStreamingUserJoined", LiveStreamingUserJoined);
app.use("/api/MessagingSystem", MessagingSystem);
app.use("/api/SMSSystem", SMSSystem);
app.use("/api/userInformation", userInformation);
app.use("/api/LiveStreamingJoinUserRequest", LiveStreamingJoinUserRequest);
app.use("/api/OfficalTelent", OfficalTelent);
app.use("/api/SubAdmin", SubAdmin);
app.use("/api/StcikerMaster", StcikerMaster);
app.use("/api/userLevel", userLevel);
app.use("/api/coinsConfiguration", coinsConfiguration);
app.use("/api/Agency", agencyInformation);
app.use("/api/SupportMessage", SupportMessage);
app.use("/api/UserFollowFollwing", UserFollowFollwing);
app.use("/api/chattingSystem", chattingSystem);
app.use("/api/walletBalance",walletBalance);
app.use("/api/gifting",gifting);
app.use("/api/giftTransation",transaction);
app.use("/api/StickerPath",stickerPath);
app.use("/api/userCurrentBalance",userCurrentBalance);
app.use("/api/payment",payment);
app.use("/api/reseller-agency-tranx",reseller_agency_tranx);
app.use("/api/reseller-agency-bal",reseller_agency_balance);
app.use("/api/banner",banner);
app.use("/api/announcement",announcement);
app.use("/api/teen-pati",teen_Pati);
app.use("/api/fruit-game",fruit_game);    
app.use('/api/transaction-history',transaction_history);
app.use('/api/moderator',moderator);
app.use('/api/giftings',giftingPath);
app.use('/api/vip',vipItems);


app.get('/api/version',(req,res)=>{
  res.json({
    version:'2.0.0',
    necessary_update:true,
    title:"Alert",
    description:`
          Whats New 
          10-09-2023
          - Resolved Video live issues
          - Resolved Gifting Issues
          - Resolved Audio Party Issues
    `,
  })
})

// catch 404 and forward to error handler

app.all('*',(req,res,next)=>{
  const err=new Error(`Can't find ${req.originalUrl} on this server`);
  err.status='fail';
  err.statusCode=404;
  next(err);
})

app.use(globalErrorHandler);

app.use(function (req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

// cron.schedule('*/10 * * * * *',()=>{
//   console.log('this is scheduler');
// })


module.exports = app;
