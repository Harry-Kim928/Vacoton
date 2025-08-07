const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Question generation function (enhanced version with curriculum analysis)
async function generateQuestion(ocrResult, apiKey) {
  // 커리큘럼 분석기 사용
  const { CurriculumAnalyzer } = require('./curriculum-analyzer.js');
  const curriculumAnalyzer = new CurriculumAnalyzer();
  
  // 이미지에서 추출된 개념들을 분석
  const concepts = ocrResult.concepts || [];
  const curriculumAnalysis = curriculumAnalyzer.analyzeConcepts(concepts);
  
  // 난이도 결정
  const level = curriculumAnalyzer.getDifficultyLevel(curriculumAnalysis.grade);
  
  // 주요 개념 추출 (가장 많이 매칭된 개념들)
  const mainConcepts = curriculumAnalysis.subConcepts.length > 0 
    ? curriculumAnalysis.subConcepts.join(', ')
    : concepts.join(', ');

  const prompt = `다음 수학 문제를 바탕으로, 해당 문제 안에서만 질문을 생성해주세요.

**업로드된 이미지에서 추출된 개념들:**
${concepts.join(', ')}

**커리큘럼 분석 결과:**
- 학년: ${curriculumAnalysis.grade || '미분류'}
- 단원: ${curriculumAnalysis.unit || '미분류'}
- 세부 개념: ${curriculumAnalysis.subConcepts.join(', ') || '미분류'}
- 난이도: ${level}

**원본 문제 내용:**
${ocrResult.text || '이미지에서 추출된 텍스트'}

${ocrResult.latex ? `**수학 표현식:**\n${ocrResult.latex}\n` : ''}

[질문 생성 지침]
- 반드시 업로드된 이미지에서 추출된 개념들(${concepts.join(', ')})을 바탕으로 질문을 생성할 것
- 해당 문제의 조건을 바꾸어 답이나 풀이, 개념이 어떻게 변경되는지 물어보는 질문
- '왜 그렇게 되는지?' 또는 '조건이 바뀐다면?' 식으로 사고를 유도할 것
- 해당 개념에서 헷갈릴 만한 포인트를 정확히 집어낼 것

다음 형식으로 답변해주세요:

**질문:**
[업로드된 이미지의 개념을 바탕으로 한 구체적인 수학 문제]

**핵심 개념:**
[이 문제에서 테스트하는 핵심 수학 개념들 - 반드시 업로드된 이미지의 개념 포함]

**추론 과정:**
[학생이 따라야 할 논리적 추론 과정]

**엄격한 제한사항:**
- 반드시 업로드된 이미지에서 추출된 개념들(${concepts.join(', ')})을 바탕으로 출제하세요
- 실생활 예시나 다른 분야로의 확장을 절대 금지합니다
- 해당 문제의 조건 변경과 이해에만 집중하세요
- 추출된 개념과 전혀 관련 없는 문제(예: 원주각 문제인데 사각형 둘레 문제)를 출제하지 마세요`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 수학 교육 전문가입니다. 학생들의 이해를 돕는 명확하고 교육적인 질문을 생성합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  // Parse the response
  const questionMatch = content.match(/\*\*질문:\*\*\s*([\s\S]*?)(?=\*\*핵심 개념:\*\*|$)/);
  const conceptMatch = content.match(/\*\*핵심 개념:\*\*\s*([\s\S]*?)(?=\*\*추론 과정:\*\*|$)/);
  const reasoningMatch = content.match(/\*\*추론 과정:\*\*\s*([\s\S]*?)$/);

  return {
    question: questionMatch ? questionMatch[1].trim() : content,
    concepts: conceptMatch ? conceptMatch[1].trim() : '',
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : '',
    concept: concept,
    level: level
  };
}

// API Routes

