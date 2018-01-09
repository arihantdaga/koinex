var express = require('express');
var router = express.Router();
const notifcont = require("../controllers/onesignal");
let mongoose = require("mongoose");
let LimitModel = mongoose.model("Limit");

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  console.log("sending file");
  return res.sendfile("public/dist/index.html");
});
router.post("/sendNotification", function(req,res,next){
  console.log(req.body);
  // return res.json({status:1});
  let notification_data = {
      "data": { type: req.body.topic || "Unknown"},
      "contents": { "en": req.body.message || "Something Happened, Just Check it broh" },
      "include_player_ids": ["e6b72da4-6303-4350-8fdc-3822fa16ecf0"],
      // "included_segments":["All Users"],
      "headings": { "en":  req.body.topic || "Unknown"}
  }

  notifcont.sendNotification(notification_data).then(data=>{
    console.log(data);
    return res.json({status:1});
  }).catch(err=>{
    return next(err);
  })
});

router.get("/limits", function(req,res,next){
  if(!req.query.currency){
    return res.json({});
  }
  let currency = req.query.currency;

  LimitModel.find({currency:req.query.currency}).lean().exec().then(data=>{
    if(!data || !data.length){
      return res.json({});
    }
    let limits = {[currency]:[]};
    limits[currency] = data;
    return res.json(limits);
  }).catch(err=>{
    return next(err);
  });

  // let limits = {
  //   ripple:[
  //     {lt: 220},
  //     {lt: 190},
  //     {gt: 240},
  //     {gt: 250}
  //   ]
  // };
  
  // return res.json(limits);
});

router.post("/limit",function(req,res,next){
  let limit = new LimitModel(req.body);
  console.log(req.body);

  limit.save((err,data)=>{
    console.log(data);
    console.log(err);

    if(err){
      return next(err);
    }
    return res.json({data:data});
  });
});

router.post("/limit/edit", (req,res,next)=>{
  if(!req.body._id){
    return next({status:400, message:"Invalid id"});
  }
  let setObject = {...req.body};

  LimitModel.update({_id: req.body._id}, {
    $set: setObject
  }).then(data=>{
    return res.json({status: 1});
  }).catch(err=>{
    return next({status: 500, message:error.message || "Unknown error in deleting limit"});
  })

})
router.post("/limit/delete", (req,res,next)=>{
  if(!req.body._id){
    return next({status:400, message:"Invalid id"});
  }
  LimitModel.findOneAndRemove({_id: req.body._id}, (error,success)=>{
    if(error){
      return next({status: 500, message:error.message || "Unknown error in deleting limit"});
    }
    return res.json({status: 1});
  })

});

module.exports = router;
