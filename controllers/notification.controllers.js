const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  // Fungsi untuk mendapatkan halaman notifikasi berdasarkan token JWT
  notifications: async (req, res) => {
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

      // Mencari notifikasi berdasarkan ID pengguna
      let notification;
      if (user.id) {
        notification = await prisma.notification.findMany({ where: { userId: Number(user.id) } });
      }

      // Membuat path berdasarkan protokol dan host pada request
      let path = `${req.protocol}://${req.get('host')}`;
      
      // Render halaman notifikasi dengan menyertakan notifikasi, ID pengguna, path, dan token
      res.render('notification', { notification, userId: user.id, path, token });
    });
  },

  // Fungsi untuk membuat notifikasi baru
  createNotification: async (req, res) => {
    // Mendapatkan data notifikasi dari body request
    let { title, body, userId } = req.body;

    // Membuat notifikasi baru di dalam database
    const notification = await prisma.notification.create({
      data: {
        title,
        body,
        userId,
      },
    });

    // Mengirim notifikasi baru menggunakan socket.io
    req.io.emit(`user-${notification.userId}`, notification);
    console.log(`Server user-${notification.userId}`);

    // Mengembalikan respons JSON dengan status true dan data notifikasi
    res.json({ status: true, data: notification });
  },

  // Fungsi untuk menandai notifikasi sebagai sudah dibaca
  notificatioRead: async (req, res) => {
    // Mendapatkan token dari query string
    let { token } = req.query;

    // Mendapatkan ID notifikasi dari parameter URL
    let notificationId = req.params.id;

    // Mencari notifikasi berdasarkan ID
    let notification = await prisma.notification.findUnique({ where: { id: Number(notificationId) } });

    // Menandai notifikasi sebagai sudah dibaca jika ditemukan
    if (notification) {
      await prisma.notification.update({
        where: { id: Number(notificationId) },
        data: { isRead: true },
      });

      // Redirect ke halaman notifikasi dengan menyertakan token dalam query string
      res.redirect(`/api/v1/notifications?token=${token}`);
    } else {
      // Mengembalikan respons JSON dengan status false jika notifikasi tidak ditemukan
      res.status(404).json({
        status: false,
        message: `Notifikasi ${notificationId} tidak ditemukan`,
      });
    }
  },
  // server,
};
