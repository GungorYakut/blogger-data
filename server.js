const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const owner = 'GungorYakut';
const repo = 'blogger-data';
const path = 'data.json';
const token = process.env.GITHUB_TOKEN; // Render environment variable

// Normalize helper
function normalizeData(data) {
  return data.map(item => ({
    nick: item.nick || item.Nick || "",
    ip: item.ip || item.IP || ""
  }));
}

// GET /data.json
app.get('/data.json', async (req, res) => {
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'BloggerApp' }
    });
    const fileData = await fileRes.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const json = JSON.parse(content);
    res.json(normalizeData(json));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /push
app.post('/push', async (req, res) => {
  try {
    const jsonData = normalizeData(req.body);

    // GitHub dosya sha al
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'BloggerApp' }
    });
    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // Yeni içerik
    const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

    // GitHub PUT
    const pushRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'BloggerApp', 'Content-Type': 'application/json' },
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
