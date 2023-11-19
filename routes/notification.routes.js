const router = require('express').Router();
const { notifications, notificatioRead, createNotification } = require('../controllers/notification.controllers');

// Rute untuk mendapatkan daftar notifikasi
router.get('/', notifications);

// Rute untuk menandai notifikasi sebagai telah dibaca
router.get('/:id/mark-is-read', notificatioRead);

// Rute untuk membuat notifikasi baru
router.post('/', createNotification);

module.exports = router;
