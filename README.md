# Image Analyzer - LaTeX & Text Extraction

A powerful JavaScript function that extracts LaTeX math expressions and natural language text from uploaded images using OCR APIs.

## Features

- 📸 **Image Upload**: Support for JPG, PNG, GIF formats (max 10MB)
- 🧮 **LaTeX Extraction**: Extracts mathematical expressions in LaTeX format
- 📝 **Text Recognition**: Extracts natural language text (Korean and English)
- 🏷️ **Concept Detection**: Automatically identifies mathematical concepts
- 🔄 **Multiple APIs**: Support for both Mathpix OCR and OpenAI Vision APIs
- 📱 **Responsive Design**: Works on desktop and mobile devices

## API Requirements

### Option 1: Mathpix OCR API (Recommended for Math)
- **Specialized** for mathematical notation recognition
- **Better accuracy** for complex mathematical expressions
- **Sign up**: [Mathpix API](https://mathpix.com/)
- **Cost**: Free tier available, then pay-per-use

### Option 2: OpenAI Vision API (Recommended for General Use)
- **General purpose** image analysis
- **Good for** mixed content (text + math)
- **Sign up**: [OpenAI API](https://platform.openai.com/)
- **Cost**: Pay-per-use

## Quick Start

### 1. Include the Script

```html
<script src="image-analyzer.js"></script>
```

### 2. Basic Usage

```javascript
// Get your API key from Mathpix or OpenAI
const apiKey = 'your_api_key_here';

// Analyze an image file
const imageFile = document.getElementById('fileInput').files[0];
const useMathpix = true; // Set to false for OpenAI Vision

const result = await analyzeUploadedImage(imageFile, apiKey, useMathpix);

if (result.success) {
    console.log('LaTeX:', result.data.latex);
    console.log('Text:', result.data.text);
    console.log('Concepts:', result.data.concepts);
} else {
    console.error('Error:', result.error);
}
```

### 3. Demo Page

Open `demo.html` in your browser to see a complete working example.

## API Response Format

The function returns data in the following format:

```javascript
{
  "success": true,
  "data": {
    "latex": "\\frac{a}{b} + \\sqrt{c^2 + d^2}",
    "text": "이차함수의 최댓값을 구하시오.",
    "concepts": ["분수", "제곱근", "이차함수"]
  }
}
```

### Field Descriptions

- **`latex`**: LaTeX-formatted mathematical expressions
- **`text`**: Natural language text (Korean or English)
- **`concepts`**: Array of detected mathematical concepts

## Advanced Usage

### Using Mathpix API

```javascript
const analyzer = new ImageAnalyzer('your_mathpix_api_key');
const result = await analyzer.analyzeImage(imageFile);
```

### Using OpenAI Vision API

```javascript
const analyzer = new OpenAIVisionAnalyzer('your_openai_api_key');
const result = await analyzer.analyzeImage(imageFile);
```

### Custom Concept Detection

```javascript
// The analyzer automatically detects concepts, but you can extend it:
const customConcepts = {
    '미분': '미분',
    '적분': '적분',
    '함수': '함수'
    // Add more concepts as needed
};
```

## Supported Mathematical Concepts

The analyzer automatically detects these mathematical concepts:

### Korean Concepts
- 함수, 방정식, 부등식, 미분, 적분, 극한
- 수열, 급수, 확률, 통계, 기하, 벡터
- 행렬, 이차함수, 삼각함수, 지수함수, 로그함수

### English Concepts
- function, equation, inequality, derivative, integral
- limit, sequence, series, probability, statistics
- geometry, vector, matrix, quadratic, trigonometric
- exponential, logarithmic

### LaTeX Functions
- `\sin`, `\cos`, `\tan`, `\log`, `\ln`, `\exp`
- `\sqrt`, `\frac`, `\sum`, `\int`, `\lim`
- `\infty`, `\pi`, `\theta`, `\alpha`, `\beta`, etc.

## Error Handling

```javascript
try {
    const result = await analyzeUploadedImage(imageFile, apiKey, useMathpix);
    
    if (result.success) {
        // Process successful result
        console.log(result.data);
    } else {
        // Handle API errors
        console.error('Analysis failed:', result.error);
    }
} catch (error) {
    // Handle network or other errors
    console.error('Unexpected error:', error);
}
```

## Common Error Scenarios

1. **Invalid API Key**: Check your API key format and permissions
2. **File Too Large**: Ensure image is under 10MB
3. **Unsupported Format**: Use JPG, PNG, or GIF formats
4. **Network Issues**: Check your internet connection
5. **API Rate Limits**: Wait before making additional requests

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## File Size Limits

- **Mathpix API**: 10MB per image
- **OpenAI Vision API**: 20MB per image
- **Recommended**: Keep images under 5MB for best performance

## Performance Tips

1. **Image Quality**: Use clear, high-resolution images
2. **File Size**: Compress images to reduce upload time
3. **Text Orientation**: Ensure text is properly oriented
4. **Contrast**: Use images with good contrast between text and background

## Integration Examples

### React Component

```jsx
import { analyzeUploadedImage } from './image-analyzer.js';

function ImageAnalyzerComponent() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = async (file) => {
        setLoading(true);
        try {
            const analysis = await analyzeUploadedImage(file, apiKey, false);
            setResult(analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
            {loading && <p>Analyzing...</p>}
            {result && (
                <div>
                    <h3>LaTeX: {result.data.latex}</h3>
                    <h3>Text: {result.data.text}</h3>
                    <h3>Concepts: {result.data.concepts.join(', ')}</h3>
                </div>
            )}
        </div>
    );
}
```

### Vue.js Component

```vue
<template>
    <div>
        <input type="file" @change="handleFileUpload" />
        <div v-if="loading">Analyzing...</div>
        <div v-if="result">
            <h3>LaTeX: {{ result.data.latex }}</h3>
            <h3>Text: {{ result.data.text }}</h3>
            <h3>Concepts: {{ result.data.concepts.join(', ') }}</h3>
        </div>
    </div>
</template>

<script>
import { analyzeUploadedImage } from './image-analyzer.js';

export default {
    data() {
        return {
            result: null,
            loading: false
        };
    },
    methods: {
        async handleFileUpload(event) {
            const file = event.target.files[0];
            this.loading = true;
            try {
                this.result = await analyzeUploadedImage(file, this.apiKey, false);
            } catch (error) {
                console.error('Analysis failed:', error);
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the demo page (`demo.html`) for working examples
2. Review the error handling section
3. Ensure your API keys are valid and have proper permissions
4. Check browser console for detailed error messages

## Changelog

### v1.0.0
- Initial release
- Mathpix OCR API support
- OpenAI Vision API support
- LaTeX and text extraction
- Mathematical concept detection
- Responsive demo interface
