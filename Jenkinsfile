pipeline {
    agent any
    parameters {
        string(name: 'DEPLOY_COLOR', defaultValue: 'blue', description: '배포 색상')
    }
    environment {
        TZ = 'Asia/Seoul'
    }
    stages {
        stage('Build Frontend') {
            steps {
                sh "docker build -t frontend:${params.DEPLOY_COLOR} ./frontend"
            }
        }
    }
}