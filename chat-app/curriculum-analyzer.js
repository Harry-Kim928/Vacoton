/**
 * 2022 개정 교육과정 수학 커리큘럼 분석기
 * 업로드된 이미지의 수학 개념을 학년과 단원으로 매핑
 */

class CurriculumAnalyzer {
  constructor() {
    this.curriculum = this.initializeCurriculum();
  }

  /**
   * 2022 개정 교육과정 수학 커리큘럼 초기화
   */
  initializeCurriculum() {
    return {
      "중학교 1학년": {
        "수와 연산": ["정수와 유리수", "정수와 유리수의 계산", "문자와 식", "일차방정식"],
        "기하": ["기본도형", "평면도형", "입체도형"],
        "확률과 통계": ["자료의 정리와 해석"]
      },
      "중학교 2학년": {
        "수와 연산": ["유리수와 순환소수", "식의 계산", "연립방정식"],
        "기하": ["도형의 성질", "도형의 닮음", "피타고라스 정리"],
        "확률과 통계": ["확률"]
      },
      "중학교 3학년": {
        "수와 연산": ["제곱근과 실수", "근호를 포함한 식의 계산", "이차방정식"],
        "기하": ["원의 성질", "삼각비", "원과 직선"],
        "확률과 통계": ["통계"]
      },
      "고등학교 1학년": {
        "수학": {
          "수와 연산": ["지수와 로그", "삼각함수"],
          "기하": ["평면좌표", "직선의 방정식", "원의 방정식"],
          "확률과 통계": ["경우의 수", "확률"]
        },
        "수학 I": {
          "지수함수와 로그함수": ["지수", "로그", "지수함수", "로그함수"],
          "삼각함수": ["삼각함수", "삼각함수의 그래프", "사인법칙", "코사인법칙"],
          "수열": ["등차수열", "등비수열", "수열의 합"]
        },
        "수학 II": {
          "함수의 극한과 연속": ["함수의 극한", "함수의 연속"],
          "미분법": ["미분계수", "도함수", "도함수의 활용"],
          "적분법": ["부정적분", "정적분", "정적분의 활용"]
        }
      },
      "고등학교 2학년": {
        "확률과 통계": {
          "확률": ["확률의 뜻과 활용", "조건부확률"],
          "통계": ["확률분포", "통계적 추정"]
        },
        "기하": {
          "이차곡선": ["포물선", "타원", "쌍곡선"],
          "평면벡터": ["벡터", "벡터의 연산", "평면벡터의 성분과 내적"],
          "공간도형과 공간좌표": ["공간도형", "공간좌표"]
        }
      },
      "고등학교 3학년": {
        "미적분": {
          "수열의 극한": ["수열의 극한", "급수"],
          "미분법": ["여러 가지 함수의 미분", "도함수의 활용"],
          "적분법": ["여러 가지 적분법", "정적분의 활용"]
        },
        "확률과 통계": {
          "확률분포": ["이산확률분포", "연속확률분포"],
          "통계적 추정": ["모집단과 표본", "통계적 추정"]
        }
      }
    };
  }

  /**
   * 개념을 학년과 단원으로 매핑
   * @param {Array} concepts - 이미지에서 추출된 개념들
   * @returns {Object} 학년, 단원, 세부 개념 정보
   */
  analyzeConcepts(concepts) {
    const analysis = {
      grade: null,
      subject: null,
      unit: null,
      subConcepts: [],
      confidence: 0
    };

    if (!concepts || concepts.length === 0) {
      return analysis;
    }

    // 개념을 소문자로 변환하여 매칭
    const normalizedConcepts = concepts.map(c => c.toLowerCase());
    
    // 각 학년별로 매칭 시도
    for (const [grade, subjects] of Object.entries(this.curriculum)) {
      for (const [subject, units] of Object.entries(subjects)) {
        for (const [unit, subConcepts] of Object.entries(units)) {
          const matches = [];
          
          // 세부 개념 매칭
          for (const subConcept of subConcepts) {
            if (normalizedConcepts.some(concept => 
              concept.includes(subConcept.toLowerCase()) || 
              subConcept.toLowerCase().includes(concept)
            )) {
              matches.push(subConcept);
            }
          }

          // 키워드 매칭 (더 유연한 매칭)
          const keywordMatches = this.keywordMatching(normalizedConcepts, unit, subConcepts);
          matches.push(...keywordMatches);

          if (matches.length > 0) {
            const confidence = matches.length / concepts.length;
            
            if (confidence > analysis.confidence) {
              analysis.grade = grade;
              analysis.subject = subject;
              analysis.unit = unit;
              analysis.subConcepts = [...new Set(matches)];
              analysis.confidence = confidence;
            }
          }
        }
      }
    }

    return analysis;
  }

  /**
   * 키워드 기반 매칭
   */
  keywordMatching(concepts, unit, subConcepts) {
    const matches = [];
    const keywords = this.getKeywords(unit, subConcepts);
    
    for (const concept of concepts) {
      for (const keyword of keywords) {
        if (concept.includes(keyword) || keyword.includes(concept)) {
          matches.push(keyword);
        }
      }
    }
    
    return matches;
  }

  /**
   * 단원별 키워드 정의
   */
  getKeywords(unit, subConcepts) {
    const keywordMap = {
      "원의 성질": ["원", "원주각", "중심각", "호", "현", "접선", "반지름", "지름", "원주", "넓이"],
      "삼각비": ["삼각비", "사인", "코사인", "탄젠트", "sin", "cos", "tan"],
      "도형의 성질": ["삼각형", "사각형", "다각형", "이등변", "정삼각형", "정사각형"],
      "도형의 닮음": ["닮음", "닮음비", "대응변", "대응각"],
      "피타고라스 정리": ["피타고라스", "직각삼각형", "빗변"],
      "이차방정식": ["이차방정식", "근", "판별식", "인수분해"],
      "지수함수와 로그함수": ["지수", "로그", "지수함수", "로그함수"],
      "삼각함수": ["삼각함수", "사인", "코사인", "탄젠트", "사인법칙", "코사인법칙"],
      "미분법": ["미분", "도함수", "접선", "극값", "증감"],
      "적분법": ["적분", "부정적분", "정적분", "넓이", "부피"]
    };

    return keywordMap[unit] || subConcepts;
  }

  /**
   * 학년별 난이도 조정
   */
  getDifficultyLevel(grade) {
    const difficultyMap = {
      "중학교 1학년": "Basic",
      "중학교 2학년": "Basic-Intermediate", 
      "중학교 3학년": "Intermediate",
      "고등학교 1학년": "Intermediate",
      "고등학교 2학년": "Intermediate-Advanced",
      "고등학교 3학년": "Advanced"
    };
    
    return difficultyMap[grade] || "Intermediate";
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CurriculumAnalyzer };
}
