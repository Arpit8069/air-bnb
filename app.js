const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const Listing = require("./models/listing.js");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session")
const {reviewSchema, listingSchema} = require("./schema.js");

const cookieParser = require("cookie-parser");
const flash= require("connect-flash");
const Review = require("./models/review.js")
// const Listing = require("./models/listing.js");

// const listings = require("./routes/listing.js");
// const Reviews = require("./routes/review.js")

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




 
const validateListing = (req, res , next) => {
  let {error} = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    console.error(errMsg);
    throw new ExpressError(400, errMsg);
  } else{
    next();
  }
};


const validateReview = (req, res, next) => {
  let {error} = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }else {
    next();
  }
};


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

app.use((req, res, next) => {
  res.locals.success =  req.flash("success");
  next();  
});

// app.use("/listings", listings);
// app.use("/listings/:id/reviews", Reviews);



// Index Route

app.get("/listings/", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get("/listings/new",  (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews"); 
  res.render("listings/show.ejs" , { listing });
}));

// Create Route
app.post(
  "/listings/listings",validateListing,
  wrapAsync(async (req, res, next) => {
    // let {title,description, image,price, country, location} = req.body;
   
    const newListing = new Listing(req.body.listing);
      await newListing.save();
      req.flash("success", "New listing reated!");
      // res.send("hii");
    res.redirect("/listings");
  })
);


// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {

  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;s
  const deletedList = await Listing.findByIdAndDelete(id);
  console.log(deletedList);
  res.redirect("/listings");
}));




// Reviews
// Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync (async (req, res) =>{
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

 res.redirect(`/listings/${listing._id}`);

}));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync (async (req, res)=>{
  let {id, reviewId} = req.params;

  await Listing.findByIdAndUpdate(id,  {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);   
}) )




app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let {statusCode=500, message = "Something went wrong!"} = err;
  res.status(statusCode).render("listings/error.ejs", {message});
  // res.status(statusCode).send(message);
});






app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
 

