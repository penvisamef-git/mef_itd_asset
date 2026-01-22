const mongoose = require("mongoose");
require("dotenv").config();


const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.tlmw9h3.mongodb.net/mef_itd_assets?retryWrites=true&w=majority&appName=Cluster0`;


const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB Atlas successfully!");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB Atlas:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
