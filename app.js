const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session")

const  passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const cookieParser = require("cookie-parser");
const flash= require("connect-flash");
 
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
 

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));








const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

 
app.get("/", (req, res) => {
  res.send("Hi, i am root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success =  req.flash("success");
  res.locals.error =  req.flash("error");
  next();  
});

// app.get("/demoUser",wrapAsync( async (req, res)=>{
//   try {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username:"Arpit-kumar",
//   });
//   let newUser = await User.register(fakeUser, "password");
//   res.send(newUser);
// }catch(e) {
//   req.flash("error", e.message);
  
//   // console.log(e);
//   // res.send("error");
//   res.redirect("/signup");
// }

// }));


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter );

 


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let {statusCode = 400 , message = "Something went wrong!"} = err;
  res.status(statusCode).render("listings/error.ejs", {message});
  // res.status(statusCode).send(message);
});






app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
 

