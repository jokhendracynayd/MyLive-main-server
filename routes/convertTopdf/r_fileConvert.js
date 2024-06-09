const express = require("express");
const _router = express.Router();
const multer = require("multer");
const path = require("path");
const TableModel=require("../../models/m_official_talent");
const excelJs=require('exceljs')

_router.get('/:agencyId',async(req,res)=>{
    try {
        const code=req.params.agencyId;
        const workbook=new excelJs.Workbook();
        const worksheet=workbook.addWorksheet("My users");
        // worksheet.columns=[
        //     {header:'S_no',key:'s_no'},
        //     {header:'Name',key:'userName'},
        //     {header:'Email',key:'email'},
        //     {header:'Mobile',key:'mobile'},
        //     {header:'Collage',key:'collage'}
        // ]   
        let counter=1;
        const userData=TableModel.getDataByFieldName("agencyId",code,(err,docs)=>{
            if(err){
                console.log(err.message);
            }else{
                worksheet.columns=[
                    {header:'S_no',key:'s_no'},
                    {header:'User Id',key:"user_id",width: 12},
                    {header:'Name',key:"real_name", width:16},
                    {header:'National Id No',key:"nationalIdNo",width:15},
                    {header:'Mobile No',key:"mobile_no",width:12},
                    {header:'Country',key:"country",width:12},
                    {header:'State',key:"state",width:12},
                    {header:'Address',key:"address",width:32},

                ]  
                let count=1;
                docs.forEach(element => {
                    element.s_no=count++;
                    worksheet.addRow(element);
                });
                worksheet.getRow(1).eachCell(cell=>{
                    cell.font={bold:true,color: {argb:'db7612'}};
                    // cell.fill={bgColor:{argb:"423d37"}};
                    cell.alignment={vertical: 'center', horizontal: 'center'}
                })
                res.setHeader("Content-Type","application/vnd.openxmlformats-officaldocument.spreadsheatml.sheet")
                res.setHeader(
                        "Content-Disposition",
                        "attechment; filename=users.xlsx"
                    );
                    return workbook.xlsx.write(res).then(()=>{
                            res.status(200);
                        })
            }
        });

        // (await userData).forEach((user)=>{
        //     user.s_no=counter++;
        //     worksheet.addRow(user);
        // })
        // worksheet.getRow(1).eachCell((cell)=>{
        //     cell.font={bold:true};
        // })
        // res.setHeader(
        //     "Content-Type","application/vnd.openxmlformats-officaldocument.spreadsheatml.sheet"
        // );
        // res.setHeader(
        //     "Content-Disposition",
        //     "attechment; filename=users.csv"
        // );
        // return workbook.xlsx.write(res).then(()=>{
        //     res.status(200);
        // })
    } catch (error) {
        console.log(error.message);
    }
})



module.exports =_router;