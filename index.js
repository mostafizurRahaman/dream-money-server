const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://0.0.0.0:27017`;
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

const run = async () => {
   try {
      const database = client.db("dream-money-database");
      const usersCollection = database.collection("users");

      app.get("/jwt", async (req, res) => {
         const email = req.query.email;
         const user = await usersCollection.findOne({ email });
         if (user.email) {
            const token = jwt.sign({
               name: `${user.firstName} ${user.lastName}`,
               email: user.email,
               username: user.username,
            });
            res.status(200).send({ token });
         }
      });

      // New User Creation :-
      app.post("/users", async (req, res) => {
         const user = req.body;
         console.log(user);
         const exitingUser = await usersCollection.findOne({
            email: user?.email,
         });
         if (exitingUser?.email) {
            return res
               .status(401)
               .send({ message: "already exit an user with this email" });
         }
         const result = await usersCollection.insertOne(user);
         console.log(result);
         res.status(200).send(user);
      });

      //  Get users:
      app.get("/users", async (req, res) => {
         const users = await usersCollection.find({}).toArray();
         res.send({ users: users });
      });

      app.get("/users/:username", async (req, res) => {
         const username = req.params.username;
         console.log(username);
         const user = await usersCollection.findOne({ username });
         const isExist = user?.email ? true : false;
         return res.status(200).send({ isExist: isExist });
      });
   } finally {
   }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
   res.send({ message: "Dream money server is running now" });
});

app.listen(port, () => {
   console.log(`Dream money server is running on  ${port}`);
});
