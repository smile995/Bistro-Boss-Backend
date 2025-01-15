const express = require('express')
const app = express()
const cors = require('cors');
const port = 5000;
require('dotenv').config()
// middleweres
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6uwuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("BistroDB");
    // database collection
    const foodCollection = database.collection("foods");
    const cartCollection = database.collection("carts");
    const reviewCollection = database.collection("reviews");
    // foodCollection related CRUD operations
    app.get("/foods",async(req,res)=>{
        const result= await foodCollection.find().toArray();
        res.status(200).send(result)
    })
    // cartCollection related CRUD operations
    app.get('/carts',async(req,res)=>{
      const result= await cartCollection.find().toArray();
      res.status(200).send(result)
    })
    // reviewCollection related CRUD operations
    app.get('/reviews',async(req,res)=>{
      const result= await reviewCollection.find().toArray();
      res.status(200).send(result)
    })
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})