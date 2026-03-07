const express = require('express');
const router = express.Router();
const { getMemes, getRandomMeme, uploadImage, generateCaption } = require('../controllers/memeController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/memes', getMemes);
router.get('/random', getRandomMeme);
router.post('/upload', upload.single('image'), uploadImage);
router.post('/generate-caption', generateCaption);

module.exports = router;
