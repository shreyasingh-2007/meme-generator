# Meme Generator

A full-stack Meme Generator built with the MERN stack (MongoDB excluded for simpler local setup, using local file storage).

## Prerequisites
- Node.js installed on your machine

## Getting Started

### Backend Setup
1. CD into the backend directory
   ```bash
   cd backend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Run the development server
   ```bash
   npm run dev
   ```
The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal and CD into the frontend directory
   ```bash
   cd frontend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Run the development server
   ```bash
   npm run dev
   ```
The frontend will run on `http://localhost:5173`.

## Features
- View trending meme templates from Imgflip API.
- Search for specific templates.
- Get a random template.
- Upload your own image to use as a template.
- Add Top and Bottom text to memes.
- Customize text size and color.
- Live preview of the generated meme.
- Download the generated meme as a PNG image.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, HTML Canvas
- **Backend**: Node.js, Express, Axios, Multer
- **Storage**: Local filesystem (`/uploads` directory)
