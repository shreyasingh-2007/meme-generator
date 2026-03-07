const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// Safeguard against missing API key crashes by initializing it conditionally
let ai = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
}

exports.getMemes = async (req, res) => {
    try {
        const response = await axios.get('https://api.imgflip.com/get_memes');
        if (response.data.success) {
            res.json(response.data.data.memes);
        } else {
            res.status(500).json({ error: 'Failed to fetch memes from Imgflip' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRandomMeme = async (req, res) => {
    try {
        const response = await axios.get('https://api.imgflip.com/get_memes');
        if (response.data.success) {
            const memes = response.data.data.memes;
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            res.json(randomMeme);
        } else {
            res.status(500).json({ error: 'Failed to fetch' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ id: Date.now(), url: imageUrl, name: 'Uploaded Image', box_count: 2 });
};

exports.generateCaption = async (req, res) => {
    try {
        const { memeName } = req.body;
        if (!memeName) return res.status(400).json({ error: 'Meme name is required' });
        
        // --- MOCK AI CAPTION GENERATOR ---
        // Since no API key is provided, we simulate an AI response with
        // context-aware (or brilliantly random) fallback captions.
        const mockResponses = [
            { top: `POV: You just found out about`, bottom: `"${memeName}"` },
            { top: `When the PM asks for an update on`, bottom: `The "${memeName}" feature` },
            { top: `Me trying to explain`, bottom: `Why "${memeName}" is clearly superior` },
            { top: `Nobody:`, bottom: `Literally nobody: \nMe: "${memeName}"` },
            { top: `Mom: "We have food at home"`, bottom: `Food at home: "${memeName}"` },
            { top: `Therapist: "${memeName}" isn't real, it can't hurt you.`, bottom: `"${memeName}":` }
        ];

        // Pick a random witty response and substitute the template name
        const randomCaption = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        // Simulate a slight network delay to make it feel like "AI" is thinking
        await new Promise(resolve => setTimeout(resolve, 800));

        res.json({
            topText: randomCaption.top.toUpperCase(),
            bottomText: randomCaption.bottom.toUpperCase()
        });

    } catch (error) {
        console.error('Mock Caption Error:', error);
        res.status(500).json({ error: 'Failed to generate mock caption' });
    }
};
