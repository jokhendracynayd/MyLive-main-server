const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_banner');
const rc = require('../controllers/responseController');
const passport = require("passport");
const asyncErrorHandler = require('../utilis/asyncErrorHandler');
const API = require('../config/api');


router.route('/add-banner').post(asyncErrorHandler(async (req, res) => {
    const {banner_path,banner_name} = req.body;
    // validate all field avaiable or not   
    if (!banner_path || !banner_name) {
        return rc.response(res, 400, 'All fields are required');
    }
    // create the banner
    const newBanner = new TableModel({
        banner_path,
        banner_name
    });
    // save the banner
    await newBanner.save();
    return res.json({
        success: true,
        msg: 'Banner added successfully',
        data: newBanner
    });
}));

router.route('/').get(asyncErrorHandler(async (req, res) => {
    const result = await TableModel.find({});
    return res.json({
        success: true,
        msg: 'Data fetched successfully',
        data: result
    });
}));

router.route('/delete-banner/:id').delete(asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    // validate id
    if (!id) {
        return rc.response(res, 400, 'Id is required');
    }
    // delete the banner
    await TableModel.findByIdAndDelete(id);
    return res.json({
        success: true,
        msg: 'Banner deleted successfully'
    });
}));

router.route('/get-all').get(asyncErrorHandler(async (req, res) => {
    const result = await TableModel.find({},{banner_path:1,_id:0});
    let data = [];
    if(result.length){
        result.forEach(ele=>{
            data.push(`${API.Api}/file/downloadBanner/${ele.banner_path}`);
            // ele.banner_path=`${API.Api}/file/downloadBanner/${ele.banner_path}`;
        })
    }
    return res.json({
        success: true,
        msg: 'Data fetched successfully',
        data: data
    })
}));

module.exports = router;