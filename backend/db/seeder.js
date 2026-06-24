require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const backupUri = "mongodb+srv://Volinipriya06:volinipriya06@ethiscan-db.dbij92s.mongodb.net/EthiScan";
process.env.MONGO_URI = process.env.MONGO_URI || backupUri;

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const connectDatabase = require("./connection");

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    barcode: { type: String, required: true },
    score: { type: Number, default: 50 },
    category: { type: String, default: "WARNING" },
    sector: { type: String, default: "General" },
    description: { type: String, default: "No verification details provided." }
});
BrandSchema.index({ name: "text" });
BrandSchema.index({ barcode: 1 });

const Brand = mongoose.model("Brand", BrandSchema);

const runSeeder = async () => {
    await connectDatabase();
    
    console.log("Clearing historical collections...");
    await Brand.deleteMany({});
    
    const csvFilePath = path.join(__dirname, "../../brands_50k.csv");
    if (!fs.existsSync(csvFilePath)) {
        console.error(`Execution Fault: Please ensure your dataset is saved at: ${csvFilePath}`);
        process.exit(1);
    }

    let batch = [];
    const BATCH_SIZE = 1000;
    let totalInserted = 0;

    console.log("Initializing high-velocity stream processing for 50k dataset...");

    const stream = fs.createReadStream(csvFilePath);

    stream
        .pipe(csv())
        .on("data", async (row) => {
            batch.push({
                name: row.name || row.Name || "Unknown Brand",
                barcode: row.barcode || row.Barcode || row.upc || "000000000000",
                score: parseInt(row.score || row.Score || 50, 10),
                category: (row.category || row.Category || "WARNING").toUpperCase(),
                sector: row.sector || row.Sector || "General",
                description: row.description || row.Description || "Automated baseline profile tracking initialized."
            });

            if (batch.length === BATCH_SIZE) {
                stream.pause();

                const currentBatch = [...batch];
                batch = [];

                try {
                    await Brand.insertMany(currentBatch);
                    totalInserted += currentBatch.length;
                    console.log(`Stream pipeline progress metrics pipeline progress: Inserted ${totalInserted} entries...`);
                    stream.resume();
                } catch (err) {
                    console.error("Batch synchronization checkpoint anomaly:", err.message);
                    stream.resume();
                }
            }
        })
        .on("end", async () => {
            if (batch.length > 0) {
                try {
                    await Brand.insertMany(batch);
                    totalInserted += batch.length;
                } catch (err) {
                    console.error("Final batch insert anomaly:", err.message);
                }
            }
            console.log(`\nSUCCESS: Database cluster completely mapped. Total records indexed: ${totalInserted}`);
            process.exit(0);
        });
};

runSeeder();