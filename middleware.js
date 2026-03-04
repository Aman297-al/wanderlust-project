const Listing = require("./models/listing");
const Review = require("./models/review");
const user = require("./models/user");
const { listingSchema } = require("./schema.js");
const ExpressError = require("./utilss/ExpressError.js");
const { reviewSchema } = require("./schema.js");


// ================== Authentication Middleware ==================
// if user is not logged in then he cannot create, edit or delete the listing and review

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  } 
  next();   
}


// middleware to save the url that user was trying to access before login and redirecting to that url after login

module.exports.saveRedirectUrl = async (req, res, next) => {
  if(req.session.redirectUrl ){
res.locals.redirectUrl = req.session.redirectUrl;
  }
  next(); 
}    



// ============== Authorization Middleware ==================
//if user is not owner of the listing then he cannot edit or delete the listing

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};


// ================== Validation Middleware ==================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};



// ================ validation require for review list item ================

module.exports. validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, errMsg);
  }
  next();
};


// ================== Authorization Middleware for review ==================
// if user is not author of the review then he cannot delete the review

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${listing._id}`);
  }
  next();
};