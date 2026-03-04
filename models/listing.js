const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const listingSchema = new Schema({
    title: {
        type:String,
        required: true
    },

    description: {
        type:String,
    },

    image: {
  filename: String,
  url: String
},
    price: Number,
    location: String,
    country: String,
    
   reviews: [
  {
    type: Schema.Types.ObjectId,
    ref: "Review",
  }
],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  } ,
  geometry: {
    type: {
      type: String, 
      enum: ['Point'],
      required: true
    },  
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: {
    type: String,
    enum: [
    "Rooms",
    "Beach",
    "Hills",
    "Countryside",
    "City",
    "Camping",
    "Castles",
    "Farmhouse",
    "Unique Stays",
    "Nearby",
    "Amazing Pools",
    "Cabins",
    "Farms",
    "Island",
    "Arctic"],
    required: true
  } 

});


 listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing.reviews.length) {
    let res = await Review.deleteMany({ _id: { $in: listing.reviews } });
    console.log(res);
  }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
