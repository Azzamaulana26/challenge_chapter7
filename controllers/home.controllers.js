const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Fungsi untuk mendapatkan halaman home dengan informasi pengguna
  getHome: async (req, res) => {
    // Mendapatkan token dari query string
    let { token } = req.query;
    
    // Verifikasi token menggunakan JWT
    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        // Mengembalikan respons JSON jika terdapat kesalahan pada token
        return res.status(400).json({
          status: false,
          message: 'Permintaan Buruk',
          err: err.message,
          data: null,
        });
      }

      // Mencari pengguna berdasarkan email yang terdapat dalam token
      let user = await prisma.user.findUnique({ where: { email: decoded.email } });

      // Mengembalikan respons JSON jika pengguna tidak ditemukan
      if (!user) {
        return res.status(400).json({
          status: false,
          message: 'Permintaan Buruk',
          err: 'Post dengan email tidak ditemukan',
          data: null,
        });
      }

      // Membuat path berdasarkan protokol dan host pada request
      let path = `${req.protocol}://${req.get('host')}`;
      
      // Render halaman home dengan menyertakan token, informasi pengguna, dan path
      res.render('home', { token, user, path });
    });
  },
};
