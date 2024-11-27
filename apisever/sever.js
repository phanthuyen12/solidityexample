const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Sử dụng CORS cho tất cả các nguồn gốc (bạn có thể chỉ định nguồn gốc cụ thể nếu muốn)
app.use(cors());

// Tạo app Express

// Cấu hình body-parser
app.use(bodyParser.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/thuyentoken', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Định nghĩa schema cho donation (đóng góp)
const donationSchema = new mongoose.Schema({
  user: String,
  amount: String
});

// Tạo model từ schema
const Donation = mongoose.model('Donation', donationSchema);

app.post('/donate', async (req, res) => {
  const { user, amount } = req.body;

  if (!user || !amount) {
    return res.status(400).json({ message: 'Thiếu thông tin user hoặc amount' });
  }

  const newDonation = new Donation({
    user,
    amount
  });

  try {
    await newDonation.save();
    res.status(200).json({ message: 'Đóng góp thành công!', donation: newDonation });
  } catch (err) {
    console.error('Lỗi lưu donation:', err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra' });
  }
});

app.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find(); 
    res.status(200).json(donations);
  } catch (err) {
    console.error('Lỗi lấy dữ liệu donations:', err);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin đóng góp' });
  }
});

// Chạy server
const port = 3000;
app.listen(port, () => {
  console.log(`Server đang chạy trên cổng ${port}`);
});
