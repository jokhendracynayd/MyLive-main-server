const mongoose = require('mongoose');
const TableName = "sticker_gifting_transaction";
const TableSchema = mongoose.Schema({
    sender_UID: {
        type: String,
        required: true
    },
    receiver_UID: {
        type: String,
        required: true
    },
    role_of_receiver: {
        type: String,
        enum:['host','co-host'],
        required: true,
    },
    stickerId: {
        type: mongoose.Types.ObjectId,
        ref: 'sticker_master',
        required: true
    },
    liveStreamingId:{
        type: mongoose.Types.ObjectId,
        ref: 'live_streaming',
        required: true
    },
    giftPrice:{
        type: Number,
        required: true
    },
    giftQuantity:{
        type: Number,
        required: true,
        default:1
    },
},{ timestamps: true });

const StickerTransacationModel = mongoose.model(TableName, TableSchema);

module.exports = StickerTransacationModel;