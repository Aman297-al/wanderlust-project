const mongoose = require("mongoose");
const initData = require("./data.js"); // tumhara corrected data file
const Listing = require("../models/listing");

main()
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Make sure every listing has owner & category
  const fixedData = initData.data.map((obj) => {
    return {
      ...obj,
      owner: "699ada93713a8d48b15fd021", // apna user ObjectId
      category: obj.category || "Beach",  // agar category missing ho toh default
    };
  });

  await Listing.insertMany(fixedData);
  console.log("Database successfully initialized!");
};

initDB();

