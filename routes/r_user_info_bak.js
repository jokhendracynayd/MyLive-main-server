var express=require('express');
var app=express();
var mongoose=require('mongoose');
var User=require('./models/user_info.js');
var bodyParser=require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/dona_live",{ useUnifiedTopology: true, useNewUrlParser: true});

var conection=mongoose.connection;

conection.once('open',function(){

	console.log("connection successfully...");
});

app.set('view engine','ejs');

app.get('/',function(req,res){

	res.render('insert');

});

app.post('/insert',function(req,res){

	var user=new User({

		id:req.body.id,
        user_id:req.body.user_id,
        user_first_name:req.body.user_first_name,
        user_middle_name:req.body.user_middle_name,
        user_last_name:req.body.user_last_name,
        user_alter_name:req.body.user_alter_name,
        user_alter_mobile:req.body.user_alter_mobile,
        user_curr_loc_lat:req.body.user_curr_loc_lat,
        user_curr_loc_long:req.body.user_curr_loc_long,
      
        
	})

	user.save((success, err)=>{

		// if(success.message){

		// }else{

		// }
		console.log(success);
		// res.send(err.message);
	})

});

app.get('/show',function(req,res){

	var user_info = '';

	User.find({},function(err,result){

		res.render('show',{users:result});

			res.render('show');
	});


});

app.get('/delete/:id',async function(req,res){

	await User.findByIdAndDelete(req.params.id);

	res.redirect('/show');

});

app.get('/edit/:id',function(req,res){

      User.findById(req.params.id,function(err,result){

			res.render('edit',{users:result});

	})

});

app.post('/update/:id',async function(req,res){

 	await User.findByIdAndUpdate(req.params.id,req.body);

 	res.redirect('/show');

});

var server=app.listen(4000,function(){

	console.log("Go to port number 4000")

});