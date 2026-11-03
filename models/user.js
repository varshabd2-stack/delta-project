
const  mongoose  = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;  // this is older version hence nedd to add default or install npm i passpoer-local-mongoose@8
const userSchema = new Schema({
    email:{
        type:String,
        required:true
    },   
});


userSchema.plugin(passportLocalMongoose);  //it automatically write the username and password --> plugin

module.exports = mongoose.model('User', userSchema);