<div align="center">

  <h1>주간 연구 일지 (Weekly Research Journal)</h1>
  
  <div>    
      <a>경상국립대학교 AI정보공학과 박정준</a>
  </div>
</div>

<br>

<div align="center">

| <img src="img/overall.png" alt="Notice_Bot_Usage_Screen" width="900"> |
|:--:| 
| **공지사항 알림봇 사용 화면** |


<br>

| https://clustering-jun.github.io/weekly-research-journal/ |
|:--:| 
| **웹 앱 바로가기** |

</div>

<br>

연구자/학생을 위한 **모바일 친화적 주간 업무 기록 웹 앱**입니다.  
매일의 연구 세션을 기록하고, 시간 통계를 시각화하며, Firebase를 통해 멀티 디바이스 동기화를 지원합니다.


---

## 1. 주요 기능

<div align="center">

| 기능 | 설명 |
|---|---|
| 일일 업무 기록 | 출퇴근 시간, 세션별 시작/종료, 계획 및 달성 내용 입력 |
| 카테고리 분류 | 과제 · 연구 · 논문 · 행정 · 대회 · 기타 |
| 통계 대시보드 | 일별 근무 시간 바 차트, 카테고리별 원형 차트 |
| 월간 뷰 | 월별 달력 형태로 근무일 및 누적 시간 확인 |
| 주간 요약 | 이번 주 성과 및 다음 주 계획 작성 |
| PDF 인쇄 | 프린트 최적화 레이아웃으로 일지 출력 |
| 클라우드 동기화 | Firebase Firestore를 통한 실시간 자동 저장 |
| 오프라인 지원 | localStorage 기반 로컬 저장 (Firebase 미사용 시에도 동작) |
| 비밀키 인증 | 앱 진입 및 화면 잠금 기능 |

</div>

---

## 2. 시작하기

### 사전 요구 사항

- Node.js 18 이상
- Firebase 프로젝트 (Firestore + Authentication 활성화)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/clustering-jun/weekly-research-journal.git
cd weekly-research-journal

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env 파일 생성)
cp .env.example .env   # 또는 아래 형식으로 직접 작성

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수 설정 (`.env`)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SECRET_KEY=your_secret_key   # 앱 진입 비밀키
```

---

## 3. 배포

### GitHub Pages 자동 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드 후 배포합니다.

GitHub 저장소 → **Settings → Secrets and variables → Actions** 에서 아래 시크릿을 등록하세요:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_SECRET_KEY
```

### 수동 배포

```bash
npm run build    # dist/ 폴더 생성
npm run deploy   # GitHub Pages에 배포
```

---

## 4. 프로젝트 구조

```
src/
├── components/
│   ├── Dashboard.tsx      # 주간 통계 대시보드
│   ├── JournalEditor.tsx  # 일일 업무 기록 편집기
│   ├── JournalViewer.tsx  # 기록 조회 뷰
│   ├── MonthlyView.tsx    # 월간 통계 뷰
│   ├── SummaryEditor.tsx  # 주간 요약 편집기
│   ├── PrintView.tsx      # 인쇄 뷰
│   ├── SettingsView.tsx   # 설정 및 Firebase 동기화
│   ├── Shell.tsx          # 사이드바 + 내비게이션
│   ├── Login.tsx          # 비밀키 인증 화면
│   ├── LockScreen.tsx     # 화면 잠금
│   ├── WeekNavigator.tsx  # 주차 선택 컨트롤
│   └── ui.tsx             # 공통 UI 컴포넌트
├── lib/
│   ├── storage.ts         # localStorage 저장/불러오기
│   ├── firebaseSync.ts    # Firebase 인증 및 Firestore 동기화
│   └── utils.ts           # 날짜, 시간 계산 유틸
├── App.tsx                # 상태 관리 및 라우팅
├── types.ts               # TypeScript 타입 정의
└── main.tsx               # 앱 진입점
```

---

## 5. 데이터 구조

Firebase Firestore 경로: `users/{uid}/journal/main`

로컬 스토리지 키: `weekly-research-journal:data`

데이터 변경 후 1.5초 디바운스로 Firebase에 자동 저장되며, 비로그인 상태에서는 localStorage에만 저장됩니다.

## 6. 연락처
관련하여 궁금한 사항이 있으신 경우 아래로 연락해 주시기 바랍니다.

- 개발자: 박정준 ([LinkedIn](https://www.linkedin.com/in/jeong-jun-park/))
- 전자우편: [cluster@gnu.ac.kr](mailto:cluster@gnu.ac.kr)
