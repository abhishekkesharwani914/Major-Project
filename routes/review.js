const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../Models/review.js");
const ExpressError = require("../utils/ExpressErrors.js");
const listing = require("../Models/listing.js");

//Validating Review
const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

//Reviews
//Post Review Route
router.post("/",validateReview,wrapAsync(async(req, res) => {
    let Listing = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    Listing.reviews.push(newReview);

    await newReview.save();
    await Listing.save();

    req.flash("success", "New Review Created");
    res.redirect(`/listings/${Listing._id}`);
}));

//Delete Review Route
router.delete("/:reviewId",wrapAsync(async(req, res) =>{
    let {id, reviewId} = req.params;
    await listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});// here id is pass from which we want to delete review, pull = delete from id, reviews is review array iside that id and reviewId is Id of review which we want to delete review
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);


}));

module.exports = router;