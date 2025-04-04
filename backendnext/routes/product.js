const express = require("express");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProductsByName 
} = require("../models/product");

const router = express.Router();

// Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    // Kiểm tra nếu có tham số tìm kiếm theo tên
    if (req.query.name) {
      const products = await searchProductsByName(req.query.name);
      return res.json(products);
    }
    
    // Nếu không có tham số tìm kiếm, trả về tất cả sản phẩm
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi tìm kiếm sản phẩm" });
  }
});

// Lấy sản phẩm theo ID
router.get("/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy sản phẩm" });
  }
});

// Thêm sản phẩm
router.post("/", async (req, res) => {
  try {
    const result = await addProduct(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
  }
});

// Cập nhật sản phẩm
router.put("/:id", async (req, res) => {
  try {
    const result = await updateProduct(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm" });
  }
});
// Xóa sản phẩm
router.delete("/:id", async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
  }
});

module.exports = router;
