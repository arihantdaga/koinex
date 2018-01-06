var express = require('express');
var router = express.Router();
const notifcont = require("../controllers/onesignal");

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  return res.sendFile("/public/index.html");
});
router.post("/sendNotification", function(req,res,next){
  console.log(req.body);
  return res.json({status:1});
});
router.get("/limits", function(req,res,next){
  let limits = {
    ripple:[
      {lt: 220},
      {lt: 190},
      {gt: 240},
      {gt: 250}
    ]
  };
  
  return res.json(limits);
});

router.post("/limit",function(req,res,next){
  return res.json({status:1});
});

module.exports = router;
