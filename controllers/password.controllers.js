const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('../utils/nodemailer.utils');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Fungsi untuk mendapatkan halaman lupa password
  getPasswordForgot: async (req, res) => {
    // Membuat path berdasarkan protokol dan host pada request
    let path = `${req.protocol}://${req.get('host')}`;
    
    // Mengambil pesan dari flash messages
    let message = req.flash('message');
    let err = req.flash('err');
    
    // Render halaman password-forgot dengan menyertakan path, pesan, dan error
    res.render('password-forgot', { path, message: message[0], err: err[0] });
  },

  // Fungsi untuk mengirim email reset password dan memberikan pesan sukses atau error
  passwordForgot: async (req, res) => {
    // Mendapatkan email dari body request
    let { email } = req.body;
    
    // Mencari pengguna berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });

    // Menampilkan pesan error jika pengguna tidak ditemukan
    if (!user) {
      req.flash('err', 'User does not exist!');
      return res.status(400).redirect('/api/v1/password/password-forgot');
    }

    // Membuat token JWT untuk reset password
    let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);

    // Membuat path berdasarkan protokol dan host pada request
    let path = `${req.protocol}://${req.get('host')}`;
    
    // Membuat URL untuk reset password
    let url = `${path}/api/v1/password/reset?token=${token}`;

    // Mengambil HTML template email reset password
    const html = await nodemailer.getHtml('reset-password.ejs', { name: user.name, url });

    // Mengirim email reset password
    nodemailer.sendEmail(user.email, 'Reset Password', html);

    // Menampilkan pesan sukses dan redirect ke halaman password-forgot
    req.flash('message', 'Check your email to reset password');
    return res.status(200).redirect('/api/v1/password/password-forgot');
  },

  // Fungsi untuk mendapatkan halaman reset password
  getReset: async (req, res) => {
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
      let user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      // Render halaman password-reset dengan menyertakan token dan informasi pengguna
      res.render('password-reset', { token, user });
    });
  },

  // Fungsi untuk mereset password pengguna
  reset: async (req, res, next) => {
    // Mendapatkan token dari query string
    let { token } = req.query;

    // Mendapatkan data password baru dan konfirmasi password baru dari body request
    let { new_password, new_password_confirmation } = req.body;

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
      const user = await prisma.user.findUnique({ where: { email: decoded.email } });

      // Menampilkan pesan error jika password baru dan konfirmasi password baru tidak sama
      if (new_password != new_password_confirmation) {
        return res.status(400).json({
          status: false,
          message: 'Permintaan Buruk',
          err: 'New password and new password confirmation not the same',
          data: null,
        });
      }

      // Mengenkripsi password baru
      let encryptedPassword = await bcrypt.hash(new_password, 10);

      // Memperbarui password pengguna
      const updated = await prisma.user.update({
        where: { email: decoded.email },
        data: { password: encryptedPassword },
      });

      // Mengambil HTML template email sukses reset password
      const html = await nodemailer.getHtml('reset-password-success.ejs', { name: updated.name });

      // Mengirim email sukses reset password
      nodemailer.sendEmail(updated.email, 'Reset Password Success', html);

      // Membuat notifikasi reset password sukses
      const notification = await prisma.notification.create({
        data: {
          title: 'Reset Password Success',
          body: `Hello ${updated.name}, The process of resetting your account password has been successfully carried out🎉`,
          userId: updated.id,
        },
      });

      // Mengirim notifikasi baru menggunakan socket.io
      req.io.emit(`user-${notification.userId}`, notification);

      // Redirect ke halaman login
      res.redirect(`/api/v1/auth/login`);
    });
  },
};
