const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch
const app = express();
app.use(express.json());

const token = process.env.GITHUB_TOKEN || 'YOUR_PERSONAL_ACCESS_TOKEN'; 
const owner = 'GungorYakut';
const repo = 'blogger-data';
const filePath = 'data.json';

// GitHub’dan data.json oku
app.get('/data.json', async (req, res) => {
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: { 
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript'
      }
    });
    const fileData = await fileRes.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GitHub’a push et (data.json güncelle)
app.post('/push', async (req, res) => {
  const jsonData = req.body;
  if (!jsonData) return res.status(400).json({ error: 'Geçersiz veri' });

  try {
    // Önce mevcut dosyanın SHA değerini al
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: { 
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript'
      }
    });
    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // Yeni içerik (base64)
    const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

    // GitHub’a yaz
    const pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
