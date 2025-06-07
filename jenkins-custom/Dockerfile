FROM jenkins/jenkins:lts-jdk17

USER root

# docker CLI만 apt로 설치하고, docker compose는 직접 다운로드
RUN apt-get update && \
    apt-get install -y docker.io curl && \
    mkdir -p /usr/local/lib/docker/cli-plugins && \
    curl -SL https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose && \
    apt-get clean

USER jenkins
