// const OneSignalClient = require('node-onesignal');
// const client = new OneSignalClient("058ee646-2b3f-46ab-a836-5d172a462b92", "Nzc5ZWNmZWEtODlhOS00ODg1LWE1YjQtNGRhZDRiMjFiMzk0");
const https = require("https");

function sendNotification(data) {
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic Nzc5ZWNmZWEtODlhOS00ODg1LWE1YjQtNGRhZDRiMjFiMzk0"
    };
    data.app_id = "058ee646-2b3f-46ab-a836-5d172a462b92";

    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers,
      data:data
    };
    var promise = new Promise((resolve,reject)=>{
      var req = https.request(options, function(res) {  
        res.on('data', function(data) {
          try{
              resolve(JSON.parse(data));
          }catch(err){
              reject("Notification API Invalid response");
          }
        });
      });
      
      req.on('error', function(e) {
          console.log(e);
          reject(e.message);
      });
      req.write(JSON.stringify(data));
      req.end();
    });
  
    return promise; 
  }

module.exports = {
    sendNotification
}