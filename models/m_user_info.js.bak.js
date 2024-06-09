var mongoose=require('mongoose');

var newSchema=mongoose.Schema({

    id: {
        type: String,
    },
    user_id: {
        type: String,
    },
    user_first_name: {
        type: String,
    },
    user_middle_name: {
        type: String,
    },
    user_last_name: {
        type: String,
    },
    user_alter_name: {
        type: String,
    },
    user_alter_mobile: {
        type: Number,
    },
    user_curr_loc_lat: {
        type: String,
    },
    user_curr_loc_long: {
        type: String,
    },
    
});

module.exports=mongoose.model('user_info',newSchema);