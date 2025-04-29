def notifyMattermost(message, success = true) {
    def commitInfo = "[\ud83e\uddd1 ${params.COMMIT_AUTHOR}] - \"${params.COMMIT_MESSAGE}\""
    def statusEmoji = success ? "\u2705" : "\u274c"
    def finalMessage = "${statusEmoji} ${message}\n${commitInfo}"

    withCredentials([string(credentialsId: 'webhook-url', variable: 'WEBHOOK_URL')]) {
        writeFile file: 'mattermost_payload.json', text: """
        {
            "text": "${finalMessage}"
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
        string(name: 'DEPLOY_COLOR', defaultValue: 'green', description: '배포할 색상')
        string(name: 'OLD_COLOR', defaultValue: 'blue', description: '현재 운영 중인 색상')
    }

    environment {
        TZ = 'Asia/Seoul'
    }

    stages {
        stage('Inject Secrets') {
            steps {
                echo "\ud83d\udd10 \uc124\uc815 \ud30c\uc77c \uc8fc\uc785 \uc911.."
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

        stage('Clean Up EXISTING NEW Containers') {
            steps {
                echo "\ud83e\uddf9 \uae30\uc874 ${params.DEPLOY_COLOR} \ucee4\ud14c\uc774\ub108 \uc815\ub9ac \uc911..."
                script {
                    def services = ["frontend_${params.DEPLOY_COLOR}", "backend_${params.DEPLOY_COLOR}", "ai_${params.DEPLOY_COLOR}"]
                    for (svc in services) {
                        sh """
                        if docker ps -a --format '{{.Names}}' | grep -w ${svc}; then
                            docker rm -f ${svc}
                        fi
                        """
                    }
                }
            }
        }

        stage('Deploy NEW Containers') {
            steps {
                echo "\ud83d\ude80 \uc0c8\ub85c\uc6b4 ${params.DEPLOY_COLOR} \ucee4\ud14c\uc774\ub108 \eb9c9\uc774\ub294 \uc911..."
                sh """
                docker compose -f docker-compose.${params.DEPLOY_COLOR}.yml up -d --build
                """
            }
        }

        stage('Health Check NEW Containers') {
            steps {
                echo "\ud83e\ude7a \uc0c8\ub85c \eb9c9\uc778 \ucee4\ud14c\uc774\ub108 \ud5e4\uc77c\uc2a4\uccb4\ud06c \uc911..."
                script {
                    def services = ["frontend_${params.DEPLOY_COLOR}", "backend_${params.DEPLOY_COLOR}", "ai_${params.DEPLOY_COLOR}"]
                    for (svc in services) {
                        retry(3) {
                            sh """
                            echo "\ud83d\udd0e Checking health of ${svc}..."
                            docker inspect --format='{{.State.Health.Status}}' ${svc} | grep healthy
                            """
                        }
                    }
                }
            }
        }

        stage('Update Nginx Configuration') {
            steps {
                echo "\ud83d\udce6 NGINX \uc124\uc815 \ud30c\uc77c \uc0dd\uc131 \uc911..."
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
                echo "\ud83d\ude80 NGINX \uc124\uc815 \ubc18\uc601 (reload) \uc911..."
                script {
                    try {
                        sh """
                        docker exec nginx nginx -t
                        docker exec nginx nginx -s reload
                        """
                    } catch (Exception e) {
                        error("\u274c nginx reload \uc2e4\ud328! \ub864\ubc15 \ud544\uc694")
                    }
                }
            }
        }

        stage('Clean Up OLD Containers') {
            steps {
                echo "\ud83e\uddf9 \uc774\uc804 (${params.OLD_COLOR}) \ucee4\ud14c\uc774\ub108 \uc815\ub9ac \uc911..."
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
                notifyMattermost("*\ubc30\ud3ec \uc131\uacf5!* ${params.OLD_COLOR} \u2192 ${params.DEPLOY_COLOR} \uc804\ud658 \uc644\ub8cc \ud83c\udf89", true)
            }
        }
        failure {
            script {
                notifyMattermost("*\ubc30\ud3ec \uc2e4\ud328!* \ub864\ubc15 \ud544\uc694 \ud83d\udd25", false)
            }
        }
    }
}
