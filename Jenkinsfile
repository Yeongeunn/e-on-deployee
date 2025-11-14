// Jenkinsfile

pipeline {
    agent any

    environment {
        // --- Credentials에서 모든 설정 정보 불러오기 ---
        // 젠킨스 Credentials에 등록한 ID를 사용한다.
        DOCKERHUB_ID = credentials('dockerhub-id-text')
        SERVER_USER  = credentials('gcp-server-user')
        SERVER_IP    = credentials('gcp-server-ip')
        VITE_API_URL = credentials('vite-api-url')

        // --- 불러온 변수를 사용해 이미지 이름 조합하기 ---
        BE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-backend"
        FE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'feature/docker-cicd-setup', url: 'https://github.com/Yeongeunn/e-on-deployee.git'
            }
        }

				stage('Build Images') {
            parallel { // 백엔드와 프론트엔드 빌드를 동시에 진행
                stage('Build Backend') {
                    steps {
                        // 백엔드 Dockerfile로 이미지 빌드
                        sh "docker build -t ${BE_IMAGE_NAME}:latest -f backend/Dockerfile ./backend"
                    }
                }
                stage('Build Frontend') {
                    steps {
                        // 프론트엔드 Dockerfile로 이미지 빌드 (build-arg로 API 주소 주입)
                        sh "docker build --build-arg VITE_API_BASE_URL=${VITE_API_URL} -t ${FE_IMAGE_NAME}:latest -f frontend/Dockerfile ./frontend"
                    }
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                // 사용자가 'dockerhub-id'로 생성한 Username/Password Credential 사용
                withCredentials([usernamePassword(credentialsId: 'dockerhub-id', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo ${PASS} | docker login -u ${USER} --password-stdin"
                    sh "docker push ${BE_IMAGE_NAME}:latest"
                    sh "docker push ${FE_IMAGE_NAME}:latest"
                    sh "docker logout" // post 블록 대신 여기서 정리
                }
            }
        }

        stage('Deploy to Production Server') {
            steps {
                // SSH Agent 플러그인이 제공하는 기능
                // 'deploy-server-ssh-key' ID의 SSH 키를 사용해 배포 서버에 접속
                sshagent(credentials: ['deploy-server-ssh-key']) {
		                // 배포 서버에서 실행할 원격 명령어
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} '
                            set -e
                            echo ">> Logged in to deployment server"
                            
                            # 1. 배포 폴더로 이동
                            cd /srv/e-on-deployee
                            
                            # 2. Docker Hub에서 최신 이미지 다운로드
                            echo ">> Pulling latest images..."
                            docker-compose pull
                            
                            # 3. 새 이미지로 컨테이너 실행 (변경된 것만)
                            echo ">> Starting new containers..."
                            docker-compose up -d
                            
                            # 4. 불필요한 구버전 이미지 삭제
                            echo ">> Pruning old images..."
                            docker image prune -f
                            
                            echo ">> Deployment complete!"
                        '
                    """
                }
            }
        }
    }

    post { // 파이프라인이 끝나면 항상 실행
        always {
            echo 'Cleaning up Jenkins workspace...'
            // sh 명령어는 각 stage에서 처리했으므로 여기서는 작업 공간만 정리
            cleanWs()
        }
    }
}