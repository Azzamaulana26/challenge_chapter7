require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_SENDER_EMAIL } = process.env;

// Inisialisasi objek OAuth2 untuk Gmail
const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

module.exports = {
  // Fungsi untuk mengirim email menggunakan OAuth2 Gmail
  sendEmail: async (to, subject, html) => {
    const accessToken = await oauth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GOOGLE_SENDER_EMAIL,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    transport.sendMail({ to, subject, html });
  },

  // Fungsi untuk mendapatkan HTML dari template EJS
  getHtml: (fileName, data) => {
    return new Promise((resolve, reject) => {
      const path = `${__dirname}/../views/layout/${fileName}`;

      // Render file EJS dengan data yang diberikan
      ejs.renderFile(path, data, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  },
};
