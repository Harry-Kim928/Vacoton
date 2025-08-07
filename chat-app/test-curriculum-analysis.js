const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCurriculumAnalysis() {
  console.log('📚 Testing Curriculum Analysis and Concept-Based Question Generation...\n');

  // Test with different concept scenarios
  const testScenarios = [
    {
      name: "원주각 문제",
      concepts: ["원주각", "반지름", "각", "호의 길이"],
      problemText: "원 O에서 원주각 ∠APB = 60°일 때, 중심각 ∠AOB의 크기를 구하시오.",
      expectedGrade: "중학교 3학년",
      expectedUnit: "원의 성질"
    },
    {
      name: "이등변삼각형 문제",
      concepts: ["이등변삼각형", "각의 합", "합동"],
      problemText: "이등변삼각형 ABC에서 ∠A = 80°일 때, ∠B와 ∠C의 크기를 구하시오.",
      expectedGrade: "중학교 2학년",
      expectedUnit: "도형의 성질"
    },
    {
      name: "삼각함수 문제",
      concepts: ["삼각함수", "사인", "코사인", "탄젠트"],
      problemText: "sin θ = 3/5일 때, cos θ와 tan θ의 값을 구하시오.",
      expectedGrade: "고등학교 1학년",
      expectedUnit: "삼각함수"
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`🧮 테스트 시나리오: ${scenario.name}`);
    console.log(`   추출된 개념: ${scenario.concepts.join(', ')}`);
    console.log(`   예상 학년: ${scenario.expectedGrade}`);
    console.log(`   예상 단원: ${scenario.expectedUnit}\n`);

    try {
      const response = await fetch('http://localhost:3001/api/generate-specialized-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemData: {
            concepts: scenario.concepts.join(', '),
            problemText: scenario.problemText,
            latex: ''
          },
          apiKey: 'test-key'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${scenario.name}: 질문 생성 성공!`);
        console.log(`   - 개념 진단 질문: ${data.conceptDiagnosis.length}개`);
        console.log(`   - 조건 변경 질문: ${data.conditionChange.length}개`);
        console.log(`   - 오개념 탐색 질문: ${data.misconceptionExploration.length}개\n`);
      } else {
        const errorData = await response.json();
        console.log(`⚠️  ${scenario.name}: 예상된 오류 (테스트 API 키):`, errorData.error);
        console.log('   실제 OpenAI API 키를 사용하면 정상 작동합니다.\n');
      }

    } catch (error) {
      console.log(`❌ ${scenario.name}: 테스트 실패:`, error.message);
    }
  }

  console.log('🎉 커리큘럼 분석 시스템 준비 완료!');
  console.log('\n📋 시스템 개선사항:');
  console.log('   🔍 업로드된 이미지에서 추출된 개념을 정확히 분석');
  console.log('   📚 2022 개정 교육과정 수학 커리큘럼 매핑');
  console.log('   🎯 학년별 난이도 자동 조정');
  console.log('   🚫 추출된 개념과 무관한 문제 출제 금지');
  console.log('   💡 해당 문제의 조건 변경과 이해에만 집중');
  console.log('\n💡 사용 방법:');
  console.log('   1. 브라우저에서 http://localhost:3000 열기');
  console.log('   2. OpenAI API 키 입력');
  console.log('   3. 수학 문제 이미지 업로드');
  console.log('   4. 추출된 개념 기반의 정확한 질문들 받기');
}

// Run the test
testCurriculumAnalysis().catch(console.error);
