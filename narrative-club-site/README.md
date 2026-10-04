# Narrative Club

GitHub Pages로 바로 배포되는 정적 사이트입니다.

## 배포 방법

1. 이 폴더 안의 파일들을 저장소 **루트**에 그대로 올립니다
   (`index.html`, `support.js`, `assets/`, `vendor/`, `.nojekyll` 등).
2. 저장소 **Settings → Pages → Build and deployment**에서
   Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 지정합니다.
3. 1~2분 뒤 `https://<계정>.github.io/<저장소>/` 에서 확인합니다.

## 파일 구성

- `index.html` — 사이트 본문 (원본 `Main.dc.html`과 동일)
- `Main.dc.html` — 원본 파일 (기존 링크 호환용)
- `assets/` — 이미지·PDF
- `support.js`, `vendor/` — 페이지를 렌더링하는 런타임
- `.nojekyll` — GitHub Pages의 Jekyll 처리를 끔
