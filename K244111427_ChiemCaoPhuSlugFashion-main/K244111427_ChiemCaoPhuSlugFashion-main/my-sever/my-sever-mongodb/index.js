const express = require('express');
const app = express();
const port = 3002;

const morgan=require("morgan")
app.use(morgan("combined"))

const path=require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname,"public")))

const cors=require("cors")
app.use(cors())
const bodyParser=require("body-parser")
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(port,()=>{
    console.log(`My Server listening on port ${port}`)
})

app.get("/",(req,res)=>{
    res.send("This Web server is processed for MongoDB")
})
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient("mongodb://127.0.0.1:27017");
const clientConnection = client.connect();
clientConnection.catch((error) => console.error("Unable to connect to MongoDB:", error));
const database = client.db("FashionData");      
const fashionCollection = database.collection("Fashion");

function createFashionSlug(value) {
    return String(value || "fashion")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/gi, "d")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

let fashionMetadataPromise;
function ensureFashionMetadata() {
    if (!fashionMetadataPromise) {
        fashionMetadataPromise = (async () => {
            await clientConnection;
            const fashions = await fashionCollection.find({}).sort({ IdF: 1 }).toArray();
            const usedIds = new Set();
            let nextId = fashions.reduce(
                (maximum, fashion) =>
                    Number.isSafeInteger(fashion.IdF) && fashion.IdF > maximum
                        ? fashion.IdF
                        : maximum,
                0
            );

            for (const fashion of fashions) {
                let id = fashion.IdF;
                if (!Number.isSafeInteger(id) || id < 1 || usedIds.has(id)) {
                    id = ++nextId;
                }
                usedIds.add(id);
                nextId = Math.max(nextId, id);

                const slug = `${createFashionSlug(fashion.fashion_subject || "fashion")}-${id}`;
                if (fashion.IdF !== id || fashion.slug !== slug) {
                    await fashionCollection.updateOne(
                        { _id: fashion._id },
                        { $set: { IdF: id, slug } }
                    );
                }
            }

            await fashionCollection.createIndex({ IdF: 1 }, { unique: true });
            await fashionCollection.createIndex({ slug: 1 }, { unique: true });
        })();
    }
    return fashionMetadataPromise;
}

app.get("/fashions",cors(),async (req,res)=>{
    try {
        await ensureFashionMetadata();
        const result = await fashionCollection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.error("Unable to load fashions:", error);
        res.status(500).send({ message: "Unable to load fashions" });
    }
});

app.get("/fashions/slug/:slug",cors(),async (req,res)=>{
    try {
        await ensureFashionMetadata();
        const result = await fashionCollection.findOne({ slug: req.params.slug });
        if (!result) {
            return res.status(404).send({ message: "Fashion not found" });
        }
        res.send(result);
    } catch (error) {
        console.error("Unable to load fashion by slug:", error);
        res.status(500).send({ message: "Unable to load fashion" });
    }
});

app.get("/fashions/:id",cors(),async (req,res)=>{
    try {
        await ensureFashionMetadata();
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).send({ message: "Invalid fashion id" });
        }
        const result = await fashionCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!result) {
            return res.status(404).send({ message: "Fashion not found" });
        }
        res.send(result);
    } catch (error) {
        console.error("Unable to load fashion:", error);
        res.status(500).send({ message: "Unable to load fashion" });
    }
});

