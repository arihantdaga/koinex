var mongoose = require('mongoose');

const config = require("./config");


let connection = connect();
connection
  .on('error', function (error) {
    console.log("Error in database Connection");
    console.log(error);

  })
  .on('disconnected', reConnect)
  .once('open', listen);

connection.on('reconnected', function () {
  console.log('Database reconnected!');
});


function listen() {
  console.log("Database Connected");
}

function connect() {
  mongoose.connect(config.db.uri, config.db.options);
  return mongoose.connection;
  
}
function reConnect(){
  // Do nothing.
  console.log("Database Disconnectd");
}

module.exports = exports = connection;