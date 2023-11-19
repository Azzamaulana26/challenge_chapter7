// Module exports berisi fungsi-fungsi yang digunakan dalam manajemen halaman index

module.exports = {
  // Fungsi untuk menampilkan halaman index
  getIndex: async (req, res) => {
    // Mendapatkan URL lengkap (protocol dan host)
    let path = `${req.protocol}://${req.get('host')}`;

    // Merender halaman index dengan menyertakan path
    res.render('index', { path });
  },
};
