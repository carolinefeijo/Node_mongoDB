const uri =
  "mongodb+srv://carolinefeijo:160812@cluster0.7quta9q.mongodb.net/?retryWrites=true&w=majority";
const { MongoClient, ObjectId } = require("mongodb");

class MongoDB {
  constructor() {
    new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
      .connect()
      .then((client) => {
        this.client = client;
        console.log("conectou no MONGO");
      });
  }

  saveNewUser(user) {
    db.collection("teachers").insertOne(user);
  }
}
module.exports = new MongoDB();
