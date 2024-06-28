// module.exports = _router;
var express = require("express");
var _router = express.Router();
var multer = require("multer");
var path = require("path");


// stores for all uploads 
var store = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});




// stores for agenecy
var store2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/agency");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});


// store for stickers
var store3 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./resources/stickers");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

// store for offical host documents
var store4 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/official_host");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

var store5=multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,"./uploads/banner");
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"_"+file.originalname);
    }
});

let store6 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./resources/vipItems");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

// configuring all uploads
var upload = multer({ storage: store }).single("file");
var upload2 = multer({ storage: store2 }).single("file");
var upload3 = multer({ storage: store3 }).single("file");
var upload4 = multer({ storage: store4 }).single("file");
var upload5 = multer({ storage: store5 }).single("file");
var upload6 = multer({ storage: store6 }).single("file");



// ############################# Uploading Routes ########################


// for uploading the banner

_router.post("/banner",function(req,res,next){
    upload5(req,res,function (err){
        if(err){
            return res.status(501).json({error:err})
        }
        return res.json({status:true,msg:"Uploaded Successfully",file:req.file})
    })
})

// for normal uploads
_router.post("/upload", function (req, res, next) {
    // console.log(req.file);
    upload(req, res, function (err) {

        if (err) {
            return res.status(501).json({ error: err });
        }
        //do all database record saving activity
        return res.json({status : true ,msg: "Uploaded Successfully", file: req.file });
        // return res.json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});


// for uploading the agency documenents
_router.post("/document_upload", function (req, res, next) {
    upload2(req, res, function (err) {

        if (err) {
            return res.status(501).json({ error: err });
        }
        //do all database record saving activity
        return res.json({status : true ,msg: "Uploaded Successfully", file: req.file });
    });
});


// for uploading the stickers
_router.post("/stickersUpload", function (req, res, next) {
    upload3(req, res, function (err) {

        if (err) {
            return res.status(501).json({ error: err });
        }
        //do all database record saving activity
        return res.json({status : true ,msg: "Uploaded Successfully", file: req.file });
        // return res.json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});

// for uploading the stickers
_router.post("/officialHostDocUpload", function (req, res, next) {
    upload4(req, res, function (err) {

        if (err) {
            return res.status(501).json({ error: err });
        }
        //do all database record saving activity
        return res.json({status : true ,msg: "Uploaded Successfully", file: req.file });
        // return res.json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});

// for uploading the vip items
_router.post("/vipItems/upload", function (req, res, next) {
    upload6(req, res, function (err) {

        if (err) {
            return res.status(501).json({ error: err });
        }
        //do all database record saving activity
        return res.json({status : true ,msg: "Uploaded Successfully", file: req.file });
        // return res.json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});

//##################### Downloading Routes #######################

// for downloading the files from banner folder

_router.get("/downloadHostDoc/:filename",(req,res)=>{
    filepath = path.join(__dirname,"/../uploads/official_host")+"/"+req.params.filename;
    res.sendFile(filepath);
})

_router.get("/downloadBanner/:filename",function(req,res,next){
    console.log("this is download banner",req.params.filename);
    filepath=path.join(__dirname,"/../uploads/banner")+"/"+req.params.filename;
    res.sendFile(filepath);
});

// for downloading the files from  uploads table
_router.get("/download/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../uploads") + "/" + req.params.filename;
    res.sendFile(filepath);
});
_router.get("/download/agency/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../uploads/agency") + "/" + req.params.filename;
    res.sendFile(filepath);
});

// for viewing the fles from upload folders
_router.get("/view/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../uploads") + "/" + req.params.filename;
    res.sendFile(filepath);
});

// for downloading the resource file
_router.get("/resources/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../resources/stickers") + "/" + req.params.filename;
    res.sendFile(filepath);
});


// for downloading the documents from resourses
_router.get("/supportingFiles/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../resources/supporting_images") + "/" + req.params.filename;
    res.sendFile(filepath);
});

// for downloading the documents from resourses
_router.get("/vipItems/:filename", function (req, res, next) {
    // console.log(path.join(__dirname, '/../uploads'));
    // res.json({});
    filepath = path.join(__dirname, "/../resources/vipItems") + "/" + req.params.filename;
    res.sendFile(filepath);
});


// inside multer({}), file upto only 10MB can be uploaded
// const upload = multer({
//     storage: storage
//     limits: { fileSize: 10000000 },
//     // this code goes inside the object passed to multer()
//     fileFilter: function (req, file, cb) {
//     }.single('file'),

//     function CheckFileType (req, file, cb) {    
//         // Allowed ext 
//          const filetypes = /jpeg|jpg|png|gif|pfd|doc|docx|excel|xls|json|csv|sql/;
      
//        // Check ext
//         const extname =  filetypes.test(path.extname(file.originalname).toLowerCase());
//        // Check mime
//        const mimetype = filetypes.test(file.mimetype);
      
//        if(mimetype && extname){
//            return cb(null,true);
//        } else {
//            cb('Error: Images Only!');
//        }
//       }
// });

module.exports = _router;
