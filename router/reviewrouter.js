const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utilss/wrapAsync.js")
const ExpressError = require("../utilss/ExpressError.js")

const Review = require("../models/review.js");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


const reviewController = require("../controllers/reviewCon.js"); 

// ================== REVIEW POST Route ==================

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


// ================== REVIEW DELETE Route ==================

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync( reviewController.deleteReview));

module.exports = router;