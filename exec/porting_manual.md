# 프로젝트 포팅 매뉴얼

## 목차

1. [개요](#1-개요)
2. [시스템 환경](#2-시스템-환경)
3. [빌드 및 배포 가이드](#3-빌드-및-배포-가이드)
4. [리버스 프록시 설정 가이드](#4-리버스-프록시-설정-가이드)
5. [GPU 서버 운영](#5-GPU-설정-가이드)
6. [젠킨스 및 깃랩 설정 가이드](#6-데이터베이스-설정-가이드)
7. [소나큐브 설정](#7-소나큐브-설정-가이드)

## 1. 개요
- 작성일: 2025-5-20
- 작성자: [최현만]

### 1. 프로젝트 개요
- 프로젝트명: [q-generator]
- GitLab 저장소 URL: (https://lab.ssafy.com/s12-final/S12P31B204.git)

## 2. 시스템 환경
### 2.1 개발 환경
#### 2.1.1 IDE
- IntelliJ IDEA 2023.3.8
- Visual Studio Code 1.99.0

#### 2.1.1 런타임 환경
- JDK 17
- Spring Boot 3.4.4
- React 18.2.0
- Python 3.12.8  

#### 2.1.2 빌드 도구
- 정적타입 언어: TypeScript
- 스타일링 도구: TailwindCSS
-	백앤드 빌드 도구: Gradle
- AI 서버 빌드 도구: pip

### 2.2 서버 환경
#### 2.2.1 인스턴스
- AWS EC2
- S3
- GPU 서버

#### 2.2.2 기술 스택
- 프론트엔드 서버: Node.js
- 백엔드 서버: Spring boot
- AI 서버: FastAPI
- 프록시 서버 Nginx
- 컨테이너: Docker
- 데이터베이스: MySQL
- 코드 리뷰: SonarQube

#### 2.2.3 포트 구성
- 프론트엔드:5173
- 백엔드:8080
- DB:13306
- AI:8000
- Proxy:443

#### 2.2.4 MySQL 데이터베이스 접속 설정

```yml

  datasource:
    driver-class-name: ${MYSQL_DRIVER}
    url: jdbc:mysql://${MYSQL_URL}/${MYSQL_DATABASE}?serverTimezone=Asia/Seoul
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
    hikari:
      maximum-pool-size: 10


```

#### 2.2.5 Spring 설정

```yml

spring:
  application:
    name: backend
    version: v1
  config:
    import: optional:file:.env[.properties]

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB

  # MySQL
  datasource:
    driver-class-name: ${MYSQL_DRIVER}
    url: jdbc:mysql://${MYSQL_URL}/${MYSQL_DATABASE}?serverTimezone=Asia/Seoul
    username: ${MYSQL_USER}
    password: ${MYSQL_PASSWORD}
    hikari:
      maximum-pool-size: 10

  jpa:
    hibernate:
      ddl-auto: update
    defer-datasource-initialization: true

  security:
    oauth2:
      client:
        registration:
          google:
            client-name: google
            client-id: ${OAUTH_GOOGLE_CLIENT_ID}
            client-secret: ${OAUTH_GOOGLE_CLIENT_SECRET}
            redirect-uri: ${OAUTH_GOOGLE_REDIRECT_URI}
            authorization-grant-type: authorization_code
            scope:
              - profile
              - email

  jwt:
    secret: ${JWT_SECRET_KEY}

  thymeleaf:
    cache: false

management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: always

cloud:
  aws:
    credentials:
      access-key: ${AWS_ACCESS_KEY_ID}
      secret-key: ${AWS_SECRET_ACCESS_KEY}
    region:
      static: ${AWS_DEFAULT_REGION}
    s3:
      bucket: ${S3_BUCKET_NAME}

server:
  port: 8080


```

#### 2.2.6 환경변수 설정

아래 env 파일에는 실제 키를 입력해줘야 한다.

```.env

MYSQL_DRIVER=
MYSQL_URL=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_REGION=
S3_BUCKET_NAME=
OPENAI_API_KEY=
GPU_SERVER_URL=

```

## 3. 빌드 및 배포 가이드

### 3.1 배포용 docker-compose 작성

- docker-compose.blue.yml

blue-green 무중단 배포를 위해 blue / green 나눠서 yml 파일 작성. 프론트엔드, 백엔드, ai 모두 헬스체크 하도록 구현.

```yml

services:
  frontend:
    image: frontend:blue
    container_name: frontend_blue
    ports:
      - "5174:5173"
    env_file:
      - .env
    networks:
      - app_network
    restart: always
    environment:
      - TZ=Asia/Seoul
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 6

  backend:
    image: backend:blue
    container_name: backend_blue
    ports:
      - "8081:8080"
    environment:
      TZ: Asia/Seoul
      JAVA_SECURITY_PROPERTIES: |
        jdk.internal.reflect.permitAll=true
        jdk.reflect.allowNativeAccess=true
    env_file:
      - .env
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    networks:
      - app_network
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ai:
    image: ai:blue
    container_name: ai_blue
    ports:
      - "8001:8000"
    env_file:
      - .env
    environment:
      - PYTHONPATH=/ai
      - TZ=Asia/Seoul
    networks:
      - app_network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/ai/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app_network:
    external: true

```

- docker-compose.green.yml

```yml

services:
  frontend:
    image: frontend:green
    container_name: frontend_green
    ports:
      - "5175:5173"
    env_file:
      - .env
    networks:
      - app_network
    restart: always
    environment:
      - TZ=Asia/Seoul
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173"]
      interval: 30s
      timeout: 10s
      retries: 6
    

  backend:
    image: backend:green
    container_name: backend_green
    ports:
      - "8082:8080"
    environment:
      TZ: Asia/Seoul
      JAVA_SECURITY_PROPERTIES: |
        jdk.internal.reflect.permitAll=true
        jdk.reflect.allowNativeAccess=true
    env_file:
      - .env
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    networks:
      - app_network
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ai:
    image: ai:green
    container_name: ai_green
    ports:
      - "8002:8000"
    env_file:
      - .env
    environment:
      - PYTHONPATH=/ai
      - TZ=Asia/Seoul
    networks:
      - app_network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/ai/health"]
      interval: 30s
      timeout: 10s
      retries: 3


networks:
  app_network:
    external: true

```

- docker-compose.nginx.yml

```yml

services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:rw
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /etc/ssl/certs:/etc/ssl/certs:ro
      - /etc/nginx/sites-available:/etc/nginx/sites-available:ro
      - /var/log/nginx:/var/log/nginx
      - ./nginx/html:/usr/share/nginx/html:ro
    networks:
      - app_network
    restart: always
    environment:
      - TZ=Asia/Seoul

networks:
  app_network:
    external: true

```

- docker-compose.jenkins.yml

```yml

services:
  jenkins:
    build:
      context: ./jenkins-custom
    user: root
    container_name: jenkins
    ports:
      - "8080:8080"
    volumes:
      - ./jenkins_home:/var/jenkins_home:rw
      - /usr/bin/docker:/usr/bin/docker         
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - app_network
    restart: unless-stopped
    environment:
      TZ: Asia/Seoul
      JENKINS_OPTS: "--httpPort=8080 --prefix=/jenkins"

networks:
  app_network:
    external: true

```
- docker-compose.sonarqube.yml

```yml

version: "3"

services:
  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_logs:/opt/sonarqube/logs

volumes:
  sonarqube_data:
  sonarqube_logs:

networks:
  app_network:
    external: true

```

### 3.2 배포용 도커 파일
#### 3.2.1 프론트엔드

```Dockerfile

FROM node:22

WORKDIR /frontend

COPY package*.json ./

RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install


COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

```

#### 3.2.2 백엔드

```Dockerfile


# 빌드 스테이지
FROM gradle:8.12.1-jdk17 AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle build -x test --no-daemon --refresh-dependencies
# 실행 스테이지
FROM openjdk:17-jdk
WORKDIR /app
# 빌드 스테이지에서 생성된 app.jar 파일을 명확하게 복사
COPY --from=build /home/gradle/src/build/libs/app.jar ./app.jar
EXPOSE 8080
ENV JAVA_OPTS="\
    --add-opens=java.base/sun.nio.ch=ALL-UNNAMED \
    --add-opens=java.base/java.lang=ALL-UNNAMED \
    --add-opens=java.base/java.lang.reflect=ALL-UNNAMED \
    --add-opens=java.base/java.io=ALL-UNNAMED \
    --add-opens=java.base/java.nio=ALL-UNNAMED \
    --add-opens=java.base/java.util=ALL-UNNAMED \
    --add-opens=java.base/java.util.concurrent=ALL-UNNAMED \
    --add-opens=java.base/java.net=ALL-UNNAMED \
    --add-opens=java.base/jdk.internal.misc=ALL-UNNAMED \
    -Djava.security.egd=file:/dev/./urandom"
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

```

#### 3.2.3 AI

```Dockerfile


# 베이스 이미지
FROM python:3.12.8
# 작업 디렉토리 설정
WORKDIR /app
# AWS CLI 설치 (S3 다운로드 위해 필요)
RUN apt-get update && \
    apt-get install -y curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws
# 파이썬 패키지 설치
COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt
# 애플리케이션 전체 복사
COPY . .
# 쉘 스크립트 복사 및 실행 권한 부여
COPY ./download-and-run.sh /app/download-and-run.sh
RUN chmod +x /app/download-and-run.sh
# 포트 오픈
EXPOSE 8000
# 애플리케이션 실행 (S3에서 파일 받고 서버 시작)
CMD ["/bin/bash", "-c", "/app/download-and-run.sh"]

```

download-and-run.sh

서버 올릴 때 최신화된 Faiss 인덱스 다운로드 하는 스크립트

```sh

#!/bin/bash
set -e

echo "📥 인덱스 다운로드 시작"

mkdir -p /app/data/indexes

aws s3 cp s3://$S3_BUCKET_NAME/faiss/questions.faiss /app/data/indexes/questions.faiss
aws s3 cp s3://$S3_BUCKET_NAME/faiss/questions.json /app/data/indexes/questions.json
aws s3 cp s3://$S3_BUCKET_NAME/faiss/info.faiss /app/data/indexes/info.faiss
aws s3 cp s3://$S3_BUCKET_NAME/faiss/info.json /app/data/indexes/info.json

echo "✅ 다운로드 완료. 서버 시작"

exec uvicorn app.server:app --host 0.0.0.0 --port 8000

```

#### 3.2.4 MySQL

```Dockerfile

FROM mysql:8.0.41

ENV TZ=Asia/Seoul

COPY mysql.cnf /etc/mysql/conf.d/custom.cnf

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 3306

```

#### 3.2.5 Nginx

```Dockerfile

FROM nginx:alpine

WORKDIR /etc/nginx

COPY . /etc/nginx/

```

## 4. 리버시 프록시 설정 가이드
### 4.1 인증서 설정
#### 4.1.1 certbot 기본 패키지 설치
```bash
$ sudo apt install certbot
```

#### 4.1.2 Nginx 플러그인 설치
```bash
$ sudo apt install python3-certbot-nginx
```

#### 4.1.3 Certbot으로 SSL/TLS 인증서 발급
```bash
$ sudo certbot -d q-generator.com
```

#### 4.1.4 Certbot으로 발급된 SSL/TLS 인증서 목록 확인
```bash
$ sudo certbot certificates
```

### 4.2 nginx 기본 설정
```conf
# nginx/nginx.conf
# nginx 실행 사용자 지정
user nginx;
# CPU 코어 수에 맞게 워커 프로세스 자동 설정
worker_processes auto;
# nginx 마스터 프로세스 ID 저장 위치
pid /run/nginx.pid;

events {
    # 워커 프로세스당 최대 동시 접속 수 설정
    worker_connections 768;
}

http {

    client_max_body_size 100M;

    # 정적 파일 전송 최적화 설정
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    # 접속 유지 시간 설정 (65초)
    keepalive_timeout 65;
    # MIME 타입 해시 테이블 크기 설정
    types_hash_max_size 2048;

    # MIME 타입 설정 파일 포함
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL 프로토콜 버전 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # 로그 파일 위치 설정
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # gzip 압축 사용
    gzip on;

    # 추가 설정 파일 포함
    include /etc/nginx/conf.d/*.conf;
}
```

### 4.3 nginx 확장 설정

프론트엔드, 백엔드, 젠킨스, ai, 소나큐브 프록시 설정

```conf

resolver 127.0.0.11 valid=30s;

# === upstream 설정 ===
upstream frontend {
    zone upstream_frontend 64k;
    server $FRONTEND_UPSTREAM:5173 resolve;
}

upstream backend {
    zone upstream_backend 64k;
    server $BACKEND_UPSTREAM:8080 resolve;
}

upstream jenkins {
    zone upstream_jenkins 64k;
    server jenkins:8080 resolve;
}

upstream ai {
    zone upstream_ai 64k;
    server $AI_UPSTREAM:8000 resolve;
}

upstream sonarqube {
    zone upstream_sonarqube 64k;
    server sonarqube:9000 resolve;
}

# === q-generator.com ===
server {
    listen 80;
    server_name q-generator.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name q-generator.com;

    ssl_certificate /etc/letsencrypt/live/q-generator.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/q-generator.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location ^~ /login/oauth2/ {
        proxy_pass http://backend/login/oauth2/;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 120s;
        error_page 503 = @maintenance;
    }

    location ^~ /oauth2/authorization/ {
        proxy_pass http://backend/oauth2/authorization/;
    }

    location / {
        proxy_pass http://frontend/;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        error_page 502 503 504 = @maintenance;
    }

    location /api/ {
        proxy_pass http://backend/api/;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        error_page 503 = @maintenance;
    }

    location /api/sse {
        proxy_pass http://backend/api/sse;

        # SSE 필수 설정
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;

        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        error_page 503 = @maintenance;
    }

    location /jenkins {
        proxy_pass http://jenkins;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 9000;
        error_page 503 = @maintenance;
    }

    location /api/ai/ {
        proxy_pass http://ai/api/ai/;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_intercept_errors on;
        error_page 503 = @maintenance;
    }

    location @maintenance {
        root /usr/share/nginx/html;
        try_files /maintenance.html =503;
    }
}

# === sonar.q-generator.com ===
server {
    listen 80;
    server_name sonar.q-generator.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name sonar.q-generator.com;

    ssl_certificate /etc/letsencrypt/live/q-generator.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/q-generator.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    
    location ^~ /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        allow all;
    }


    location / {
        proxy_pass http://sonarqube;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        error_page 503 = @maintenance;
    }

    location @maintenance {
        root /usr/share/nginx/html;
        try_files /maintenance.html =503;
    }
}

```

## 5. GPU 서버 운영
### 5.1 runpod에서 pod 배포

https://www.runpod.io/ 에 접속해서 Pods에서 Deploy a Pod 클릭. RTX 4090, Community Cloud, Public IP, System Memory PER GPU 16 설정.

Allowed CUDA Version의 경우 RTX 4090는 12.4버전보다 낮은 버전이 없었고, 어쩔 수 없이 12.4버전 활용. faiss-gpu 등은 CUDA 버전이 높으면 지원이 안 된다는 말이 있음.

발급받은 pod -> runpod/pytorch:2.4.0-py3.11-cuda12.4.1-devel-ubuntu22.04

발급 시 포트번호를 설정해둘 수 있는데, 8000, 9000 등 포트를 열어둠. 8000 포트는 파이썬 서버 운영을 위해, 9000은 혹시 모를 예비용으로 열어둠.

Volume Path: /workspace 라는 점을 참고해서, workspace 안으로 들어가서 git clone을 받아서 운영해야 한다.

### GPU 서버 운영 방법

git clone 후

가상환경 설정

```bash

conda create -n gpu-env python=3.11 -y

```

가상환경 활성화

```bash

conda activate gpu-env

```

이후 pip install을 활용해서 requirements에 있는 라이브러리를 다운로드 한다.

예시

```bash

pip install boto3 python-dotenv

```

터미널을 꺼도 파이썬 서버가 계속 돌아가도록 하고, 로그는 server.log에 저장되도록 한다.

```bash

nohup uvicorn app.server:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &

```

파이썬 서버를 끄고 싶다면 아래 명령어를 누르고 kill <프로세스 ID>를 입력하면 된다.

```bash
ps aux | grep uvicorn

```

로그를 보고 싶다면 아래 명령어를 입력한다.

```bash

tail -f server.log

```

#### GPU 서버 운영 전략

기존에 CPU 기반의 EC2 서버에서 임베딩, 리랭크, 인덱싱 등 시간이 많이 걸리는 작업은 GPU 서버에서 하도록 작업.

실제로 아래와 같이 세 개의 라우팅을 지정. 각각 Faiss 인덱싱, 임베딩, 리랭크.

@router.post("/build")

@router.post("/embedding")

@router.post("/reranker", response_model=RerankBatchResponse)

모든 ai 파일을 GPU에서 운영하면 리소스 낭비라고 판단해서 꼭 GPU 서버가 필요한 코드만 GPU로 옮긴 것.


## 6. 젠킨스 및 깃랩 설정 가이드
### 6.1 job 만들기

새로운 item 만들기 누른 뒤 New Item에 프로젝트 이름을 넣고 Pipeline을 클릭해서 만듬. 가장 많이 쓰는 Jenkins Job 타입. 여러 OS나 브라우저 등을 조합해 테스트하려면 Multi-configuration project를, GitLab/GitHub에서 브렌치별 빌드 필요하면 Multibranch Pipeline 선택.

### 6.2 젠킨스 기본 설정

먼저 젠킨스 관리-> 플러그인 관리 -> GitLab Plugin 설치돼야 함. System 들어가서 Gitlab에서 Connetion name, Gitlab host URL 작성. credentials 들어가서 Gitlab API token 추가. 참고로 Gitlab API token 만들 때 API token 항목에는 Gitlab에서 발급받은 access token을 넣어줘야 한다. Test Connection으로 테스트 해보고 왼쪽에 Success 나오는지 확인.

### 6.3 깃랩 설정

깃랩 Settings에 들어가서 Webhook 설정. Secret token 설정이 있는데, 이건 젠킨스에서 구성(Configure)-> General -> 고급에 들어가서 발급받은 Secret token 키를 넣어주면 된다.

### 6.4 메타모스트 설정

메타모스트에서 Integrations -> Incoming Webhooks -> Add Incoming Webhook -> 채널 선택 + 이름 입력 -> Webhook URL 복사

젠킨스 Credential에 Webhook 등록. Secret에 복사한 Webhook URL 넣는다.

### 6.4 추가 Credentials 설정

특정 브렌치를 깃 클론해서 실행할 때 .env 파일을 추가로 설정해둬야 한다. 깃 클론된 파일에는 .env 파일이 없기 때문. application.yml 파일도 마찬가지.

### 6.5 젠킨스 파일 스크립트

통합 브렌치 없이 운영. 깃랩에서 push가 발생하면 dev-trigger에 훅 전달.
dev-trigger는 dev-fe, dev-be, dev-infra를 각각 실행하는 구조

dev-trigger에서 현재 올라가있는 컨테이너를 확인해서 앞으로 올라갈 컨테이너의 색깔을 결정한다(blue-green 배포)
dev-fe, dev-be에서 올라가는 컨테이너도 해당 색깔을 따라간다.

프론트엔드, 백엔드, ai 컨테이너가 올라가고 헬스체크를 한 뒤, 정상이 확인되면
dev-infra의 nginx 설정에서 상술한 nginx.template.conf에서 색깔을 바꿔서 덮어쓰고, 프록시를 전환하는 방식이다.

-dev-trigger 젠킨스 job

```groovy

pipeline {
    agent any
    
    parameters {
        string(name: 'COMMIT_AUTHOR', defaultValue: '', description: '커밋 작성자')
        string(name: 'COMMIT_MESSAGE', defaultValue: '', description: '커밋 메시지')
        string(name: 'BRANCH_NAME', defaultValue: '', description: '브랜치 이름')
    }

    environment {
        TZ = 'Asia/Seoul'
    }

    stages {
        stage('Print Webhook Variables') {
            steps {
                script {
                    echo "COMMIT_AUTHOR: ${params.COMMIT_AUTHOR}"
                    echo "COMMIT_MESSAGE: ${params.COMMIT_MESSAGE}"
                    echo "BRANCH_NAME: ${params.BRANCH_NAME.replaceAll('refs/heads/', '')}"
                }
            }
        }

        stage('Determine Next Color') {
            steps {
                script {
                    def services = ["frontend_green", "backend_green", "ai_green"]
                    def isGreenHealthy = services.every { svc ->
                        def status = sh(script: "docker inspect --format='{{.State.Health.Status}}' ${svc} || echo 'missing'", returnStdout: true).trim()
                        return status == "healthy"
                    }

                    env.DEPLOY_COLOR = isGreenHealthy ? "blue" : "green"
                    env.OLD_COLOR = env.DEPLOY_COLOR == "blue" ? "green" : "blue"

                    echo "✅ 현재 운영 색상: ${env.OLD_COLOR}"
                    echo "🆕 새 배포 색상: ${env.DEPLOY_COLOR}"
                }
            }
        }

        stage('Trigger FE Build') {
            steps {
                build job: 'dev-fe', wait: true, parameters: [
                    string(name: 'DEPLOY_COLOR', value: env.DEPLOY_COLOR)
                ]
            }
        }

        stage('Trigger BE/AI Build') {
            steps {
                build job: 'dev-be', wait: true, parameters: [
                    string(name: 'DEPLOY_COLOR', value: env.DEPLOY_COLOR)
                ]
            }
        }

        stage('Trigger Infra Deploy') {
            steps {
                build job: 'dev-infra', wait: true, parameters: [
                    string(name: 'COMMIT_AUTHOR', value: env.COMMIT_AUTHOR),
                    string(name: 'COMMIT_MESSAGE', value: env.COMMIT_MESSAGE),
                    string(name: 'BRANCH_NAME', value: env.BRANCH_NAME),
                    string(name: 'DEPLOY_COLOR', value: env.DEPLOY_COLOR),
                    string(name: 'OLD_COLOR', value: env.OLD_COLOR)
                ]
            }
        }
    }

    post {
        success {
            echo "✅ 전체 빌드 및 배포 성공!"
        }
        failure {
            echo "❌ 실패 발생"
        }
    }
}

```

-dev-fe 젠킨스 job


```groovy


pipeline {
    agent any
    parameters {
        string(name: 'DEPLOY_COLOR', defaultValue: 'blue', description: '배포 색상')
    }
    environment {
        TZ = 'Asia/Seoul'
    }
    stages {
        stage('Analyze Frontend with SonarQube') {
            steps {
                echo "🔍 Analyzing Frontend with SonarQube..."
                dir('frontend') {
                    withSonarQubeEnv('sonarqube') { //젠킨스에서 sonarqube 서버 설정하면 토큰, url 주소 등을 자동 주입한다.
                        script {
                            def scannerHome = tool name: 'sonarqubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'  //젠킨스에서 sonarqubeScanner 다운로드 받아야 함
                            sh """#!/bin/bash
                                echo "🧪 Running SonarScanner for Frontend..."
                                export PATH=\$PATH:${scannerHome}/bin
                                sonar-scanner \\
                                  -Dsonar.projectKey=q-generator-fe \\
                                  -Dsonar.sources=. \\
                                  -Dsonar.projectBaseDir=. \\
                                  -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.*,**/__tests__/** \\
                                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            """
                        }
                    }
                }
            }
        }
        stage('Build Frontend') {
            steps {
                echo "🎨 Building Frontend Docker Image..."
                sh "docker build -t frontend:${params.DEPLOY_COLOR} ./frontend"
            }
        }
    }
}


```

-dev-be 젠킨스 job

```groovy

pipeline {
    agent any

    parameters {
        string(name: 'DEPLOY_COLOR', defaultValue: 'blue', description: '배포 색상')
    }

    environment {
        TZ = 'Asia/Seoul'
    }

    stages {
        stage('Inject Secrets') {
            steps {
                echo "🔐 Injecting environment files and application config..."

                withCredentials([
                    file(credentialsId: 'env-file', variable: 'ENV_FILE'),
                    file(credentialsId: 'app-yml', variable: 'APP_YML')
                ]) {
                    sh '''
                        mkdir -p backend/src/main/resources
                        cp "$APP_YML" backend/src/main/resources/application.yml
                        cp "$ENV_FILE" backend/.env
                    '''
                }
            }
        }

        stage('Build & Analyze Backend') {
            steps {
                echo "🛠️ Running Gradle build and SonarQube analysis..."

                dir('backend') {
                    withSonarQubeEnv('sonarqube') {
                        script {
                            def scannerHome = tool name: 'sonarqubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                            sh """#!/bin/bash
                                echo "📄 Checking .env..."
                                ls -al .env || { echo '❌ .env not found'; exit 1; }

                                echo "🌿 Loading environment variables..."
                                set -o allexport
                                source .env
                                set +o allexport

                                echo "🔨 Running Gradle build..."
                                chmod +x gradlew
                                ./gradlew build

                                echo "🔍 Running SonarQube analysis (Backend)..."
                                export PATH=\$PATH:${scannerHome}/bin
                                sonar-scanner \\
                                  -Dsonar.projectKey=q-generator-be \\
                                  -Dsonar.sources=src/main/java \\
                                  -Dsonar.projectBaseDir=. \\
                                  -Dsonar.java.binaries=build/classes/java/main \\
                                  -Dsonar.exclusions=**/test/**
                            """
                        }
                    }
                }
            }
        }

        stage('Build & Analyze AI') {
            steps {
                echo "🧠 Running SonarQube analysis for AI..."

                dir('ai') {
                    withSonarQubeEnv('sonarqube') {
                        script {
                            def scannerHome = tool name: 'sonarqubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                            sh """#!/bin/bash
                                echo "🔍 Running SonarQube analysis (AI)..."
                                export PATH=\$PATH:${scannerHome}/bin
                                sonar-scanner \\
                                  -Dsonar.projectKey=q-generator-ai \\
                                  -Dsonar.sources=. \\
                                  -Dsonar.language=py \\
                                  -Dsonar.exclusions=**/__pycache__/**,**/tests/**
                            """
                        }
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                echo "🐳 Building Backend Docker Image..."
                sh "docker build -t backend:${params.DEPLOY_COLOR} ./backend"
            }
        }

        stage('Build AI Docker Image') {
            steps {
                echo "🤖 Building AI Docker Image..."
                sh "docker build -t ai:${params.DEPLOY_COLOR} ./ai"
            }
        }
    }
}



```

-dev-infra 젠킨스 job


```groovy

import groovy.json.JsonOutput

def notifyMattermost(success = true) {
    def safeCommitMessage = params.COMMIT_MESSAGE.replaceAll(/\r?\n/, ' ').trim()
    def commitAuthor = params.COMMIT_AUTHOR
    def branchName = params.BRANCH_NAME?.replaceAll('refs/heads/', '') ?: 'unknown'
    def statusEmoji = success ? "✅" : "❌"
    def statusText = success ? "### ${statusEmoji} 배포 성공" : "### ${statusEmoji} 배포 실패"

    def contentBlock = """


👤 ${commitAuthor}
🌿 ${branchName}
📝 ${safeCommitMessage}

""".stripIndent().trim()

    def finalMessage = "${statusText}\n\n${contentBlock}"

    def payload = JsonOutput.toJson([text: finalMessage])

    withCredentials([string(credentialsId: 'webhook-url', variable: 'WEBHOOK_URL')]) {
        writeFile file: 'mattermost_payload.json', text: payload
        sh 'curl -X POST -H "Content-Type: application/json" -d @mattermost_payload.json "$WEBHOOK_URL"'
    }
}

def rollbackToOld() {
    echo "🛑 롤백 시작 (Old Color: ${params.OLD_COLOR})"
    sh """
        export FRONTEND_UPSTREAM=frontend_${params.OLD_COLOR}
        export BACKEND_UPSTREAM=backend_${params.OLD_COLOR}
        export AI_UPSTREAM=ai_${params.OLD_COLOR}
        envsubst '\$FRONTEND_UPSTREAM \$BACKEND_UPSTREAM \$AI_UPSTREAM' < ./nginx-template/nginx.template.conf > ./nginx/conf.d/active.conf
        docker cp ./nginx/conf.d/active.conf nginx:/etc/nginx/conf.d/active.conf
        docker exec nginx nginx -t
        docker exec nginx nginx -s reload
    """
}

pipeline {
    agent any

    parameters {
        string(name: 'COMMIT_AUTHOR', defaultValue: '', description: '커밋 작성자')
        string(name: 'COMMIT_MESSAGE', defaultValue: '', description: '커밋 메시지')
        string(name: 'BRANCH_NAME', defaultValue: '', description: '브랜치 이름')
        string(name: 'DEPLOY_COLOR', defaultValue: 'green', description: '배포할 색상')
        string(name: 'OLD_COLOR', defaultValue: 'blue', description: '현재 운영 중인 색상')
    }

    environment {
        TZ = 'Asia/Seoul'
    }

    stages {
        stage('Inject Secrets') {
            steps {
                echo "🔐 설정 파일 주입 중..."
                withCredentials([
                    file(credentialsId: 'env-file', variable: 'ENV_FILE'),
                    file(credentialsId: 'app-yml', variable: 'APP_YML')
                ]) {
                    sh """
                        mkdir -p backend/src/main/resources
                        cp \$APP_YML backend/src/main/resources/application.yml

                        cp \$ENV_FILE backend/.env
                        cp \$ENV_FILE frontend/.env
                        cp \$ENV_FILE ai/.env

                        cp \$ENV_FILE .env
                    """
                }
            }
        }

        stage('Clean Up EXISTING NEW Containers') {
            steps {
                echo "🧹 기존 ${params.DEPLOY_COLOR} 컨테이너 정리 중..."
                sh """
                    docker compose --project-name=${params.DEPLOY_COLOR} -f docker-compose.${params.DEPLOY_COLOR}.yml down || true
                """
            }
        }

        stage('Deploy NEW Containers') {
            steps {
                echo "🚀 새로운 ${params.DEPLOY_COLOR} 컨테이너 띄우는 중..."
                sh """
                    docker compose --project-name=${params.DEPLOY_COLOR} -f docker-compose.${params.DEPLOY_COLOR}.yml up -d --build
                """
            }
        }

        stage('Health Check NEW Containers') {
            steps {
                sleep(time: 5, unit: 'SECONDS')
                echo "🩺 새로 띄운 컨테이너 헬스체크 중..."
                script {
                    def services = ["frontend_${params.DEPLOY_COLOR}", "backend_${params.DEPLOY_COLOR}", "ai_${params.DEPLOY_COLOR}"]
                    for (svc in services) {
                        retry(10) {
                            sh """
                                echo "🔎 Checking health of ${svc}..."
                                STATUS=\$(docker inspect --format='{{.State.Health.Status}}' ${svc} | tr -d '\\n')
                                echo "Current STATUS: \$STATUS"
                                if [ "\$STATUS" != "healthy" ]; then
                                    echo "❌ Still not healthy (\$STATUS). Waiting 5s..."
                                    sleep 5
                                    exit 1
                                fi
                                echo "✅ ${svc} is healthy!"
                            """
                        }
                    }
                }
            }
        }

        stage('Update Nginx Configuration') {
            steps {
                echo "📦 NGINX 설정 파일 생성 중..."
                sh """
                    export FRONTEND_UPSTREAM=frontend_${params.DEPLOY_COLOR}
                    export BACKEND_UPSTREAM=backend_${params.DEPLOY_COLOR}
                    export AI_UPSTREAM=ai_${params.DEPLOY_COLOR}
                    envsubst '\$FRONTEND_UPSTREAM \$BACKEND_UPSTREAM \$AI_UPSTREAM' < ./nginx-template/nginx.template.conf > ./nginx/conf.d/active.conf
                    docker cp ./nginx/conf.d/active.conf nginx:/etc/nginx/conf.d/active.conf
                """
            }
        }

        stage('Reload Nginx') {
            steps {
                echo "🚀 NGINX 설정 반영 (reload) 중..."
                script {
                    try {
                        sh """
                            docker exec nginx nginx -t
                            docker exec nginx nginx -s reload
                        """
                    } catch (Exception e) {
                        echo "❌ Nginx reload 실패. 롤백 시작..."
                        rollbackToOld()
                        error("❌ 롤백 후 실패 처리")
                    }
                }
            }
        }

        stage('Clean Up OLD Containers') {
            steps {
                echo "🧹 이전 (${params.OLD_COLOR}) 컨테이너 정리 중..."
                sh """
                    docker compose --project-name=${params.OLD_COLOR} -f docker-compose.${params.OLD_COLOR}.yml down || true
                    docker image prune -f || true
                """
            }
        }
    }

    post {
        success {
            script {
                notifyMattermost(true)
            }
        }
        failure {
            script {
                notifyMattermost(false)
            }
        }
    }
}

```

## 7. 소나큐브 설정

가비아에서 서브도메인으로 sonar.q-generator.com 설정

### 7.1 소나큐브 토큰 발급 및 project 생성

소나큐브 컨테이너 올라간 뒤 sonar.q-generator.com 접속. Account->Security 들어가서 토큰 발급. 발급할 때 나온 토큰을 따로 저장

프로젝트 생성할 때 project display name을 q-generator-fe, q-generator-be, q-generator-ai로 세 개 설정. 각각 따로 따로 확인 가능하도록 한 것.

### 7.2 젠킨스 설정

젠킨스에서 SonarQube Scanner 플러그인을 다운로드-> 시스템에서 Name, Server URL, Server authentication token 등록. 특히 Server authentication token에는 소나큐브에서 발급받은 토큰을 넣는다.

Tools에 들어가서는 SonarQube Scanner installations에 SonarQube Scanner 등록. Install automatically 등록. 버전 선택 가능한데, 7.1.0.4889 버전 선택함

젠킨스 파일에서 아래의 withSonarQubeEnv('sonarqube')에는 system에서 SonarQube servers로 저장한 이름 입력
def scannerHome = tool name: 'sonarqubeScanner', type: 'hudson.plugins.sonar. 에는 Tools에서 지정한 SonarQube Scanner 이름 등록


```groovy

withSonarQubeEnv('sonarqube') { //젠킨스에서 sonarqube 서버 설정하면 토큰, url 주소 등을 자동 주입한다.
                        script {
                            def scannerHome = tool name: 'sonarqubeScanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'  //젠킨스에서 sonarqubeScanner 다운로드 받아야 함
                            sh """#!/bin/bash
                                echo "🧪 Running SonarScanner for Frontend..."
                                export PATH=\$PATH:${scannerHome}/bin
                                sonar-scanner \\
                                  -Dsonar.projectKey=q-generator-fe \\
                                  -Dsonar.sources=. \\
                                  -Dsonar.projectBaseDir=. \\
                                  -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.*,**/__tests__/** \\
                                  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                            """
                        }
                    }

```
