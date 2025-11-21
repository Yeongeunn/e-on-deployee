# frontend/Dockerfile

# ==========================================================
# STAGE 1: Build Stage
# ==========================================================
# React 앱 빌드 환경
FROM node:20-alpine AS builder

#젠킨스로부터 값을 받을 변수 선언
ARG VITE_API_URL


WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

#디버깅용
RUN echo "Checking VITE_API_URL: ${VITE_API_URL}"

#빌드 시점에 사용할 .env 파일을 동적으로 생성, 젠킨스가 주입한 ARG 값을 .env파일에 쓴다.
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# React 앱 빌드 실행 -> /app/dist 폴더에 결과물 생성
RUN npm run build

#빌드 결과물 확인
RUN ls -l


# ==========================================================
# STAGE 2: Final Stage
# ==========================================================

# 빌드된 정적 파일을 서빙할 Nginx 서버
FROM nginx:stable-alpine


# Builder 스테이지의 /app/dist 폴더에 있는 모든 파일을
# Nginx의 기본 웹 루트 폴더(/usr/share/nginx/html)로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 우리가 만든 nginx.conf를 Nginx의 기본 설정 파일 위치에 덮어씌운다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx는 기본적으로 80 포트를 사용
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]