// Analyze image with OCR
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const { apiKey } = req.body;
    const imageFile = req.file;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Convert buffer to base64 for OpenAI Vision API
    const base64Image = imageFile.buffer.toString('base64');
    
    // Call OpenAI Vision API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
                  url: `data:${imageFile.mimetype};base64,${base64Image}`
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
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, extract information manually
      parsedResult = {
        latex: '',
        text: content,
        concepts: []
      };
      
      // Extract LaTeX expressions (anything between $ or $$)
      const latexMatches = content.match(/\$\$([^$]+)\$\$|\$([^$]+)\$/g);
      if (latexMatches) {
        parsedResult.latex = latexMatches.join('\n');
      }
      
      // Extract concepts (look for mathematical terms)
      const conceptKeywords = [
        '함수', '방정식', '부등식', '미분', '적분', '극한', '수열', '급수',
        '확률', '통계', '기하', '벡터', '행렬', '이차함수', '삼각함수',
        '지수함수', '로그함수', 'function', 'equation', 'derivative',
        'integral', 'limit', 'sequence', 'series', 'probability'
      ];

      for (const keyword of conceptKeywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          parsedResult.concepts.push(keyword);
        }
      }
    }

    res.json({
      text: parsedResult.text,
      latex: parsedResult.latex,
      concepts: parsedResult.concepts
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

// Generate question based on OCR result
app.post('/api/generate-question', async (req, res) => {
  try {
    const { ocrResult, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!ocrResult) {
      return res.status(400).json({ error: 'OCR result is required' });
    }

    // Generate question using OCR result and curriculum analysis
    const questionResult = await generateQuestion(ocrResult, apiKey);

    res.json({
      question: questionResult.question,
      latex: questionResult.latex || '',
      concept: mainConcept,
      level: questionResult.level
    });

  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate question',
      details: error.message 
    });
  }
});

// Generate specialized questions
app.post('/api/generate-specialized-questions', async (req, res) => {
  try {
    const { problemData, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!problemData || !problemData.concepts) {
      return res.status(400).json({ error: 'Problem data with concepts is required' });
    }

    // 커리큘럼 분석기 사용
    const { CurriculumAnalyzer } = require('./curriculum-analyzer.js');
    const curriculumAnalyzer = new CurriculumAnalyzer();
    
    // 개념을 배열로 변환
    const concepts = problemData.concepts ? problemData.concepts.split(',').map(c => c.trim()) : [];
    const curriculumAnalysis = curriculumAnalyzer.analyzeConcepts(concepts);
    const level = curriculumAnalyzer.getDifficultyLevel(curriculumAnalysis.grade);

    const prompt = `다음 수학 문제를 바탕으로, 해당 문제 안에서만 질문을 생성해주세요.

**업로드된 이미지에서 추출된 개념들:**
${concepts.join(', ')}

**커리큘럼 분석 결과:**
- 학년: ${curriculumAnalysis.grade || '미분류'}
- 단원: ${curriculumAnalysis.unit || '미분류'}
- 세부 개념: ${curriculumAnalysis.subConcepts.join(', ') || '미분류'}
- 난이도: ${level}

**원본 문제:**
${problemData.problemText || '이미지에서 추출된 문제'}

${problemData.latex ? `**수학 표현식:**\n${problemData.latex}\n` : ''}

다음 세 가지 유형의 질문을 각각 1~2개씩 생성해주세요:

## 1. 개념 진단 질문
- 학생이 해당 문제에서 사용되는 핵심 개념을 정확히 이해하고 있는지 확인하는 질문
- 해당 문제 내에서 나타나는 정의나 성질에 대한 정확한 이해를 테스트

## 2. 조건 변경 질문  
- 해당 문제의 조건을 바꾸어 답이나 풀이, 개념이 어떻게 변경되는지 물어보는 질문
- "만약 이 문제에서 ~가 바뀐다면 답은 어떻게 될까?" 형태
- 수식을 바꾸거나 조건을 변경했을 때의 변화에 집중

## 3. 오개념 탐색 질문
- 해당 문제를 풀 때 학생들이 자주 틀리는 부분이나 헷갈리는 개념을 집어내는 질문
- 해당 문제 내에서 발생할 수 있는 오개념을 유발하는 상황을 제시

다음 형식으로 답변해주세요:

**1. 개념 진단 질문:**
[질문 1]
[질문 2]

**2. 조건 변경 질문:**
[질문 1]
[질문 2]

**3. 오개념 탐색 질문:**
[질문 1]
[질문 2]

**엄격한 제한사항:**
- 반드시 업로드된 이미지에서 추출된 개념들(${concepts.join(', ')})을 바탕으로 출제하세요
- 실생활 예시나 다른 분야로의 확장을 절대 금지합니다
- 추출된 개념과 전혀 관련 없는 문제(예: 원주각 문제인데 사각형 둘레 문제)를 출제하지 마세요
- 해당 문제의 조건 변경과 개념적 이해에만 집중하세요
- 문제의 목적은 학습자가 해당 문제에 대해 더 깊이 사고하는 것을 유도하는 것입니다`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 수학 전문 튜터입니다. 업로드된 문제 안에서만 질문을 출제하며, 실생활 예시나 다른 분야로의 확장을 절대 금지합니다. 해당 문제의 조건 변경과 개념적 이해에만 집중하여, 학습자가 해당 문제에 대해 더 깊이 사고하도록 유도합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    // Parse the response
    const parsedResult = parseSpecializedResponse(content);

    res.json(parsedResult);

  } catch (error) {
    console.error('Specialized question generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate specialized questions',
      details: error.message 
    });
  }
});

