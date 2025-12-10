## E-ON

### 📁 프로젝트 디렉토리 구조

#### 📦 `backend/`

```text
backend/
├── config/               # 설정 파일
├── controllers/          # 라우터 로직 분리 (요청 핸들러)
├── database/             # DB 연결 설정
├── middleware/           # 미들웨어 (로그인 체크, 에러 처리 등)
├── migrations/           # Sequelize migration 파일
├── models/               # Sequelize 모델 정의
├── public/               # 정적 파일 제공 디렉토리
├── routes/               # API 라우팅 모듈
├── services/             # 비즈니스 로직 처리
├── uploads/              # 사용자 업로드 파일 저장소
├── utils/                # 재사용 가능한 유틸 함수
├── seeders/
├── scripts/              # ⚙️ 초기 설정용 실행 스크립트
├── node_modules/
├── .env
├── app.js                # Express 앱 설정
├── Dockerfile
├── index.js              # 서버 실행 진입점
├── package-lock.json
└── package.json
```

---

#### 📦 `frontend/` (React + Vite)

```text
frontend/
├── public/                # 정적 파일 (favicon, index.html 등)
├── src/
│   ├── api/               # API 요청 처리 (axios, 서버 api 등)
│   ├── assets/            # 이미지, 폰트 등 static 리소스
│   ├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── pages/             # 라우팅되는 각 페이지 (Home, Login 등)
│   ├── hooks/             # 커스텀 훅 (useAuth 등)
│   ├── utils/             # 유틸 함수 모음
│   ├── constants/         # 상수 (API 주소, 메시지 등)
│   ├── contexts/          # 전역 상태 관리 (React Context API)
│   ├── router/            # react-router 설정
│   ├── styles/            # 전역 스타일 또는 Tailwind 설정
│   └── main.jsx           # React 앱 진입점
├── index.html             # Vite HTML 템플릿
├── package.json           # 프로젝트 메타 정보 및 의존성
├── vite.config.js         # Vite 설정 파일
└── .env                   # 환경 변수 (VITE_API_URL 등)
```

---

#### 📦 `python-server/`

```text
python-server/
├── venv
├── requirements.txt
└── server.py
```

test
