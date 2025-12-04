// Jenkinsfile

pipeline {
    agent any

    environment {
        // --- Credentials에서 모든 설정 정보 불러오기 ---
		PROJECT_ID = 'education-on-474706' 
		CLUSTER_NAME = 'eon-cluster-1'
		LOCATION = 'asia-northeast3-a'
		CREDENTIALS_ID = 'gcp-sa-key'
		    
		//    --도커 허브 & 프론트엔드 설정--
        DOCKERHUB_ID_TEXT = credentials('dockerhub-id-text') //도커아이디
        VITE_API_URL = credentials('vite-api-url') //프론트엔드 API 주소

        // --- 불러온 변수를 사용해 이미지 이름 조합하기 ---
        BE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-backend"
        FE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-frontend"
    }

stages {
        stage('Checkout') {
            steps {
                // 1. checkout scm 대신 가벼운 checkout 사용
                checkout([
                    $class: 'GitSCM',
                    branches: scm.branches,
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [[
                        $class: 'CloneOption',
                        depth: 1,  // 최신 커밋 1개만 가져옴 (메모리 절약)
                        noTags: true,
                        reference: '',
                        shallow: true
                    ]],
                    submoduleCfg: [],
                    userRemoteConfigs: scm.userRemoteConfigs
                ])
            }
        }
        //병렬 제거하고 순차적으로 실행
        stage('Build Backend') {
            steps {
                // 백엔드 Dockerfile로 이미지 빌드
                sh "docker build -t ${BE_IMAGE_NAME}:latest -f backend/Dockerfile ./backend"
            }
        }
        stage('Build Frontend') {
            steps {
                // 프론트엔드 Dockerfile로 이미지 빌드 (build-arg로 API 주소 주입)
                sh "docker build --no-cache --build-arg VITE_API_URL=${VITE_API_URL} -t ${DOCKERHUB_ID_TEXT}/e-on-frontend:v2 -f frontend/Dockerfile ./frontend"            }
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
            when{
                branch 'main' //브랜치가 'main'일 때만 배포한다.
            }
            steps {
                // 플러그인 대신 쉘 스크립트로 직접 배포
                withCredentials([file(credentialsId: env.CREDENTIALS_ID, variable: 'GCP_KEY_FILE')]) {
                    sh """
                        # 1. GKE 인증 (서비스 계정 키 사용)
                        gcloud auth activate-service-account --key-file=${GCP_KEY_FILE}
                        
                        # 2. 클러스터 연결 설정
                        gcloud container clusters get-credentials ${env.CLUSTER_NAME} --zone ${env.LOCATION} --project ${env.PROJECT_ID}
                        
                        # 3. 배포 확인 (디버깅용: 파일이 진짜 있는지 확인)
                        echo ">> Checking k8s files..."
                        ls -la k8s/

                        # 4. 쿠버네티스 배포 (여기서는 *.yaml이 잘 먹힙니다!)
                        echo ">> Deploying to Kubernetes..."
                        kubectl apply -f k8s/
                        
                        # 5. 롤링 업데이트
                        kubectl rollout restart deployment/backend
                        kubectl rollout restart deployment/frontend
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
