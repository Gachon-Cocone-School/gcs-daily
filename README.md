# GCS Daily Snippet

일일 스니펫을 효율적으로 관리하기 위한 웹 애플리케이션입니다.

## 주요 기능

- 📝 일일 스니펫 작성 및 조회
- 👥 팀 기반 접근 제어
- 📅 3주 캘린더 뷰
- ✨ 마크다운 에디터와 미리보기
- 📱 모바일 반응형 디자인
- 🔒 구글 계정 기반 인증
- 🕒 날짜 기반 편집 제한
- 📊 스니펫 히스토리 관리

## 기술 스택

- **Frontend**
  - Next.js 15
  - React 19
  - TypeScript
  - TailwindCSS
  - SWR

- **Backend**
  - Supabase
    - 인증
    - 데이터베이스
    - 실시간 업데이트

- **개발 도구**
  - ESLint
  - Prettier
  - TypeScript
  - Turbopack

## 개발 환경 설정

1. 저장소 클론
```bash
git clone [repository-url]
cd gcs-daily-snippet
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```
`.env.local` 파일을 수정하여 필요한 환경 변수를 설정합니다.

4. 개발 서버 실행
```bash
npm run dev
```

## 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행 (Turbopack)
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - 코드 린트 검사
- `npm run lint:fix` - 코드 린트 문제 자동 수정
- `npm run format:check` - 코드 포맷 검사
- `npm run format:write` - 코드 포맷 자동 수정
- `npm run typecheck` - TypeScript 타입 검사
- `npm run update-types` - Supabase 타입 업데이트

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── constants/      # 상수 및 문자열
├── hooks/         # Custom React hooks
├── lib/           # 유틸리티 라이브러리
├── pages/         # Next.js 페이지
├── providers/     # React Context providers
├── styles/        # 글로벌 스타일
├── types/         # TypeScript 타입 정의
└── utils/         # 유틸리티 함수
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.