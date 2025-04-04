const { getDB } = require("./database");
const mongodb = require("mongodb");

class Users {
  constructor(name = "", email = "", password = "", role = "user") {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role; // Thêm trường role với giá trị mặc định là "user"
  }

  save() {
    const db = getDB();
    if (this._id) {
      return db.collection("users").updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: this }
      );
    } else {
      return db.collection("users").insertOne(this);
    }
  }

  static async hasEmail(email) {
    const db = getDB();
    let count = await db.collection("users").countDocuments({ email: email });
    return count > 0;
  }

  static getAll() {
    const db = getDB();
    return db.collection("users").find().toArray();
  }

  async getById(id) {
    const db = getDB();
    let data = await db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(id) });
    
    if (data) {
      this._id = data._id;
      this.name = data.name;
      this.email = data.email;
      this.password = data.password;
      this.role = data.role || "user"; // Thêm role với giá trị mặc định nếu không tồn tại
      return this;
    }
    return null;
  }

  async getByEmail(email) {
    const db = getDB();
    let data = await db.collection("users").findOne({ email: email });
    
    if (data) {
      this._id = data._id;
      this.name = data.name;
      this.email = data.email;
      this.password = data.password;
      this.role = data.role || "user"; // Thêm role với giá trị mặc định nếu không tồn tại
      return this;
    }
    return false;
  }

  static async deleteById(id) {
    const db = getDB();
    return await db
      .collection("users")
      .deleteOne({ _id: new mongodb.ObjectId(id) });
  }

  // Thêm phương thức để đặt role admin
  static async setAdminRole(userId) {
    const db = getDB();
    return await db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(userId) },
        { $set: { role: "admin" } }
      );
  }

  // Thêm phương thức để kiểm tra role
  static async isAdmin(userId) {
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) });
    return user && user.role === "admin";
  }
}

module.exports = Users;