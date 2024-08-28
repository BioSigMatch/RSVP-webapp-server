const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// 画像が格納されているフォルダのパス
const targetFolder = path.join(__dirname, 'images', 'target');
const nontargetFolder = path.join(__dirname, 'images', 'nontarget');
const jsonFolder = path.join(__dirname, 'json');

console.log('Target folder:', targetFolder);
console.log('Nontarget folder:', nontargetFolder);
console.log('JSON folder:', jsonFolder);

// 静的ファイルの提供
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// JSONフォルダが存在しない場合は作成
fs.mkdir(jsonFolder, { recursive: true })
  .then(() => console.log('JSON folder created or already exists'))
  .catch(err => console.error('Error creating JSON folder:', err));

// 画像リストを取得し、JSONとして保存するAPIエンドポイント
app.get('/api/images', async (req, res) => {
  const type = req.query.type;
  let folder;

  if (type === 'target') {
    folder = targetFolder;
  } else if (type === 'nontarget') {
    folder = nontargetFolder;
  } else {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  try {
    const files = await fs.readdir(folder);
    console.log(`Files in ${type} folder:`, files);

    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    console.log(`Filtered ${type} image files:`, imageFiles);

    const imageList = imageFiles.map(file => ({
      name: file,
      url: `/images/${type}/${file}`
    }));

    // JSONファイルとして保存
    const jsonFileName = `${type}_images.json`;
    const jsonFilePath = path.join(jsonFolder, jsonFileName);
    await fs.writeFile(jsonFilePath, JSON.stringify(imageList, null, 2));

    console.log(`JSON saved to ${jsonFilePath}`);
    res.json(imageList);
  } catch (err) {
    console.error(`Error processing ${type} images:`, err);
    res.status(500).json({ error: 'Unable to process request', details: err.message });
  }
});

// 保存されたJSONファイルを取得するエンドポイント
app.get('/api/json/:type', async (req, res) => {
  const type = req.params.type;
  const jsonFileName = `${type}_images.json`;
  const jsonFilePath = path.join(jsonFolder, jsonFileName);

  try {
    const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
    res.json(JSON.parse(jsonContent));
  } catch (err) {
    console.error('Error reading JSON file:', err);
    res.status(404).json({ error: 'JSON file not found', details: err.message });
  }
});

// インデックスルートの処理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});