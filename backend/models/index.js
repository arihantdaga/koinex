let mongoose = require("mongoose");
let db = require("../config/db");
let {LimitSchema} = require("./Limit");

mongoose.model("Limit", LimitSchema);
module.exports = mongoose;

