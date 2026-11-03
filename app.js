
if(process.env.NODE_ENV!="production"){
require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate= require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const { date } = require("joi");



app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //paras
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate); // creating the template 
app.use(express.static(path.join(__dirname,"/public")));




const dbUrl = process.env.ATLASDB_URL;



main().then((res) =>{
    console.log("connected to db");
})
.catch((err) =>{
    console.log(err);
})


async function main(){
    await mongoose.connect(dbUrl);

}




const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in the Mongo Session Store", err);
});



const sessionOption = {
    store,
    secret:process.env.SECRET, 
    resave:false, 
    saveUninitialized:true,
    cokkies:{
        expires:Date.now() + 7* 24 * 60 * 60 * 1000,  // again login is not required upto 7 days
        maxAge:7* 24 * 60 * 60 * 1000,
        httpOnly:true
    },
};
 


app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //usage in one session user need is to login only once
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());// to store the information related to user -- serializer
passport.deserializeUser(User.deserializeUser());// to not to store the information related to user -- deserializer



 

app.use((req, res,next) =>{
  res.locals.successMsg = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

    next();
});




app.use("/",(req, res) =>{
    res.send("I'm the root element")
});


// app.get("/demouser", async(req, res) =>{
// let fakeUser = new User({
//     email:"student@gmail.com",
//     username:"delta-student"
// });
//  let registeredUser = await User.register(fakeUser, "helloworld"); // register--. check  username is unique or not
//  res.send(registeredUser);

// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


//new route

app.get("/listings/new", (req, res) =>{
    res.render("new.ejs")
})

//error handling

app.all("/*splat", (req, res,next) =>{
    next(new ExpressError(404,"page not found"));   // in the new version of express * is changed to /*splat
});

app.use((err, req, res,next) =>{
    let{status=500,message="something went wrong"} = err;
    res.status(status).render("error.ejs",{message});
    // res.status(status).send(message);
    // res.send("something went wrong");
});


app.listen(8080, () =>{
    console.log("Server is listening to port 8080");
});


