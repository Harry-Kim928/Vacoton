const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  console.log('🧪 Testing Math Chat Application API...\n');

  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test question generation endpoint
  try {
    console.log('\n2. Testing question generation...');
    const questionResponse = await fetch('http://localhost:3001/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ocrResult: {
          text: '미분 가능성에 대한 문제입니다.',
          latex: 'f(x) = x^2',
          concepts: ['미분', '함수']
        },
        apiKey: 'test-key'
      })
    });

    if (questionResponse.ok) {
      const questionData = await questionResponse.json();
      console.log('✅ Question generation endpoint working');
      console.log('   Response structure:', Object.keys(questionData));
    } else {
      const errorData = await questionResponse.json();
      console.log('⚠️  Question generation endpoint responded with error (expected without valid API key):', errorData.error);
    }
  } catch (error) {
    console.log('❌ Question generation test failed:', error.message);
  }

  // Test feedback generation endpoint
  try {
    console.log('\n3. Testing feedback generation...');
    const feedbackResponse = await fetch('http://localhost:3001/api/generate-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAnswer: '미분 가능성은 함수가 특정 점에서 미분이 가능한 성질입니다.',
        questionData: {
          question: '미분 가능성에 대해 설명해주세요.'
        },
        apiKey: 'test-key'
      })
    });

    if (feedbackResponse.ok) {
      const feedbackData = await feedbackResponse.json();
      console.log('✅ Feedback generation endpoint working');
      console.log('   Response structure:', Object.keys(feedbackData));
    } else {
      const errorData = await feedbackResponse.json();
      console.log('⚠️  Feedback generation endpoint responded with error (expected without valid API key):', errorData.error);
    }
  } catch (error) {
    console.log('❌ Feedback generation test failed:', error.message);
  }

  console.log('\n🎉 API test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Enter your OpenAI API key');
  console.log('3. Upload an image with mathematical content');
  console.log('4. Test the full chat flow');
}

// Run the test
testAPI().catch(console.error);
