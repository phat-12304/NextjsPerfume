// Tải các biến môi trường từ file .env
require('dotenv').config();

var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { connectDB } = require('./models/database');

// Import routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRouter = require('./routes/product'); 
var authRouter = require('./routes/auth');

// Tạo ứng dụng Express
var app = express();

// Kết nối database
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection error:', err);
});

// Cài đặt view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware CORS với cấu hình chi tiết hơn
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Cho phép tất cả nguồn gốc hoặc chỉ định từ biến môi trường
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Cấu hình routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product', productRouter); 
app.use('/auth', authRouter);

// Bắt lỗi 404 và chuyển tiếp đến error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Chỉ cung cấp lỗi chi tiết trong môi trường development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Trả về trang lỗi
  res.status(err.status || 500);
  
  // Nếu yêu cầu là API (Accept: application/json), trả về lỗi dạng JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json({
      success: false,
      message: err.message,
      error: req.app.get('env') === 'development' ? err : {}
    });
  }
  
  // Ngược lại render trang lỗi
  res.render('error');
});

module.exports = app;