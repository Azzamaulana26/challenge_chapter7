const router = require('express').Router();
const { getHome } = require('../controllers/home.controllers');
const { activation } = require('../middlewares/activation.middleware');

// Rute untuk halaman utama yang memerlukan aktivasi akun
router.get('/', activation, getHome);

module.exports = router;
