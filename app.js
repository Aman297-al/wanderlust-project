if(process.env.NODE_ENV !== "production"){
  require("dotenv").config( { quiet: true });
} 


const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilss/ExpressError.js")
const session = require("express-session")
const MongoStore = require('connect-mongo').default;;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 
const userRouter = require("./router/userrouter.js");





// ==============Add Express Router============== 


const listings = require("./router/listrouter.js")
const reviewRouter = require("./router/reviewrouter");
const user = require("./models/user.js");
const { error } = require("console");



// ================== MongoDB Connection ==================
// MongoDB Connection setup

const dbUrl = process.env.ATLASDB_URL 

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


// ================== App Config ==================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// ===================Expression- Session=============

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
  secret: process.env.SECRET,  
},
  touchAfter: 24*60*60
});

store.on("error",() =>{
  console.log("session store error", error);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
  expires: Date.now() + 7*24*60*60*1000,
  maxAge: 7*24*60*60*1000,
  httpOnly: true,
  secure: false
}
}


// ================== Root Path ==================
// app.get("/",(req, res)=>{
//     res.send("Hi I am root");
// });

// ====================Express-session use=========



app.use(session(sessionOptions));
app.use(flash());


// ================== Passport Config ==================
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); // ye line hamne user model me plugin passport local mongoose use kiya hai uske wajah se hamko authenticate method mil gaya hai jo ki user ke username aur password ko verify karta hai

// serialize and deserialize user (for session) 
// means jab user login karega to uska data session me store hoga aur jab bhi user request karega to session se data nikal ke use kar sakte hai
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===============Middleware For Flash =============

app.use((req, res, next) =>{
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currentUser = req.user;
  next();
});


// ===========DEMO User==========
// app.get("/demouser", async (req, res) =>{
//   let fakeUser = new User({
//     email: "test@example.com",
//     username: "testuser"
//   });
// let registeredUser = await User.register(fakeUser, "password123");
//   res.send(registeredUser);
// });


// ====================Express router use=========
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



// textListing Path (insert data in collection)

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save(); 
//     console.log("sample testing");
//     res.send("successful testing");
// })


// All your routes above this

// 404 handler (NO path here)
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});


// error handle (for price me ham number ki jagah per string fill kare to ye error generate ho jayega )

app.use((err, req, res, next) =>{
  let {statusCode = 500 , message = "something went wrong"} = err;    //expresserror code
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", {message})
});

app.listen(8080,() =>{
    console.log("server is listening to port 8080");
});

