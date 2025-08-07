/**
 * Deep Mathematical Question Generator
 * Uses GPT API to generate concept-driven questions that test critical thinking
 */

class QuestionGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.openai.com/v1';
        this.promptTemplate = this.getPromptTemplate();
    }

    /**
     * Generates a deep mathematical question for a given concept
     * @param {Object} params - Question generation parameters
     * @param {string} params.concept - Mathematical concept (e.g., "미분 가능성")
     * @param {string} params.level - Difficulty level (Basic/Intermediate/Advanced)
     * @param {string} params.focus - Optional specific aspect to focus on
     * @param {string} params.language - Language for the question (ko/en)
     * @returns {Promise<Object>} Generated question with metadata
     */
    async generateQuestion(params) {
        const { concept, level = 'Intermediate', focus = '', language = 'ko' } = params;
        
        try {
            const prompt = this.buildPrompt(concept, level, focus, language);
            
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: this.promptTemplate
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            const content = result.choices[0].message.content;
            
            return this.parseResponse(content, concept, level);
            
        } catch (error) {
            console.error('Question generation failed:', error);
            throw error;
        }
    }

    /**
     * Builds the prompt for question generation
     * @param {string} concept - Mathematical concept
     * @param {string} level - Difficulty level
     * @param {string} focus - Specific focus area
     * @param {string} language - Language preference
     * @returns {string} Formatted prompt
     */
    buildPrompt(concept, level, focus, language) {
        const languagePrefix = language === 'ko' ? '한국어로' : 'In English';
        
        let prompt = `${languagePrefix} 다음 수학 개념에 대한 깊이 있는 개념적 질문을 생성해주세요:\n\n`;
        prompt += `Concept: ${concept}\n`;
        prompt += `Level: ${level}\n`;
        
        if (focus) {
            prompt += `Focus: ${focus}\n`;
        }
        
        prompt += `\n위의 지침에 따라 다음 형식으로 답변해주세요:\n\n`;
        prompt += `Question: [생성된 질문]\n\n`;
        prompt += `Question Type: [질문 유형]\n\n`;
        prompt += `Conceptual Focus: [테스트하는 개념적 이해의 측면]\n\n`;
        prompt += `Expected Reasoning: [학생이 보여야 할 추론 과정]\n\n`;
        prompt += `Difficulty Indicators: [표면적 이해 vs 깊은 이해의 구분]\n\n`;
        prompt += `Follow-up Questions: [추가 심화 질문 2-3개]\n\n`;
        
        return prompt;
    }

    /**
     * Parses the GPT response into structured format
     * @param {string} content - Raw response from GPT
     * @param {string} concept - Original concept
     * @param {string} level - Original level
     * @returns {Object} Parsed question data
     */
    parseResponse(content, concept, level) {
        try {
            // Extract different sections using regex
            const questionMatch = content.match(/Question:\s*(.+?)(?=\n\n|\nQuestion Type:)/s);
            const typeMatch = content.match(/Question Type:\s*(.+?)(?=\n\n|\nConceptual Focus:)/s);
            const focusMatch = content.match(/Conceptual Focus:\s*(.+?)(?=\n\n|\nExpected Reasoning:)/s);
            const reasoningMatch = content.match(/Expected Reasoning:\s*(.+?)(?=\n\n|\nDifficulty Indicators:)/s);
            const indicatorsMatch = content.match(/Difficulty Indicators:\s*(.+?)(?=\n\n|\nFollow-up Questions:)/s);
            const followUpMatch = content.match(/Follow-up Questions:\s*(.+?)(?=\n\n|$)/s);

            return {
                concept: concept,
                level: level,
                question: questionMatch ? questionMatch[1].trim() : '',
                questionType: typeMatch ? typeMatch[1].trim() : '',
                conceptualFocus: focusMatch ? this.parseList(focusMatch[1]) : [],
                expectedReasoning: reasoningMatch ? this.parseList(reasoningMatch[1]) : [],
                difficultyIndicators: indicatorsMatch ? this.parseDifficultyIndicators(indicatorsMatch[1]) : {},
                followUpQuestions: followUpMatch ? this.parseList(followUpMatch[1]) : [],
                rawResponse: content,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Response parsing failed:', error);
            return {
                concept: concept,
                level: level,
                question: content,
                error: 'Failed to parse structured response',
                rawResponse: content,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Parses a list from text (bullet points or numbered items)
     * @param {string} text - Text containing list items
     * @returns {Array} Array of list items
     */
    parseList(text) {
        if (!text) return [];
        
        // Split by common list patterns
        const items = text.split(/\n\s*[-•*]\s*|\n\s*\d+\.\s*|\n\s*-\s*/);
        
        return items
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => item.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, ''));
    }

    /**
     * Parses difficulty indicators into structured format
     * @param {string} text - Text containing difficulty indicators
     * @returns {Object} Structured difficulty indicators
     */
    parseDifficultyIndicators(text) {
        if (!text) return {};
        
        const indicators = {};
        
        // Look for surface vs deep understanding patterns
        const surfaceMatch = text.match(/표면적 이해[:\s]*([^깊은]+)/);
        const deepMatch = text.match(/깊은 이해[:\s]*([^표면적]+)/);
        
        if (surfaceMatch) {
            indicators.surface = surfaceMatch[1].trim();
        }
        
        if (deepMatch) {
            indicators.deep = deepMatch[1].trim();
        }
        
        // If no structured format found, return as raw text
        if (Object.keys(indicators).length === 0) {
            indicators.raw = text.trim();
        }
        
        return indicators;
    }

    /**
     * Gets the prompt template for question generation
     * @returns {string} The complete prompt template
     */
    getPromptTemplate() {
        return `당신은 고등학교 수학의 깊이 있는 개념적 이해를 평가하는 전문가입니다. 주어진 수학 개념에 대해 학생의 비판적 사고력과 개념적 이해를 테스트하는 질문을 생성해주세요.

## 질문 생성 지침

### 핵심 원칙
1. **계산보다 개념에 집중**: 단순한 계산이 아닌 개념적 이해를 테스트
2. **비판적 사고 유도**: "왜 그런가?", "어떤 경우에 실패하는가?" 질문
3. **조건의 중요성 탐구**: 조건을 제거하거나 변경했을 때의 결과 분석
4. **관련 개념과의 연결**: 다른 개념과의 관계와 차이점 탐구
5. **예외 상황 분석**: 개념이 적용되지 않는 경우나 반례 탐구

### 질문 유형별 접근법

#### 1. 조건 제거 분석
- 핵심 조건을 제거하고 결과 예측 요구
- 각 조건의 필요성에 대한 이해 테스트
- 조건들 간의 상호 의존성 탐구

#### 2. 개념 비교 및 대조
- 관련된 개념들의 유사점과 차이점 분석
- 언제 어떤 개념을 사용해야 하는지 판단
- 개념들 간의 위계 관계 이해

#### 3. 예외 및 반례 탐구
- 개념이 적용되지 않는 경우 찾기
- 경계 조건이나 특수한 상황 분석
- 개념의 한계와 적용 범위 이해

#### 4. 개념적 추론
- 기본 원리의 근본적 이유 탐구
- 수학적 논리의 기초 이해
- 정의와 정리의 논리적 연결

#### 5. 조건부 분석
- "만약 ~라면?" 시나리오 탐구
- 매개변수 변화의 영향 분석
- 개념의 유연성과 적응성 테스트

### 질문 생성 규칙

#### 필수 포함 요소
1. **개념의 본질적 특성**에 대한 질문
2. **조건이나 가정의 역할**에 대한 이해
3. **관련 개념과의 관계**에 대한 분석
4. **예외 상황이나 경계 조건**에 대한 인식
5. **수학적 추론 과정**에 대한 설명 요구

#### 질문 스타일
- **개방형 질문**: "왜 그런가요?", "어떤 경우에 실패하나요?"
- **비교 분석**: "A와 B의 차이점은 무엇인가요?"
- **조건 변경**: "만약 ~ 조건이 없다면 어떻게 될까요?"
- **반례 탐구**: "이 개념이 적용되지 않는 예를 들어보세요"
- **추론 과정**: "어떤 논리적 과정을 거쳐 이 결론에 도달했나요?"

#### 난이도 조절
- **기초**: 정의와 기본 성질의 이해
- **중급**: 조건 분석과 예외 상황 인식
- **고급**: 복합 개념 분석과 창의적 사고

### 질문 품질 기준

#### 우수한 질문의 특징
1. **개념적 깊이**: 단순한 계산이 아닌 개념적 이해 테스트
2. **비판적 사고**: 학생의 추론 과정을 요구
3. **연결성**: 다른 개념과의 관계 탐구
4. **실용성**: 실제 문제 해결에 필요한 이해 테스트
5. **확장성**: 추가 학습 방향 제시

#### 피해야 할 질문 유형
1. **단순 암기**: 정의나 공식의 단순 나열
2. **계산 중심**: 복잡한 계산만 요구하는 문제
3. **표면적 이해**: 개념의 깊이 없는 단순 적용
4. **모호한 질문**: 명확한 답변이 어려운 질문
5. **과도한 복잡성**: 여러 개념을 동시에 요구하는 혼란스러운 질문`;
    }

    /**
     * Generates multiple questions for a concept
     * @param {Object} params - Question generation parameters
     * @param {number} count - Number of questions to generate
     * @returns {Promise<Array>} Array of generated questions
     */
    async generateMultipleQuestions(params, count = 3) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            try {
                const question = await this.generateQuestion(params);
                questions.push(question);
                
                // Add small delay between requests
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Failed to generate question ${i + 1}:`, error);
                questions.push({
                    concept: params.concept,
                    level: params.level,
                    error: `Failed to generate question ${i + 1}: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return questions;
    }

    /**
     * Generates questions for multiple concepts
     * @param {Array} concepts - Array of concept objects
     * @returns {Promise<Array>} Array of generated questions for all concepts
     */
    async generateQuestionsForConcepts(concepts) {
        const allQuestions = [];
        
        for (const conceptData of concepts) {
            try {
                const question = await this.generateQuestion(conceptData);
                allQuestions.push(question);
                
                // Add delay between different concepts
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
                console.error(`Failed to generate question for concept ${conceptData.concept}:`, error);
                allQuestions.push({
                    concept: conceptData.concept,
                    level: conceptData.level,
                    error: `Failed to generate question: ${error.message}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return allQuestions;
    }
}

// Convenience function for quick question generation
async function generateMathematicalQuestion(concept, level = 'Intermediate', focus = '', apiKey) {
    const generator = new QuestionGenerator(apiKey);
    return await generator.generateQuestion({ concept, level, focus });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QuestionGenerator,
        generateMathematicalQuestion
    };
}
