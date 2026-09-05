# MakerMatch

## 폴더 구조
MakerMatch/
├── package.json
├── server.js
├── data.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js

## GitHub Codespaces 실행
터미널에서:

npm install
npm start

서버가 실행되면 Codespaces의 PORT 3000을 열어 브라우저에서 확인합니다.

## 중요한 변경점
원래 코드는 HTML/CSS/JavaScript가 server.js 안에 들어 있었지만,
Codespaces에서 관리하기 쉽도록 다음처럼 분리했습니다.

- server.js: Express 서버 + API
- data.js: 부품/프로젝트/판매처 데이터
- public/index.html: 화면 구조
- public/style.css: 디자인
- public/app.js: 화면 동작
- package.json: Node.js 의존성 및 실행 명령
