const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = 5000;
require("dotenv").config();
// middleweres
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6uwuu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("BistroDB");
    // database collection
    const userCollection = database.collection("users");
    const foodCollection = database.collection("foods");
    const cartCollection = database.collection("carts");
    const reviewCollection = database.collection("reviews");
    // jwt token verify middlewere
    const varifyToken = async (req, res, next) => {
      const tokenBeerer = req?.headers?.authorization;
      const token = tokenBeerer.split(" ")[1];
      if (token) {
        jwt.verify(token, process?.env?.TOKEN_SECRET, (error, decoded) => {
          if (decoded) {
            req.decoded = decoded;
            next();
          } else if (error) {
            res.send("Forbidden Access" || error.message).status(401);
          }
        });
      } else {
        return res.send("Forbidden Access").status(401);
      }
    };
    // admin varifing middlewre
    const varifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.send({ message: "forbidden acess" }).status(403);
      } else {
        next();
      }
    };
    // jwt token generate
    app.post("/jwt", async (req, res) => {
      const user = req?.body;
      const secret = process?.env?.TOKEN_SECRET;
      const token = jwt.sign(user, secret, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
    // userCollection related CRUD operations
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user?.email };
      const isExist = await userCollection.findOne(query);
      if (!isExist) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      } else {
        res.send({ message: "User already exist in database" });
      }
    });
    app.get("/users", varifyToken, varifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete("/users/:id", varifyToken, varifyAdmin, async (req, res) => {
      const userId = req.params.id;
      const query = { _id: new ObjectId(userId) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    app.patch("/user/:id", varifyToken, varifyAdmin, async (req, res) => {
      const userId = req.params.id;
      const filter = { _id: new ObjectId(userId) };
      const updatedRole = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedRole);
      res.send(result);
    });

    app.get("/users/admin/:email", varifyToken, async (req, res) => {
      const userEmail = req?.params?.email;
      const tokenEmail = req?.decoded?.email;
      if (userEmail !== tokenEmail) {
        return res.send({ message: "unauthorized access" });
      } else {
        const query = { email: userEmail };
        const user = await userCollection.findOne(query);
        isAdmin = user?.role === "admin";
        res.send(isAdmin);
      }
    });
    // foodCollection related CRUD operations
    app.get("/foods", async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.status(200).send(result);
    });
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const food = req?.body;
      const result = await foodCollection.insertOne(food);
      res.send(result).status(200);
    });

    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });
    // cartCollection related CRUD operations
    app.get("/carts", async (req, res) => {
      const email = req?.query?.email;
      const query = { userEmail: email };
      const result = await cartCollection.find(query).toArray();
      res.status(200).send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req?.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteMany(query);
      res.status(200).send(result);
    });

    app.post("/carts", async (req, res) => {
      const cart = req?.body;
      const result = await cartCollection.insertOne(cart);
      res.send(result).status(200);
    });
    // reviewCollection related CRUD operations
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.status(200).send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req?.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result).status(200);
    });
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
