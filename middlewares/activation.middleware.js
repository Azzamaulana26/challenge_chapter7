const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Middleware untuk aktivasi pengguna
  activation: (req, res, next) => {
    try {
      // Mendapatkan token dari query string
      let { token } = req.query;

      // Verifikasi token menggunakan JWT
      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          // Mengembalikan respons JSON jika terdapat kesalahan pada token
          return res.status(401).json({
            status: false,
            message: 'Permintaan Buruk',
            err: err.message,
            data: null,
          });
        }

        // Mencari pengguna berdasarkan email yang terdapat dalam token
        req.user = await prisma.user.findUnique({ where: { email: decoded.email } });

        // Menampilkan pesan error jika email pengguna belum diaktifasi
        if (!req.user.isVerified) {
          req.flash('err', 'Your email is not activated. Please check your email for activation.');
          return res.status(401).redirect('/api/v1/auth/login');
        }

        // Melanjutkan ke middleware atau handler berikutnya
        next();
      });
    } catch (err) {
      // Menangani kesalahan
      next(err);
    }
  },
};
