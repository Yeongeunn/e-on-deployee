// Jenkinsfile

pipeline {
    agent any

    environment {
        // --- Credentials에서 모든 설정 정보 불러오기 ---
        // 젠킨스 Credentials에 등록한 ID를 사용한다.
        DOCKERHUB_ID_TEXT = credentials('dockerhub-id-text')
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
                git branch: 'feature/gke-deployment', url: 'https://github.com/Yeongeunn/e-on-deployee.git'
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
                        sh "docker build --build-arg VITE_API_URL=${VITE_API_URL} -t ${FE_IMAGE_NAME}:latest -f frontend/Dockerfile ./frontend"
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

        stage('Deploy to GKE') {
            steps {
                // 1. GCP 서비스 계정 키 파일 가져오기
                withCredentials([file(credentialsId: 'gcp-gke-key', variable: 'GCP_KEY_FILE')]) {
                    sh """
                        # 2. GKE 인증 처리(서비스 계정 활성화)
                        gcloud auth activate-service-account --key-file=${GCP_KEY_FILE}
                        
                        # 3. 클러스터 접속 정보 가져오기 (본인 정보로 수정 필수!)
                        # GCP 콘솔 -> GKE -> 연결 버튼 누르면 나오는 명령어 복붙
                        gcloud container clusters get-credentials [클러스터이름] --zone [지역/asia-northeast3-a] --project [프로젝트ID]

                        # 4. 쿠버네티스 배포 적용
                        echo ">> Deploying to Kubernetes..."
                        
                        # k8s 폴더 안에 있는 모든 yaml 파일을 적용
                        kubectl apply -f k8s/
                        
                        # 5. 강제로 재시작하여 최신 이미지 당겨오게 하기 (롤링 업데이트)
                        kubectl rollout restart deployment/backend
                        kubectl rollout restart deployment/frontend
                    """
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