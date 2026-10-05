# Narrative Club 웹사이트

정적 웹사이트예요. 빌드 과정 없이 GitHub Pages에 그대로 올리면 작동해요.

## GitHub Pages로 올리는 방법
1. 이 폴더 안의 파일 전체(index.html, style.css, js/, images/, files/, .nojekyll)를 저장소 맨 위(루트)에 올려요.
2. 저장소의 Settings → Pages → Build and deployment에서 Source를 "Deploy from a branch", Branch를 `main` / `/(root)`로 정하고 Save를 눌러요.
3. 1~2분 뒤 `https://<계정>.github.io/<저장소>/` 주소로 열려요.

## 구성
- `index.html` — 모든 페이지(소개 · 멤버십 · 라운지 · 클럽하우스 · 신청하기)
- `style.css` — 디자인 (모바일 레이아웃 포함)
- `js/logic.js` — 관성 스크롤, 스크롤 등장 효과, 멤버십 페이지 검은 화면 전환, 소개서 다운로드
- `js/app.js` — 페이지 전환, 라운지 존 선택, 아코디언
- `js/i18n-data.js`, `js/i18n.js` — 한국어 / 영어 전환 (상단 KR / EN 버튼), 모바일 메뉴
- `images/`, `files/` — 사진과 라운지 소개서 PDF

## 주소
- 페이지: `#/benefits`, `#/lounge`, `#/clubhouse`, `#/apply`
- 영어로 바로 열기: `?lang=en` (예: `index.html?lang=en#/lounge`)

## 수정하기
- 한국어 문구는 `index.html`에서 고쳐요.
- 영어 문구는 `js/i18n-data.js`에서 고쳐요. 한국어 문장을 바꿨다면, 같은 문장을 키로 쓰는 영어 항목도 함께 바꿔야 영어 전환이 계속 작동해요.
- 사진은 `images/` 안의 같은 이름 파일로 바꿔 넣으면 돼요.
