const Listing = require("../models/listing");  
const axios = require("axios");

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("./listings/index", { alllistings });
};



module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};



module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", {
    listing,
    mapToken: process.env.MAP_TOKEN
  });
};



module.exports.createListing = async (req, res) => {

    // 1️⃣ Location text lo
    const location = req.body.listing.location;

    // 2️⃣ MapTiler Geocoding API call
    const geoResponse = await axios.get(
        `https://api.maptiler.com/geocoding/${location}.json?key=${process.env.MAP_TOKEN}`
    );

    if (!geoResponse.data.features.length) {
        req.flash("error", "Invalid location!");
        return res.redirect("/listings/new");
    }

    // 3️⃣ New listing create karo
    const newListing = new Listing(req.body.listing);

    // 4️⃣ Image save karo
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };

    // 5️⃣ Geometry save karo
    newListing.geometry = geoResponse.data.features[0].geometry;

    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};



module.exports.editListing =   async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
   if (!listing) {
    req.flash("error", "listing does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });

let originalImageUrl = listing.image.url;
originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300") ;
res.render("listings/edit.ejs", { listing, originalImageUrl});
};





module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if ( typeof req.file !== "undefined") { 
  let  url = req.file.path;
  let fiename = req.file.filename;
  listing.image = { url, filename: fiename};
  await listing.save(); 
  };

  req.flash("success", "Listing Updated!");
  res.redirect("/listings");
};



module.exports.index = async (req, res) => {
  try {
    let { category, search } = req.query;

    let filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } }
      ];
    }

    console.log("FILTER:", filter);

    const alllistings = await Listing.find(filter);

    res.render("listings/index", { 
      alllistings, 
      category 
    });

  } catch (err) {
    console.log(err);
  }
};