pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "node-backend:latest"
        CONTAINER_NAME = "backend"
        NETWORK = "app-network"
    }
    stages {
        stage('Checkout') {
            // steps {
            //     git(
            //         branch: 'main',
            //         url: 'https://github.com/gukaitest/express_mongodb.git'
            //     )
            // }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ." // 直接调用 Shell 命令
            }
        }
        stage('Deploy') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
                sh """
                docker run -d \
                    --name ${CONTAINER_NAME} \
                    --network ${NETWORK} \
                    -p 3000:3000 \
                    ${DOCKER_IMAGE}
                """
            }
        }
    }
}