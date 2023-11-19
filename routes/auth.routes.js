const router = require('express').Router();
const { register, login, activate, whoami, getActivate, getLogin, getRegister } = require('../controllers/auth.controllers');
const { restrict } = require('../middlewares/auth.middleware');

// Rute untuk halaman pendaftaran
router.get('/register', getRegister);
router.post('/register', register);

// Rute untuk halaman login
router.get('/login', getLogin);
router.post('/login', login);

// Rute untuk informasi pengguna yang sudah terautentikasi
router.get('/whoami', restrict, whoami);

// Rute untuk halaman aktivasi akun melalui email
router.get('/email-activation', getActivate);
router.post('/email-activation', activate);

module.exports = router;
