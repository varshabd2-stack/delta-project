const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const Review =  require("../models/review.js");
const Listing =  require("../models/listting.js");
const {validateReview, isLoggedIn,isreviewAuthor} = require("../middleware.js");
const reviewcontroller = require("../controller/review.js");



//review post Route

router.post("/",isLoggedIn,validateReview,wrapAsync( reviewcontroller.createReview)); 

//delete review route

router.delete("/:reviewId",isreviewAuthor,isLoggedIn, wrapAsync(reviewcontroller.destroyReview));

module.exports = router;