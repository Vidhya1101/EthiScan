const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");

const Brand = require("./models/Brand");

mongoose.connect("mongodb+srv://naturereplicate8068_db_user:gMdsjmTdBpU5TIJv@cluster0.n9n43d9.mongodb.net/ethiscan?appName=Cluster0");

const results = [];

fs.createReadStream("brands_50k.csv")
    .pipe(csv())

    .on("data", (data) => {

        results.push({

    brandName: data.brandName,

    industry: data.industry || "General",

    ethicalScore: isNaN(Number(data.ethicalScore))
        ? 0
        : Number(data.ethicalScore),

    category: data.category || "WARNING",

    country: data.country || "Unknown",

    pros: data.pros || "",

    cons: data.cons || "",

    sustainability: data.description || "",

    alternatives: data.alternatives
        ? data.alternatives.split(",")
        : []
});

    })

    .on("end", async () => {

        try {

            await Brand.deleteMany({});

            await Brand.insertMany(results);

            console.log("50K Brands Imported Successfully");

            process.exit();

        } catch (error) {

            console.log(error);
        }
    });