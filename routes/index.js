var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dona Live API' , img: '../assets/img/DonaLive.png'});
});

module.exports = router;