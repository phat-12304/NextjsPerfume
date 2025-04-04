const { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb://localhost:27017";
const DB_NAME = "pefume"; // Sửa lại tên database nếu cần

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    db = client.db(DB_NAME);
    console.log("✅ Kết nối CSDL thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối CSDL:", error);
  }
};

const getDB = () => {
  if (!db) throw "Không có CSDL";
  return db;
};

module.exports = { connectDB, getDB };