import groovy.json.JsonOutput

def notifyMattermost(success = true) {
    def safeCommitMessage = params.COMMIT_MESSAGE.replaceAll(/\r?\n/, ' ').trim()
    def commitAuthor = params.COMMIT_AUTHOR
    def branchName = params.BRANCH_NAME?.replaceAll('refs/heads/', '') ?: 'unknown'
    def statusEmoji = success ? "✅" : "❌"
    def statusText = success ? "### ${statusEmoji} 배포 성공" : "### ${statusEmoji} 배포 실패"

    def contentBlock = """
```
👤 ${commitAuthor}
🌿 ${branchName}
📝 ${safeCommitMessage}
```
""".stripIndent().trim()

    def finalMessage = "${statusText}\n\n${contentBlock}"

    def payload = JsonOutput.toJson([text: finalMessage])

    withCredentials([string(credentialsId: 'webhook-url', variable: 'WEBHOOK_URL')]) {
        writeFile file: 'mattermost_payload.json', text: payload
        sh 'curl -X POST -H "Content-Type: application/json" -d @mattermost_payload.json "$WEBHOOK_URL"'
    }
}

def rollbackToOld() {
    echo " 롤백 시작 (Old Color: ${params.OLD_COLOR})"
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
                echo "설정 파일 주입 중..."
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
                echo "새로운 ${params.DEPLOY_COLOR} 컨테이너 띄우는 중..."
                sh """
                    docker compose --project-name=${params.DEPLOY_COLOR} -f docker-compose.${params.DEPLOY_COLOR}.yml up -d --build
                """
            }
        }

        stage('Health Check NEW Containers') {
            steps {
                sleep(time: 5, unit: 'SECONDS')
                echo " 새로 띄운 컨테이너 헬스체크 중..."
                script {
                    def services = ["frontend_${params.DEPLOY_COLOR}", "backend_${params.DEPLOY_COLOR}", "ai_${params.DEPLOY_COLOR}"]
                    for (svc in services) {
                        retry(10) {
                            sh """
                                echo "🔎 Checking health of ${svc}..."
                                STATUS=\$(docker inspect --format='{{.State.Health.Status}}' ${svc} | tr -d '\\n')
                                echo "Current STATUS: \$STATUS"
                                if [ "\$STATUS" != "healthy" ]; then
                                    echo "Still not healthy (\$STATUS). Waiting 5s..."
                                    sleep 5
                                    exit 1
                                fi
                                echo "${svc} is healthy!"
                            """
                        }
                    }
                }
            }
        }

        stage('Update Nginx Configuration') {
            steps {
                echo " NGINX 설정 파일 생성 중..."
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
                echo "NGINX 설정 반영 (reload) 중..."
                script {
                    try {
                        sh """
                            docker exec nginx nginx -t
                            docker exec nginx nginx -s reload
                        """
                    } catch (Exception e) {
                        echo " Nginx reload 실패. 롤백 시작..."
                        rollbackToOld()
                        error(" 롤백 후 실패 처리")
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
