const router = require('express').Router();
const { passwordForgot, getReset, reset, getPasswordForgot } = require('../controllers/password.controllers');

// Rute untuk halaman lupa kata sandi
router.get('/password-forgot', getPasswordForgot);

// Rute untuk mengirim permintaan reset kata sandi
router.post('/password-forgot', passwordForgot);

// Rute untuk halaman reset kata sandi
router.get('/reset', getReset);

// Rute untuk mengeksekusi reset kata sandi
router.post('/reset', reset);

module.exports = router;
