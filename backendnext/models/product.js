const { getDB } = require("./database");
const { ObjectId } = require("mongodb");

const collection = () => getDB().collection("product");

const getAllProducts = async () => await collection().find().toArray();

const getProductById = async (id) =>
  await collection().findOne({ _id: new ObjectId(id) });

const searchProductsByName = async (name) => {
  const query = { name: { $regex: name, $options: 'i' } };
  return await collection().find(query).toArray();
};

const addProduct = async (product) => await collection().insertOne(product);

const updateProduct = async (id, product) =>
  await collection().updateOne({ _id: new ObjectId(id) }, { $set: product });

const deleteProduct = async (id) =>
  await collection().deleteOne({ _id: new ObjectId(id) });

module.exports = { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct,searchProductsByName };
