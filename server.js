const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Veriyi normalize eden yardımcı fonksiyon
function normalizeData(data) {
  return data.map(item => ({
    nick: item.nick || item.Nick || "",
    ip: item.ip || item.IP || ""
  }));
}

// data.json dosyasını geri ver
app.get('/data.json', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Veri okunamadı' });
    }
    try {
      const json = JSON.parse(data);
      res.json(normalizeData(json)); // her zaman normalize edilmiş döner
    } catch (e) {
      res.status(500).json({ error: 'JSON hatalı' });
    }
  });
});

// data.json dosyasını güncelle
app.post('/push', (req, res) => {
  const normalized = normalizeData(req.body);

  fs.writeFile(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf8', err => {
    if (err) {
      return res.status(500).json({ error: 'Veri yazılamadı' });
    }
    res.json({ success: true, message: 'Veri güncellendi!' });
  });
});

// Render dinleme portu
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
