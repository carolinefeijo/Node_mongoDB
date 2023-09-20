const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");

const app = express();
let db;
const PORT = 8001;
app.use(express.json());

async function connectMongoDb() {
  const client = new MongoClient(
    "mongodb+srv://carolinefeijo:160812@cluster0.7quta9q.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );

  try {
    await client.connect();
    console.log("Conectei ao DB");
    db = client.db();
  } catch (error) {
    console.log("Deu ruim", error);
  }
}

app.get("/list", async function (req, res) {
  try {
    const collections = await db.listCollections().toArray();
    const collectionsData = await Promise.all(
      collections.map(async (collection) => ({
        name: collection.name,
        data: await db.collection(collection.name).find().toArray(),
      }))
    );

    res.status(200).json({ collections: collectionsData });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/", function (req, res) {
  const { name, lastName, telephone, birthDate } = req.body;
  try {
    db.collection("teachers").insertOne({
      name,
      lastName,
      telephone,
      birthDate,
    });
    res.status(201).json({ message: "Success when registering !" });
  } catch (error) {
    res.status(400).json({ message: "What a shame, we have an error!" });
  }
});

app.get("/filterbyname", async function (req, res) {
  try {
    const collections = await db.listCollections().toArray();
    const filterData = await Promise.all(
      collections.map(async (collection) => {
        const data = await db
          .collection(collection.name)
          .find({ name: "Ana" })
          .toArray();
        return {
          name: collection.name,
          data: data,
        };
      })
    );

    res.status(200).json({ collections: filterData });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/:teacherId", async function (req, res) {
  const { name } = req.body;
  const teacherId = req.params.teacherId;
  try {
    const collection = db.collection("teachers");
    if (!ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "the id is not valid" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(teacherId) },
      { $set: { name } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "teacher not found" });
    }

    res.status(200).json({ message: "Teacher's name updated successfully!" });
  } catch (error) {
    console.error("Error updating teacher name", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/:teacherId", async function (req, res) {
  const teacherId = req.params.teacherId;
  try {
    const teacherResult = await db
      .collection("teachers")
      .deleteOne({ _id: new ObjectId(teacherId) });
    if (teacherResult.deletedCount === 0) {
      res.status(400).json({ message: "Not deleted, ID not found!" });
    } else {
      res.status(204).json({ message: "Success deleted!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "What a shame, we have an error" });
  }
});

connectMongoDb();
app.listen(PORT, () => {
  console.log(`Rolling in the door ${PORT}...`);
});
