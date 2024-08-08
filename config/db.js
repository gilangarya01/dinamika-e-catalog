const { MongoClient } = require("mongodb");

async function connectToDB() {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    return client.db("uas-204160");
  } catch (error) {
    console.error("Connection error", error);
    throw new Error("Database connection failed");
  }
}

module.exports = { connectToDB };
