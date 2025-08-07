/**
 * Test Examples for Image Analyzer
 * This file demonstrates how to use the image analyzer function
 */

// Example 1: Basic usage with OpenAI Vision API
async function testBasicUsage() {
    console.log('=== Test 1: Basic Usage ===');
    
    try {
        // Simulate getting a file from input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        // Note: In real usage, you would get the file from user input
        // const imageFile = fileInput.files[0];
        
        // For testing, we'll simulate the result
        const mockResult = {
            success: true,
            data: {
                latex: '\\frac{x^2 + 1}{x - 2}',
                text: '이차함수의 분수 형태를 구하시오.',
                concepts: ['분수', '이차함수', '함수']
            }
        };
        
        console.log('Analysis Result:', mockResult);
        console.log('LaTeX:', mockResult.data.latex);
        console.log('Text:', mockResult.data.text);
        console.log('Concepts:', mockResult.data.concepts);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Example 2: Error handling
async function testErrorHandling() {
    console.log('\n=== Test 2: Error Handling ===');
    
    try {
        // Simulate API error
        const errorResult = {
            success: false,
            error: 'Invalid API key',
            data: {
                latex: '',
                text: '',
                concepts: []
            }
        };
        
        if (errorResult.success) {
            console.log('Analysis successful:', errorResult.data);
        } else {
            console.error('Analysis failed:', errorResult.error);
            console.log('Empty data returned:', errorResult.data);
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Example 3: Different API types
async function testDifferentAPIs() {
    console.log('\n=== Test 3: Different APIs ===');
    
    const testCases = [
        {
            name: 'Mathpix API (Math-focused)',
            useMathpix: true,
            description: 'Better for complex mathematical expressions'
        },
        {
            name: 'OpenAI Vision API (General)',
            useMathpix: false,
            description: 'Good for mixed content (text + math)'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n${testCase.name}:`);
        console.log(`Description: ${testCase.description}`);
        console.log(`useMathpix: ${testCase.useMathpix}`);
        
        // In real usage:
        // const result = await analyzeUploadedImage(imageFile, apiKey, testCase.useMathpix);
        console.log('Would call analyzeUploadedImage with these parameters');
    }
}

// Example 4: Processing different types of content
async function testContentTypes() {
    console.log('\n=== Test 4: Content Types ===');
    
    const contentExamples = [
        {
            type: 'Pure Math',
            latex: '\\int_0^1 x^2 dx = \\frac{1}{3}',
            text: '',
            concepts: ['적분', '정적분', '함수']
        },
        {
            type: 'Mixed Content',
            latex: 'f(x) = \\frac{ax + b}{cx + d}',
            text: '유리함수의 그래프를 그리시오.',
            concepts: ['유리함수', '분수', '함수']
        },
        {
            type: 'Text Only',
            latex: '',
            text: '삼각함수의 정의와 성질을 설명하시오.',
            concepts: ['삼각함수', '함수']
        }
    ];
    
    for (const example of contentExamples) {
        console.log(`\n${example.type}:`);
        console.log('LaTeX:', example.latex || '(none)');
        console.log('Text:', example.text || '(none)');
        console.log('Concepts:', example.concepts.join(', '));
    }
}

// Example 5: Integration with existing code
function testIntegration() {
    console.log('\n=== Test 5: Integration Example ===');
    
    // Simulate integrating with the existing chat application
    const chatIntegration = {
        // This would be called when a user uploads an image
        async handleImageUpload(file) {
            console.log('Image uploaded:', file.name);
            
            // Check if API key is available
            const apiKey = localStorage.getItem('openai_api_key') || 
                          localStorage.getItem('mathpix_api_key');
            
            if (!apiKey) {
                console.log('No API key found, prompting user...');
                return { error: 'API key required' };
            }
            
            // Determine which API to use
            const useMathpix = localStorage.getItem('mathpix_api_key') !== null;
            
            try {
                // In real usage:
                // const result = await analyzeUploadedImage(file, apiKey, useMathpix);
                
                // Simulate result
                const result = {
                    success: true,
                    data: {
                        latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
                        text: '사인함수의 극한값을 구하시오.',
                        concepts: ['극한', '삼각함수', '사인함수']
                    }
                };
                
                if (result.success) {
                    console.log('Analysis successful, processing results...');
                    
                    // Process the results for the chat
                    const processedData = {
                        mathExpressions: result.data.latex ? result.data.latex.split('\n') : [],
                        naturalText: result.data.text,
                        detectedConcepts: result.data.concepts,
                        summary: `Found ${result.data.concepts.length} mathematical concepts`
                    };
                    
                    console.log('Processed data:', processedData);
                    return processedData;
                } else {
                    console.error('Analysis failed:', result.error);
                    return { error: result.error };
                }
                
            } catch (error) {
                console.error('Integration error:', error);
                return { error: error.message };
            }
        }
    };
    
    // Test the integration
    const mockFile = { name: 'math_problem.jpg', size: 1024000 };
    chatIntegration.handleImageUpload(mockFile);
}

// Example 6: Custom concept detection
function testCustomConcepts() {
    console.log('\n=== Test 6: Custom Concept Detection ===');
    
    // Extend the concept detection
    const customConcepts = {
        // Korean concepts
        '미분계수': '미분계수',
        '도함수': '도함수',
        '부정적분': '부정적분',
        '정적분': '정적분',
        '수렴': '수렴',
        '발산': '발산',
        
        // English concepts
        'derivative': '도함수',
        'antiderivative': '부정적분',
        'definite integral': '정적분',
        'convergence': '수렴',
        'divergence': '발산'
    };
    
    console.log('Custom concepts added:', Object.keys(customConcepts));
    
    // Test concept detection
    const testText = '함수의 도함수를 구하고 정적분을 계산하시오.';
    const detectedConcepts = [];
    
    for (const [keyword, concept] of Object.entries(customConcepts)) {
        if (testText.includes(keyword)) {
            detectedConcepts.push(concept);
        }
    }
    
    console.log('Test text:', testText);
    console.log('Detected concepts:', detectedConcepts);
}

// Example 7: Performance optimization
function testPerformanceOptimization() {
    console.log('\n=== Test 7: Performance Optimization ===');
    
    const optimizationTips = [
        'Compress images before upload (target: < 5MB)',
        'Use appropriate image format (JPG for photos, PNG for diagrams)',
        'Ensure good contrast between text and background',
        'Orient text properly (avoid rotated images)',
        'Use high resolution but reasonable file size',
        'Cache API responses when possible',
        'Implement retry logic for failed requests'
    ];
    
    console.log('Performance optimization tips:');
    optimizationTips.forEach((tip, index) => {
        console.log(`${index + 1}. ${tip}`);
    });
    
    // Example of image preprocessing
    const imagePreprocessing = {
        async preprocessImage(file) {
            console.log('Preprocessing image:', file.name);
            
            // Check file size
            if (file.size > 5 * 1024 * 1024) {
                console.log('Image too large, consider compression');
            }
            
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Unsupported file type');
            }
            
            console.log('Image preprocessing completed');
            return file;
        }
    };
    
    // Test preprocessing
    const testFile = { name: 'test.jpg', size: 3 * 1024 * 1024, type: 'image/jpeg' };
    imagePreprocessing.preprocessImage(testFile);
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Image Analyzer Tests\n');
    
    await testBasicUsage();
    await testErrorHandling();
    await testDifferentAPIs();
    await testContentTypes();
    testIntegration();
    testCustomConcepts();
    testPerformanceOptimization();
    
    console.log('\n✅ All tests completed!');
    console.log('\nTo use the actual analyzer:');
    console.log('1. Include image-analyzer.js in your HTML');
    console.log('2. Get an API key from Mathpix or OpenAI');
    console.log('3. Call analyzeUploadedImage() with your image file');
    console.log('4. Open demo.html for a complete working example');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testBasicUsage,
        testErrorHandling,
        testDifferentAPIs,
        testContentTypes,
        testIntegration,
        testCustomConcepts,
        testPerformanceOptimization,
        runAllTests
    };
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test-example.js')) {
    runAllTests();
}
