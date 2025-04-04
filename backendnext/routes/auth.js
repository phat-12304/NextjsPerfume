const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Users = require('../models/user');

// Thiết lập secret key cho JWT (nên lưu trong biến môi trường)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware xác thực
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ 
    success: false,
    message: 'Yêu cầu xác thực.' 
  });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ 
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn.' 
    });
    req.user = user;
    next();
  });
};

// Route đăng ký
router.post('/register', [
  // Validation
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail()
    .custom(async (value) => {
      const emailExists = await Users.hasEmail(value);
      if (emailExists) {
        throw new Error('Email đã được sử dụng');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu nhập lại không khớp');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo người dùng mới (với tên người dùng từ email nếu không có trường name)
    const username = email.split('@')[0]; // Lấy phần trước @ làm tên người dùng
    const user = new Users(username, email, hashedPassword);
    const result = await user.save();
    
    // Tạo token
    const token = jwt.sign(
      { id: result.insertedId, email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: result.insertedId,
        email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký',
      error: error.message 
    });
  }
});

// Route đăng nhập
router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').not().isEmpty().withMessage('Mật khẩu không được để trống'),
], async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Kiểm tra người dùng tồn tại
    const user = new Users();
    const foundUser = await user.getByEmail(email);
    
    if (!foundUser) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }
    
    // Tạo token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập', 
      error: error.message 
    });
  }
});

// Route kiểm tra thông tin người dùng hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = new Users();
    await user.getById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin người dùng', 
      error: error.message 
    });
  }
});

module.exports = router;