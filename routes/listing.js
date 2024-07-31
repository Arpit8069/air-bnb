 const express = require("express");
 const router = express.Router();
 const wrapAsync = require("../utils/wrapAsync.js");
 const ExpressError = require("../utils/ExpressError.js");
 const {listingSchema} = require("../schema.js");
 const Listing = require("../models/listing.js");
 

 
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

// Index Route

router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("../views/listings/index.ejs", { allListings });
  }));
  
  // New Route
  router.get("/new",  (req, res) => {
    res.render("../views/listings/new.ejs");
  });
  
  // Show Route
  router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); 
    res.render("../views/listings/show.ejs" , { listing });
  }));
  
  // Create Route
  router.post(
    "/listings",validateListing,
    wrapAsync(async (req, res, next) => {
      // let {title,description, image,price, country, location} = req.body;
     
      const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New listing reated!");
        res.send("hii");
      // res.redirect("/listings");
    })
  );
  
  
// Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("../views/listings/edit.ejs", { listing });
  }));
  
  // Update Route
  router.put("/:id",validateListing, wrapAsync(async (req, res) => {
  
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  // Delete Route
  router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedList = await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings");
  }));
  


  module.exports = router;