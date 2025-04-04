const express = require("express");
const productRoutes = require("./product"); // Bạn có thể đổi tên file thành `products.js`
const router = express.Router();

router.use("/products", productRoutes);

module.exports = router;
