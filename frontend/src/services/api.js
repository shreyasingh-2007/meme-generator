import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export const getMemes = async () => {
    const response = await axios.get(`${API_URL}/memes`);
    return response.data;
};

export const getRandomMeme = async () => {
    const response = await axios.get(`${API_URL}/random`);
    return response.data;
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const generateCaption = async (memeName) => {
    const response = await axios.post(`${API_URL}/generate-caption`, { memeName });
    return response.data;
};
