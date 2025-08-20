const express = require('express');
const fetch = require('node-fetch'); // npm install node-fetch
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const token = 'YOUR_PERSONAL_ACCESS_TOKEN'; // GitHub token
const owner = 'GungorYakut';
const repo = 'blogger-data';
const path = 'data.json';

app.post('/push', async (req, res) => {
  const jsonData = req.body;
  if (!jsonData) return res.status(400).json({error: 'Geçersiz veri'});

  try {
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { 
        'Authorization': `token ${token}`,
        'User-Agent': 'BloggerScript'
      }
    });
    const fileData = await fileRes.json();
    const sha = fileData.sha;

    const content = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

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
    res.status(500).json({error: err.message});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
