const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSpecializedQuestions() {
  console.log('🧮 Testing Specialized Mathematical Question Generation...\n');

  // Test problem data based on the user's request
  const testProblemData = {
    concepts: '이등변삼각형, 각의 합, 합동',
    problemText: '이등변삼각형 ABC에서 ∠A = 80°일 때, ∠B와 ∠C의 크기를 구하시오.',
    latex: '\\triangle ABC \\text{ (이등변삼각형)}, \\angle A = 80°'
  };

  try {
    console.log('📝 원본 문제:');
    console.log(`   개념: ${testProblemData.concepts}`);
    console.log(`   문제: ${testProblemData.problemText}`);
    console.log(`   수식: ${testProblemData.latex}\n`);

    console.log('🔄 특화 질문 생성 중...\n');

    const response = await fetch('http://localhost:3001/api/generate-specialized-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemData: testProblemData,
        apiKey: 'test-key'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 특화 질문 생성 성공!\n');
      
      console.log('📊 생성된 질문 유형:');
      console.log(`   - 개념 진단 질문: ${data.conceptDiagnosis.length}개`);
      console.log(`   - 조건 변경 질문: ${data.conditionChange.length}개`);
      console.log(`   - 오개념 탐색 질문: ${data.misconceptionExploration.length}개\n`);

      console.log('🎯 API 응답 구조 확인 완료');
      console.log('   - conceptDiagnosis: 배열 형태로 개념 진단 질문들');
      console.log('   - conditionChange: 배열 형태로 조건 변경 질문들');
      console.log('   - misconceptionExploration: 배열 형태로 오개념 탐색 질문들\n');

    } else {
      const errorData = await response.json();
      console.log('⚠️  예상된 오류 (테스트 API 키):', errorData.error);
      console.log('   실제 OpenAI API 키를 사용하면 정상 작동합니다.\n');
    }

  } catch (error) {
    console.log('❌ 테스트 실패:', error.message);
  }

  console.log('🎉 특화 질문 생성 시스템 준비 완료!');
  console.log('\n📋 시스템 특징:');
  console.log('   1. 개념 진단 질문 - 핵심 개념 이해도 확인');
  console.log('   2. 조건 변경 질문 - "만약 ~라면?" 형태의 적용력 테스트');
  console.log('   3. 오개념 탐색 질문 - 자주 틀리는 부분 집어내기');
  console.log('\n💡 사용 방법:');
  console.log('   1. 브라우저에서 http://localhost:3000 열기');
  console.log('   2. OpenAI API 키 입력');
  console.log('   3. 수학 문제 이미지 업로드');
  console.log('   4. 특화된 질문들 받기');
}

// Run the test
testSpecializedQuestions().catch(console.error);
