const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch

const app = express();
app.use(express.json());

// Render'da Environment Variables kısmına ekle:
// Key: GITHUB_TOKEN  Value: senin GitHub tokenin
const token = process.env.GITHUB_TOKEN;

const owner = 'GungorYakut';
const repo = 'blogger-data';
const path = 'data.json';

// data.json içeriğini oku
app.get('/data.json', async (req, res) => {
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript'
      }
    });
    const fileData = await fileRes.json();

    if (!fileData.content) {
      return res.status(500).json({ error: 'Veri okunamadı' });
    }

    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// data.json dosyasını güncelle
app.post('/push', async (req, res) => {
  const jsonData = req.body;
  if (!jsonData) return res.status(400).json({ error: 'Geçersiz veri' });

  try {
    // Mevcut SHA değerini al
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript'
      }
    });
    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // Yeni içerik base64'e çevrilir
    const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

    // GitHub'a yaz
    const pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update via Blogger page',
        content: content,
        sha: sha
      })
    });

    const result = await pushRes.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Render dinleme portu
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
