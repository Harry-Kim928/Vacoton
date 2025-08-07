# AI 복습 코칭 시스템

AI 기반 수학 문제 분석 및 맞춤형 복습 코칭 시스템입니다.

## 기능

- 📷 이미지 업로드 및 수학 문제 분석
- 🤖 AI 기반 문제 개념 추출
- 📝 맞춤형 복습 질문 생성
- 💬 대화형 학습 지원
- 📊 학생 풀이 분석 및 피드백

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Vercel Serverless Functions
- **AI**: OpenAI GPT-4 Vision API
- **OCR**: Tesseract.js
- **Math Rendering**: MathJax

## 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 OpenAI API 키를 설정하세요:
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 로컬 서버 실행
```bash
npm run dev
# 또는
vercel dev
```

### 4. 브라우저에서 접속
```
http://localhost:3000
```

## 배포

### Vercel 배포
```bash
npm run deploy
```

### 환경변수 설정 (Vercel)
1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. `OPENAI_API_KEY` 추가

## API 구조

### `/api/openai`
- **Method**: POST
- **Purpose**: OpenAI API 프록시
- **Request Body**:
  ```json
  {
    "model": "gpt-4o-mini",
    "messages": [...],
    "max_tokens": 800,
    "temperature": 0.7
  }
  ```

## 보안

- API 키는 서버 환경변수로 관리
- 클라이언트에서 직접 OpenAI API 호출하지 않음
- CORS 설정으로 안전한 API 통신

## 개발 가이드

### 로컬 테스트
- `file://` 프로토콜 사용 금지
- 반드시 로컬 서버 환경에서 테스트
- 환경변수 설정 필수

### API 테스트
```bash
curl -X POST http://localhost:3000/api/openai \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'
```

## 문제 해결

### CORS 오류
- 로컬 서버 환경에서 테스트
- `file://` 프로토콜 사용 금지

### API 키 오류
- 환경변수 설정 확인
- Vercel 대시보드에서 환경변수 재설정

### 이미지 업로드 문제
- 브라우저 콘솔에서 오류 확인
- 파일 크기 제한 (10MB) 확인
