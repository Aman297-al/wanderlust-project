const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilss/wrapAsync.js");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listController = require("../controllers/listCon.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ================== INDEX & CREATE ==================
router.route("/")
  .get(wrapAsync(listController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),   // ✅ FIXED HERE
    validateListing,
    wrapAsync(listController.createListing)
  );


// ================== NEW ==================
router.get(
  "/new",
  isLoggedIn,
  listController.renderNewForm
);


// ================== SHOW, UPDATE & DELETE ==================
router.route("/:id")
  .get(wrapAsync(listController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listController.deleteListing)
  );


// ================== EDIT ==================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listController.editListing)
);


module.exports = router;