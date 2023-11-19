// Mengimpor library dotenv untuk mengelola variabel lingkungan
require('dotenv').config();

// Mengimpor Express untuk membuat aplikasi web
const express = require('express');
const app = express();

// Mengimpor modul express-session untuk mengelola sesi
const session = require('express-session');

// Mengimpor cookie-parser untuk mengelola cookie
const cookieParser = require('cookie-parser');

// Mengimpor connect-flash untuk mengelola pesan flash
const flash = require('connect-flash');

// Mengimpor Sentry untuk penanganan dan pelaporan kesalahan
const Sentry = require('@sentry/node');

// Mengimpor modul router yang berisi rute aplikasi
const router = require('./routes/index.routes');

// Mengimpor variabel lingkungan (environment variables)
const { PORT, SENTRY_DSN } = process.env;

// Mengimpor modul path untuk menangani path file
const path = require('path');

// Menginisialisasi Sentry untuk pelaporan kesalahan
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
});

// Mengatur middleware untuk pengolahan data JSON
app.use(express.json());

// Mengatur view engine ke EJS
app.set('view engine', 'ejs');

// Mengatur middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mengatur middleware untuk pengolahan formulir url-encoded
app.use(express.urlencoded({ extended: true }));

// Konfigurasi flash messages
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Menambahkan Sentry handlers untuk pelaporan kesalahan
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Konfigurasi WebSocket
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Menambahkan objek io ke dalam setiap permintaan (request)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Menentukan rute aplikasi di bawah '/api/v1'
app.use('/api/v1', router);

// Menambahkan Sentry errorHandler untuk menangani kesalahan
app.use(Sentry.Handlers.errorHandler());

// Middleware untuk menangani kesalahan 404 (Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Not Found',
    err: null,
    data: null,
  });
});

// Middleware untuk menangani kesalahan server internal (500)
app.use((err, req, res, next) => {
  res.status(500).json({
    status: false,
    message: 'Internal Server Error',
    err: err.message,
    data: null,
  });
});

// Menjalankan server pada port yang ditentukan
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
