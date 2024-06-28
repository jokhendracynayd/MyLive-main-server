const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_banner');
const rc = require('../controllers/responseController');
const passport = require("passport");
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const API = require('../config/api');
router.route('/get-all').get(asyncErrorHandler(async (req, res) => {
    const result = await TableModel.find({});
    if(result.length){
        result.forEach(ele=>{
            ele.banner_path=`${API.Api}/file/downloadBanner/${ele.banner_path}`;
        })
    }
    return res.json({
        success: true,
        msg: 'Data fetched successfully',
        data: result
    })
}));

module.exports = router;