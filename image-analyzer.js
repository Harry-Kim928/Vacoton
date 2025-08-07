/**
 * Image Analyzer - Extracts LaTeX math expressions and natural language text from images
 * Uses Mathpix API for mathematical notation recognition
 */

class ImageAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.mathpix.com/v3';
    }

    /**
     * Analyzes an uploaded image to extract LaTeX math expressions and natural language text
     * @param {File} imageFile - The uploaded image file
     * @returns {Promise<Object>} Analysis result with latex, text, and concepts
     */
    async analyzeImage(imageFile) {
        try {
            // Convert image to base64
            const base64Image = await this.fileToBase64(imageFile);
            
            // Call Mathpix API
            const response = await fetch(`${this.baseURL}/text`, {
                method: 'POST',
                headers: {
                    'app_id': 'your_app_id', // Replace with your Mathpix app_id
                    'app_key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    src: base64Image,
                    formats: ['text', 'latex_simplified', 'latex_full'],
                    data_options: {
                        include_asciimath: true,
                        include_latex: true,
                        include_mathml: false,
                        include_line_data: true
                    },
                    ocr_options: {
                        language: 'ko+en', // Korean and English
                        math_inline_delimiters: ['$', '$'],
                        math_display_delimiters: ['$$', '$$'],
                        rm_spaces: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Mathpix API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Process the results
            return this.processMathpixResult(result);
            
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    /**
     * Processes Mathpix API response to extract structured data
     * @param {Object} mathpixResult - Raw response from Mathpix API
     * @returns {Object} Processed result with latex, text, and concepts
     */
    processMathpixResult(mathpixResult) {
        const result = {
            latex: '',
            text: '',
            concepts: []
        };

        // Extract LaTeX expressions
        if (mathpixResult.latex_simplified) {
            result.latex = this.extractLatexExpressions(mathpixResult.latex_simplified);
        }

        // Extract natural language text
        if (mathpixResult.text) {
            result.text = this.extractNaturalLanguageText(mathpixResult.text);
        }

        // Extract mathematical concepts
        result.concepts = this.extractMathematicalConcepts(result.latex, result.text);

        return result;
    }

    /**
     * Extracts LaTeX expressions from Mathpix response
     * @param {string} latexSimplified - Simplified LaTeX from Mathpix
     * @returns {string} Cleaned LaTeX expressions
     */
    extractLatexExpressions(latexSimplified) {
        // Remove common OCR artifacts and clean up LaTeX
        let cleanedLatex = latexSimplified
            .replace(/\\text\{([^}]*)\}/g, '$1') // Remove \text{} wrappers
            .replace(/\\mathrm\{([^}]*)\}/g, '$1') // Remove \mathrm{} wrappers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Extract only mathematical expressions (remove plain text)
        const mathExpressions = [];
        const lines = cleanedLatex.split('\n');
        
        for (const line of lines) {
            if (this.isMathematicalExpression(line)) {
                mathExpressions.push(line.trim());
            }
        }

        return mathExpressions.join('\n');
    }

    /**
     * Extracts natural language text from Mathpix response
     * @param {string} text - Raw text from Mathpix
     * @returns {string} Cleaned natural language text
     */
    extractNaturalLanguageText(text) {
        // Remove LaTeX expressions and keep only natural language
        let cleanedText = text
            .replace(/\$[^$]*\$/g, '') // Remove inline math
            .replace(/\$\$[^$]*\$\$/g, '') // Remove display math
            .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove LaTeX commands
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        // Split into lines and filter out empty or math-only lines
        const lines = cleanedText.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !this.isMathematicalExpression(line));

        return lines.join('\n');
    }

    /**
     * Extracts mathematical concepts from LaTeX and text
     * @param {string} latex - LaTeX expressions
     * @param {string} text - Natural language text
     * @returns {Array} Array of mathematical concepts
     */
    extractMathematicalConcepts(latex, text) {
        const concepts = new Set();

        // Extract concepts from LaTeX
        if (latex) {
            // Common mathematical functions and symbols
            const mathFunctions = [
                '\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\exp', '\\sqrt',
                '\\frac', '\\sum', '\\int', '\\lim', '\\infty', '\\pi', '\\theta',
                '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\phi'
            ];

            for (const func of mathFunctions) {
                if (latex.includes(func)) {
                    concepts.add(this.getConceptName(func));
                }
            }

            // Check for specific mathematical areas
            if (latex.includes('\\frac')) concepts.add('분수');
            if (latex.includes('\\sqrt')) concepts.add('제곱근');
            if (latex.includes('\\sum')) concepts.add('급수');
            if (latex.includes('\\int')) concepts.add('적분');
            if (latex.includes('\\lim')) concepts.add('극한');
            if (latex.includes('\\sin') || latex.includes('\\cos') || latex.includes('\\tan')) {
                concepts.add('삼각함수');
            }
        }

        // Extract concepts from text
        if (text) {
            const koreanConcepts = {
                '함수': '함수',
                '방정식': '방정식',
                '부등식': '부등식',
                '미분': '미분',
                '적분': '적분',
                '극한': '극한',
                '수열': '수열',
                '급수': '급수',
                '확률': '확률',
                '통계': '통계',
                '기하': '기하',
                '벡터': '벡터',
                '행렬': '행렬',
                '이차함수': '이차함수',
                '삼각함수': '삼각함수',
                '지수함수': '지수함수',
                '로그함수': '로그함수'
            };

            for (const [keyword, concept] of Object.entries(koreanConcepts)) {
                if (text.includes(keyword)) {
                    concepts.add(concept);
                }
            }

            // English concepts
            const englishConcepts = {
                'function': '함수',
                'equation': '방정식',
                'inequality': '부등식',
                'derivative': '미분',
                'integral': '적분',
                'limit': '극한',
                'sequence': '수열',
                'series': '급수',
                'probability': '확률',
                'statistics': '통계',
                'geometry': '기하',
                'vector': '벡터',
                'matrix': '행렬',
                'quadratic': '이차함수',
                'trigonometric': '삼각함수',
                'exponential': '지수함수',
                'logarithmic': '로그함수'
            };

            for (const [keyword, concept] of Object.entries(englishConcepts)) {
                if (text.toLowerCase().includes(keyword)) {
                    concepts.add(concept);
                }
            }
        }

        return Array.from(concepts);
    }

    /**
     * Checks if a string is a mathematical expression
     * @param {string} str - String to check
     * @returns {boolean} True if mathematical expression
     */
    isMathematicalExpression(str) {
        const mathPatterns = [
            /\\[a-zA-Z]+/, // LaTeX commands
            /[+\-*/=<>≤≥≠∫∑∏√∞πθαβγδεζηικλμνξοπρστυφχψω]/,
            /\d+/, // Numbers
            /[a-zA-Z]\s*[+\-*/=]\s*[a-zA-Z]/, // Variables with operators
            /\$.*\$/, // Inline math
            /\$\$.*\$\$/ // Display math
        ];

        return mathPatterns.some(pattern => pattern.test(str));
    }

    /**
     * Gets human-readable concept name from LaTeX command
     * @param {string} latexCommand - LaTeX command
     * @returns {string} Concept name
     */
    getConceptName(latexCommand) {
        const conceptMap = {
            '\\sin': '사인함수',
            '\\cos': '코사인함수',
            '\\tan': '탄젠트함수',
            '\\log': '로그함수',
            '\\ln': '자연로그',
            '\\exp': '지수함수',
            '\\sqrt': '제곱근',
            '\\frac': '분수',
            '\\sum': '급수',
            '\\int': '적분',
            '\\lim': '극한',
            '\\infty': '무한대',
            '\\pi': '원주율',
            '\\theta': '각도',
            '\\alpha': '알파',
            '\\beta': '베타',
            '\\gamma': '감마',
            '\\delta': '델타',
            '\\epsilon': '엡실론',
            '\\phi': '파이'
        };

        return conceptMap[latexCommand] || '수학표현';
    }

    /**
     * Converts file to base64 string
     * @param {File} file - File to convert
     * @returns {Promise<string>} Base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data URL prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Alternative implementation using OpenAI Vision API (fallback)
class OpenAIVisionAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.openai.com/v1';
    }

    /**
     * Analyzes image using OpenAI Vision API
     * @param {File} imageFile - The uploaded image file
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeImage(imageFile) {
        try {
            const base64Image = await this.fileToBase64(imageFile);
            
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `이 이미지에서 다음을 추출해주세요:

1. LaTeX 형식의 수학 표현식 (있는 경우)
2. 자연어 텍스트 (한국어 또는 영어)
3. 수학적 개념 키워드

다음 JSON 형식으로 응답해주세요:
{
  "latex": "수학 표현식들...",
  "text": "자연어 텍스트...",
  "concepts": ["개념1", "개념2", ...]
}

수학 표현식이 없다면 latex 필드는 빈 문자열로, 자연어 텍스트가 없다면 text 필드는 빈 문자열로 응답해주세요.`
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.1
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const result = await response.json();
            const content = result.choices[0].message.content;
            
            // Try to parse JSON response
            try {
                return JSON.parse(content);
            } catch (parseError) {
                // If JSON parsing fails, extract information manually
                return this.extractFromTextResponse(content);
            }
            
        } catch (error) {
            console.error('OpenAI Vision analysis error:', error);
            throw error;
        }
    }

    /**
     * Extracts information from text response when JSON parsing fails
     * @param {string} text - Text response from OpenAI
     * @returns {Object} Structured result
     */
    extractFromTextResponse(text) {
        const result = {
            latex: '',
            text: '',
            concepts: []
        };

        // Extract LaTeX expressions (anything between $ or $$)
        const latexMatches = text.match(/\$\$([^$]+)\$\$|\$([^$]+)\$/g);
        if (latexMatches) {
            result.latex = latexMatches.join('\n');
        }

        // Extract concepts (look for mathematical terms)
        const conceptKeywords = [
            '함수', '방정식', '부등식', '미분', '적분', '극한', '수열', '급수',
            '확률', '통계', '기하', '벡터', '행렬', '이차함수', '삼각함수',
            '지수함수', '로그함수', 'function', 'equation', 'derivative',
            'integral', 'limit', 'sequence', 'series', 'probability'
        ];

        for (const keyword of conceptKeywords) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                result.concepts.push(keyword);
            }
        }

        // Extract text (remove LaTeX and keep natural language)
        result.text = text
            .replace(/\$\$[^$]*\$\$/g, '')
            .replace(/\$[^$]*\$/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return result;
    }

    /**
     * Converts file to base64 string
     * @param {File} file - File to convert
     * @returns {Promise<string>} Base64 string
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Main function to analyze uploaded images
async function analyzeUploadedImage(imageFile, apiKey, useMathpix = false) {
    try {
        let analyzer;
        
        if (useMathpix) {
            analyzer = new ImageAnalyzer(apiKey);
        } else {
            analyzer = new OpenAIVisionAnalyzer(apiKey);
        }
        
        const result = await analyzer.analyzeImage(imageFile);
        
        // If concept mapper is available, use it for enhanced concept detection
        if (typeof mapOCRToConcepts === 'function') {
            const conceptMapping = mapOCRToConcepts(result);
            result.concepts = conceptMapping.concepts;
            result.conceptDetails = conceptMapping.detailed;
            result.conceptConfidence = conceptMapping.confidence;
        }
        
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        console.error('Image analysis failed:', error);
        return {
            success: false,
            error: error.message,
            data: {
                latex: '',
                text: '',
                concepts: []
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ImageAnalyzer,
        OpenAIVisionAnalyzer,
        analyzeUploadedImage
    };
}
