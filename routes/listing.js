const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");
const listing = require("../Models/listing.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

// Index Route
router.get("/",wrapAsync( async (req,res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});


// Show Route
router.get("/:id",wrapAsync( async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id).populate("reviews");
    if(!Listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("")
    }
    res.render("listings/show.ejs", {Listing});
}));

//Create Route
router.post("/",validateListing, wrapAsync( async (req, res, next) => {
    const newListing = new listing(req.body.listings);
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
    
}));

// Edit Route
router.get("/:id/edit",wrapAsync( async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    if(!Listing){
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("")
    }
    res.render("listings/edit.ejs", {Listing});
}));

//Update Route
router.put("/:id",validateListing, wrapAsync( async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listings});
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",wrapAsync( async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;