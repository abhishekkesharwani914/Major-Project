const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../Models/listing.js");

const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongoURL);
};

const initDB = async () => {
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();