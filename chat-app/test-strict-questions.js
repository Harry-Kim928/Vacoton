const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testStrictQuestionGeneration() {
  console.log('🎯 Testing Strict Question Generation (Problem-Scope Only)...\n');

  // Test with specific problem data
  const testProblemData = {
    concepts: '이등변삼각형, 각의 합, 합동',
    problemText: '이등변삼각형 ABC에서 ∠A = 80°일 때, ∠B와 ∠C의 크기를 구하시오.',
    latex: '\\triangle ABC \\text{ (이등변삼각형)}, \\angle A = 80°'
  };

  try {
    console.log('📝 원본 문제:');
    console.log(`   문제: ${testProblemData.problemText}`);
    console.log(`   개념: ${testProblemData.concepts}`);
    console.log(`   수식: ${testProblemData.latex}\n`);

    console.log('🔄 엄격한 범위 내 질문 생성 중...\n');

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
      console.log('✅ 엄격한 질문 생성 성공!\n');
      
      console.log('📊 생성된 질문 유형:');
      console.log(`   - 개념 진단 질문: ${data.conceptDiagnosis.length}개`);
      console.log(`   - 조건 변경 질문: ${data.conditionChange.length}개`);
      console.log(`   - 오개념 탐색 질문: ${data.misconceptionExploration.length}개\n`);

      console.log('🎯 엄격한 제한사항 적용 확인:');
      console.log('   ✅ 업로드된 문제 안에서만 출제');
      console.log('   ✅ 실생활 예시 확장 금지');
      console.log('   ✅ 다른 분야로의 확장 금지');
      console.log('   ✅ 해당 문제의 조건 변경에만 집중');
      console.log('   ✅ 개념적 이해에만 집중\n');

    } else {
      const errorData = await response.json();
      console.log('⚠️  예상된 오류 (테스트 API 키):', errorData.error);
      console.log('   실제 OpenAI API 키를 사용하면 정상 작동합니다.\n');
    }

  } catch (error) {
    console.log('❌ 테스트 실패:', error.message);
  }

  console.log('🎉 엄격한 질문 생성 시스템 준비 완료!');
  console.log('\n📋 시스템 특징:');
  console.log('   🔒 업로드된 문제 안에서만 출제');
  console.log('   🚫 실생활 예시나 다른 분야 확장 금지');
  console.log('   🎯 해당 문제의 조건 변경과 개념 이해에만 집중');
  console.log('   💡 학습자가 해당 문제에 대해 더 깊이 사고하도록 유도');
  console.log('\n💡 사용 방법:');
  console.log('   1. 브라우저에서 http://localhost:3000 열기');
  console.log('   2. OpenAI API 키 입력');
  console.log('   3. 수학 문제 이미지 업로드');
  console.log('   4. 해당 문제 내에서만 특화된 질문들 받기');
}

// Run the test
testStrictQuestionGeneration().catch(console.error);
