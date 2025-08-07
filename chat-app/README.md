# Math Learning Chat Application

An interactive React-based chat application that allows users to upload images containing mathematical content, extract text and formulas using OCR, generate questions, and receive personalized feedback.

## Features

- 📸 **Image Upload**: Drag and drop or click to upload images
- 🔍 **OCR Analysis**: Extract text and LaTeX formulas from images using OpenAI Vision
- ❓ **Question Generation**: Automatically generate mathematical questions based on extracted content
- 💬 **Interactive Chat**: Answer questions and receive personalized feedback
- 🎯 **Follow-up Questions**: Get additional questions to deepen understanding
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install parent directory dependencies** (for the existing JavaScript modules)
   ```bash
   cd ..
   npm install
   cd chat-app
   ```

## Configuration

1. **Get an OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Set up the API Key**
   - The application will prompt you to enter your API key on first launch
   - The key is stored locally in your browser for security

## Running the Application

### Development Mode

Run both the frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- React development server on `http://localhost:3000`
- Express backend server on `http://localhost:3001`

### Production Mode

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm run server
   ```

The application will be available at `http://localhost:3001`

## Usage

1. **Open the application** in your browser
2. **Enter your OpenAI API key** when prompted
3. **Upload an image** containing mathematical content:
   - Drag and drop an image onto the upload area
   - Or click the upload area to select a file
4. **Wait for analysis** - the app will extract text and formulas
5. **Review the generated question** based on the image content
6. **Type your answer** in the chat input
7. **Receive feedback** and follow-up questions

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

## API Endpoints

The backend provides the following endpoints:

- `POST /api/analyze-image` - Analyze uploaded images with OCR
- `POST /api/generate-question` - Generate questions based on OCR results
- `POST /api/generate-feedback` - Generate feedback for user answers
- `GET /api/health` - Health check endpoint

## Project Structure

```
chat-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ApiKeyModal.js
│   │   ├── ApiKeyModal.css
│   │   ├── ChatInterface.js
│   │   └── ChatInterface.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── server.js
├── package.json
└── README.md
```

## Technologies Used

### Frontend
- **React** - UI framework
- **React Dropzone** - File upload handling
- **React Markdown** - Markdown rendering
- **React KaTeX** - LaTeX formula rendering
- **Lucide React** - Icons

### Backend
- **Express.js** - Web server
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **OpenAI API** - Image analysis and question generation

## Troubleshooting

### Common Issues

1. **"Failed to analyze image"**
   - Check your OpenAI API key is valid
   - Ensure the image file is not corrupted
   - Verify the image contains readable text/formulas

2. **"Failed to generate question"**
   - The OCR might not have extracted enough content
   - Try uploading a clearer image
   - Check your API key has sufficient credits

3. **Server won't start**
   - Ensure all dependencies are installed
   - Check if port 3001 is available
   - Verify Node.js version is 14 or higher

### API Key Security

- Your API key is stored locally in your browser's localStorage
- It's never sent to our servers
- You can change it anytime using the "Change API Key" button

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
