const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Middleware untuk membatasi akses dengan token
  restrict: (req, res, next) => {
    try {
      // Mendapatkan nilai dari header 'Authorization'
      let { authorization } = req.headers;

      // Mengembalikan respons JSON jika header 'Authorization' tidak ada
      if (!authorization) {
        return res.status(401).json({
          status: false,
          message: 'Unauthorized',
          err: 'Missing token on header!',
          data: null,
        });
      }

      // Mengambil token dari nilai 'Authorization' dengan memisahkan spasi
      let token = authorization.split(' ')[1];

      // Verifikasi token menggunakan JWT
      jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
          // Mengembalikan respons JSON jika terdapat kesalahan pada token
          return res.status(401).json({
            status: false,
            message: 'Unauthorized',
            err: err.message,
            data: null,
          });
        }

        // Mencari pengguna berdasarkan email yang terdapat dalam token
        req.user = await prisma.user.findUnique({ where: { email: decoded.email } });

        // Mengembalikan respons JSON jika email pengguna belum diaktifasi
        if (!req.user.isVerified) {
          return res.status(401).json({
            status: false,
            message: 'Unauthorized',
            err: 'Your email is not activated',
            data: null,
          });
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
