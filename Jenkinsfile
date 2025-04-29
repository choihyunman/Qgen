def notifyMattermost(message, success = true) {
    def color = success ? "#00c853" : "#d50000"
    def commitInfo = "[🧑 ${params.COMMIT_AUTHOR}] - \"${params.COMMIT_MESSAGE}\""

    withCredentials([string(credentialsId: 'webhook-url', variable: 'WEBHOOK_URL')]) {
        writeFile file: 'mattermost_payload.json', text: """
        {
            "username": "Jenkins Infra Bot",
            "icon_emoji": ":rocket:",
            "attachments": [{
                "fallback": "${message}",
                "color": "${color}",
                "text": "${message}\\n${commitInfo}"
            }]
        }
        """
        sh 'curl -X POST -H "Content-Type: application/json" -d @mattermost_payload.json "$WEBHOOK_URL"'
    }
}

pipeline {
    agent any

    parameters {
        string(name: 'COMMIT_AUTHOR', defaultValue: '', description: '커밋 작성자')
        string(name: 'COMMIT_MESSAGE', defaultValue: '', description: '커밋 메시지')
        string(name: 'DEPLOY_COLOR', defaultValue: 'green', description: '이번에 띄울 색상')
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
                    cp \$ENV_FILE .env
                    cp \$APP_YML backend/src/main/resources/application.yml
                    """
                }
            }
        }

        stage('Deploy NEW Containers') {
            steps {
                echo "🚀 새로운 ${params.DEPLOY_COLOR} 컨테이너 띄우는 중..."
                sh """
                docker compose -f docker-compose.${params.DEPLOY_COLOR}.yml up -d --build
                """
            }
        }

        stage('Health Check NEW Containers') {
            steps {
                echo "🩺 새로 띄운 컨테이너 헬스체크 중..."
                script {
                    def services = ["frontend_${params.DEPLOY_COLOR}", "backend_${params.DEPLOY_COLOR}", "ai_${params.DEPLOY_COLOR}"]
                    for (svc in services) {
                        retry(3) {
                            sh """
                            echo "🔎 Checking health of ${svc}..."
                            docker inspect --format='{{.State.Health.Status}}' ${svc} | grep healthy
                            """
                        }
                    }
                }
            }
        }

        stage('Update Nginx Configuration') {
            steps {
                echo "📦 NGINX 설정 파일 생성 중..."
                script {
                    sh """
                    export FRONTEND_UPSTREAM=frontend_${params.DEPLOY_COLOR}
                    export BACKEND_UPSTREAM=backend_${params.DEPLOY_COLOR}
                    export AI_UPSTREAM=ai_${params.DEPLOY_COLOR}

                    envsubst < ./nginx-template/nginx.template.conf > ./nginx/conf.d/active.conf
                    """
                }
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
                        error("❌ nginx reload 실패! 롤백 필요")
                    }
                }
            }
        }

        stage('Clean Up OLD Containers') {
            steps {
                echo "🧹 이전 (${params.OLD_COLOR}) 컨테이너 정리..."
                sh """
                docker compose -f docker-compose.${params.OLD_COLOR}.yml down || true
                docker image prune -f || true
                """
            }
        }
    }

    post {
        success {
            script {
                notifyMattermost("✅ *배포 성공!* ${params.OLD_COLOR} → ${params.DEPLOY_COLOR} 전환 완료 🎉", true)
            }
        }
        failure {
            script {
                notifyMattermost("❌ *배포 실패!* 롤백 필요 🔥", false)
            }
        }
    }
}
