const OneSignalClient = require('node-onesignal');
const client = new OneSignalClient("058ee646-2b3f-46ab-a836-5d172a462b92", "Nzc5ZWNmZWEtODlhOS00ODg1LWE1YjQtNGRhZDRiMjFiMzk0");

function sendNotification(){
    client.sendNotification();
}


module.exports = {
    sendNotification
}