// Helper function to parse specialized response
function parseSpecializedResponse(content) {
  const result = {
    conceptDiagnosis: [],
    conditionChange: [],
    misconceptionExploration: []
  };

  // Extract concept diagnosis questions
  const conceptMatch = content.match(/\*\*1\. 개념 진단 질문:\*\*\s*([\s\S]*?)(?=\*\*2\. 조건 변경 질문:\*\*|$)/);
  if (conceptMatch) {
    result.conceptDiagnosis = extractQuestions(conceptMatch[1]);
  }

  // Extract condition change questions
  const conditionMatch = content.match(/\*\*2\. 조건 변경 질문:\*\*\s*([\s\S]*?)(?=\*\*3\. 오개념 탐색 질문:\*\*|$)/);
  if (conditionMatch) {
    result.conditionChange = extractQuestions(conditionMatch[1]);
  }

  // Extract misconception exploration questions
  const misconceptionMatch = content.match(/\*\*3\. 오개념 탐색 질문:\*\*\s*([\s\S]*?)(?=\*\*주의사항:\*\*|$)/);
  if (misconceptionMatch) {
    result.misconceptionExploration = extractQuestions(misconceptionMatch[1]);
  }

  return result;
}

function extractQuestions(text) {
  const questions = text
    .split(/\n\s*\[질문\s*\d+\]|\n\s*[•·]\s*|\n\s*\d+\.\s*/)
    .map(q => q.trim())
    .filter(q => q.length > 10);
  
  return questions;
}

// Generate feedback for user answer
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { userAnswer, questionData, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    if (!userAnswer || !questionData) {
      return res.status(400).json({ error: 'User answer and question data are required' });
    }

    // Create feedback prompt
    const feedbackPrompt = `
다음 수학 문제에 대한 학생의 답변을 평가하고 피드백을 제공해주세요:

**문제:**
${questionData.question}

**학생 답변:**
${userAnswer}

다음 형식으로 답변해주세요:

**피드백:**
[학생 답변에 대한 구체적이고 건설적인 피드백 - 정확한 부분과 개선이 필요한 부분을 명확히 구분]

**개선점:**
[학생이 개선할 수 있는 부분들 - 해당 문제 내에서의 구체적인 학습 방향 제시]

**추가 질문:**
[해당 문제와 관련된 후속 질문 - '왜 그렇게 되는지?' 또는 '조건이 바뀐다면?' 형태로 해당 문제에 대한 더 깊은 이해 유도]

**엄격한 제한사항:**
- 반드시 해당 문제 내에서만 피드백과 후속 질문을 제공하세요
- 실생활 예시나 다른 분야로의 확장을 절대 금지합니다
- 해당 문제의 조건 변경과 개념적 이해에만 집중하세요
`;

    // Call OpenAI API for feedback
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 수학 교육 전문가입니다. 학생들의 답변에 대해 친절하고 건설적인 피드백을 제공하고, 학습을 돕는 후속 질문을 제시합니다.'
          },
          {
            role: 'user',
            content: feedbackPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const feedbackContent = result.choices[0].message.content;

    // Parse the feedback response
    const feedbackMatch = feedbackContent.match(/\*\*피드백:\*\*\s*([\s\S]*?)(?=\*\*개선점:\*\*|\*\*추가 질문:\*\*|$)/);
    const improvementMatch = feedbackContent.match(/\*\*개선점:\*\*\s*([\s\S]*?)(?=\*\*추가 질문:\*\*|$)/);
    const followUpMatch = feedbackContent.match(/\*\*추가 질문:\*\*\s*([\s\S]*?)$/);

    const feedback = feedbackMatch ? feedbackMatch[1].trim() : feedbackContent;
    const improvements = improvementMatch ? improvementMatch[1].trim() : '';
    const followUpQuestion = followUpMatch ? followUpMatch[1].trim() : '';

    res.json({
      feedback: feedback,
      improvements: improvements,
      followUpQuestion: followUpQuestion
    });

  } catch (error) {
    console.error('Feedback generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
