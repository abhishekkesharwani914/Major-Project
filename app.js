const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";
const listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");


app.set("view eingine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

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


app.get("/", (req,res) => {
    res.send("Hello route is working.");
});

// app.get("/testlisting", async (req, res) => {
//     let sampleListing = new listing({
//         title: "My  New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Sucessful Testing");
// });

// Index Route
app.get("/listings", async (req,res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", {allListing});
});

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


// Show Route
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", {Listing});
});

//Create Route
app.post("/listings", async (req, res) => {
    const newListing = new listing(req.body.listings);
    await newListing.save();
    res.redirect("/listings");
})

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/edit.ejs", {Listing});
});

//Update Route
app.put("/listings/:id", async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listings});
    res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id",async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.listen(8080, () => {
    console.log("Server is listening to the port : 8080");
});