const express = require("express");
const app = express();
const mongoose = require("mongoose");
const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";
const listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js")
const {listingSchema} = require("./schema.js");


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

const validateListing = (req, res, next) => {
    let error = listingSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
}

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
app.get("/listings",wrapAsync( async (req,res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", {allListing});
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


// Show Route
app.get("/listings/:id",wrapAsync( async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/show.ejs", {Listing});
}));

//Create Route
app.post("/listings",validateListing, wrapAsync( async (req, res, next) => {
    const newListing = new listing(req.body.listings);
    await newListing.save();
    res.redirect("/listings");
    
}));

// Edit Route
app.get("/listings/:id/edit",wrapAsync( async (req, res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    res.render("listings/edit.ejs", {Listing});
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync( async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listings});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync( async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404,"Page not found"));
})

// Error handler
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrongz"} = err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("Server is listening to the port : 8080");
});