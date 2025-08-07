/**
 * Specialized Mathematical Question Generator
 * Creates three types of questions:
 * 1. Concept Diagnosis Questions
 * 2. Condition Change Questions  
 * 3. Misconception Exploration Questions
 */

class SpecializedQuestionGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Generate specialized questions based on mathematical concepts
   * @param {Object} problemData - Problem information
   * @param {string} problemData.concepts - Mathematical concepts involved
   * @param {string} problemData.problemText - Original problem text
   * @param {string} problemData.latex - Mathematical expressions
   * @returns {Promise<Object>} Generated questions
   */
  async generateSpecializedQuestions(problemData) {
    const { concepts, problemText, latex } = problemData;
    
    try {
      const prompt = this.buildSpecializedPrompt(concepts, problemText, latex);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `당신은 수학 전문 튜터입니다. 주어진 문제의 개념 범위 내에서만 질문을 출제하며, 학생이 다른 분야로 확장하거나 추상적으로 해석하지 않도록 합니다.`
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
      
      return this.parseSpecializedResponse(content);
      
    } catch (error) {
      console.error('Specialized question generation failed:', error);
      throw error;
    }
  }

  /**
   * Build prompt for specialized question generation
   */
  buildSpecializedPrompt(concepts, problemText, latex) {
    return `다음 수학 문제를 바탕으로, 해당 문제의 개념(${concepts}) 범위 내에서만 질문을 생성해주세요.

**원본 문제:**
${problemText}

${latex ? `**수학 표현식:**\n${latex}\n` : ''}

**개념:** ${concepts}

다음 세 가지 유형의 질문을 각각 1~2개씩 생성해주세요:

## 1. 개념 진단 질문
- 학생이 핵심 개념을 정확히 이해하고 있는지 확인하는 질문
- 정의나 성질에 대한 정확한 이해를 테스트

## 2. 조건 변경 질문  
- 원본 문제의 조건을 바꾸어 적용력을 테스트하는 질문
- "만약 ~라면 어떻게 될까?" 형태

## 3. 오개념 탐색 질문
- 학생들이 자주 틀리는 부분이나 헷갈리는 개념을 집어내는 질문
- 오개념을 유발할 수 있는 상황을 제시

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

**주의사항:**
- 반드시 주어진 문제의 개념 범위 내에서만 출제
- 학생이 다른 분야로 확장하지 않도록 구체적으로 제한
- 추상적 해석보다는 구체적 적용에 집중`;
  }

  /**
   * Parse the specialized response
   */
  parseSpecializedResponse(content) {
    const result = {
      conceptDiagnosis: [],
      conditionChange: [],
      misconceptionExploration: []
    };

    // Extract concept diagnosis questions
    const conceptMatch = content.match(/\*\*1\. 개념 진단 질문:\*\*\s*([\s\S]*?)(?=\*\*2\. 조건 변경 질문:\*\*|$)/);
    if (conceptMatch) {
      result.conceptDiagnosis = this.extractQuestions(conceptMatch[1]);
    }

    // Extract condition change questions
    const conditionMatch = content.match(/\*\*2\. 조건 변경 질문:\*\*\s*([\s\S]*?)(?=\*\*3\. 오개념 탐색 질문:\*\*|$)/);
    if (conditionMatch) {
      result.conditionChange = this.extractQuestions(conditionMatch[1]);
    }

    // Extract misconception exploration questions
    const misconceptionMatch = content.match(/\*\*3\. 오개념 탐색 질문:\*\*\s*([\s\S]*?)(?=\*\*주의사항:\*\*|$)/);
    if (misconceptionMatch) {
      result.misconceptionExploration = this.extractQuestions(misconceptionMatch[1]);
    }

    return result;
  }

  /**
   * Extract individual questions from text
   */
  extractQuestions(text) {
    // Split by numbered or bulleted items
    const questions = text
      .split(/\n\s*\[질문\s*\d+\]|\n\s*[•·]\s*|\n\s*\d+\.\s*/)
      .map(q => q.trim())
      .filter(q => q.length > 10); // Filter out very short items
    
    return questions;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpecializedQuestionGenerator };
}
