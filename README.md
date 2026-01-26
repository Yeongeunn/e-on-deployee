# 🚀 E-ON (Education-ON) Deployment & DevOps

> **GCP와 Jenkins를 활용한 클라우드 네이티브 인프라 구축 및 CI/CD 파이프라인 자동화**
> 본 레포지토리는 초중등 학교 밖 청소년을 위한 서비스 'E-ON'의 안정적인 배포와 운영을 위한 인프라 설정 및 자동화 스크립트를 관리합니다.

---

## 🏗 System Architecture


서비스의 확장성과 운영 안정성을 위해 **GCP VM 기반 배포**에서 **GKE(Google Kubernetes Engine)** 환경으로 인프라를 고도화하였습니다. L7 Load Balancer(Ingress)를 통해 트래픽을 효율적으로 라우팅하며, Jenkins를 통해 코드 푸시부터 배포까지의 전 과정을 자동화했습니다.

---

## 🛠 Tech Stack
- **Cloud**: Google Cloud Platform (GCP)
- **Orchestration**: Kubernetes (GKE)
- **CI/CD**: Jenkins, Docker
- **Web Server**: Nginx (Frontend Serving)
- **Database**: MySQL 8.0 (Sequelize Migration)
- **Networking**: Ingress (Path-based Routing), NodePort Service

---

## 🌟 Key Engineering Points

### 1. CI: Docker Multi-stage Build & Optimization
- **Build Efficiency**: `builder` 스테이지를 별도로 분리하여 실행 컨테이너에는 런타임에 필수적인 파일만 포함, 이미지 용량을 최적화하고 보안성을 강화했습니다.
- **Sequential Build**: Jenkins 서버의 리소스(OOM) 문제를 해결하기 위해 병렬 빌드 대신 순차 빌드 구조로 파이프라인을 설계하여 빌드 안정성을 확보했습니다.
- **WorkSpace Cleanup**: 빌드 직후 `cleanWs()`를 통해 작업 공간을 정리하여 제한된 인프라 리소스 내에서 최적의 빌드 환경을 유지했습니다.

### 2. CD: Stable Deployment & Ingress Routing
- **GKE Ingress 기반 통합 엔드포인트**: L7 로드밸런서(Ingress)를 통해 `/api/*`, `/socket.io/*` 경로 트래픽을 자동 라우팅했습니다. 이를 통해 프론트엔드 빌드 시점에 백엔드 주소를 하드코딩할 필요가 없는 **'환경 독립적 배포'**를 구현했습니다.
- **Kubernetes Rolling Update**: `readinessProbe`를 적용하여 컨테이너가 완전히 실행된 후 트래픽을 전환함으로써 서비스 중단 없는 무중단 배포를 실현했습니다.
- **Infrastructure Evolution**: 초기 VM 환경 배포에서 GKE 오케스트레이션 환경으로 이전하며 인프라 유연성을 극대화했습니다.

### 3. Database: Automated Lifecycle Management
- **Pre-flight Check**: `entrypoint.sh`를 활용해 DB 포트 가용성을 확인(`nc -z`)한 후 서버가 실행되도록 제어하여 컨테이너 간 의존성 문제를 해결했습니다.
- **Auto Migration**: 컨테이너 실행 시 `Sequelize Migration & Seeding`이 자동으로 수행되도록 구성하여 DB 스키마 형상 관리를 자동화했습니다.

---

## 📂 Project Structure
- `k8s/`: Kubernetes 배포를 위한 Deployment, Service, Ingress YAML 파일
- `backend/`: Node.js 기반 백엔드 Dockerfile 및 Entrypoint 스크립트
- `frontend/`: React 기반 프론트엔드 Dockerfile 및 Nginx 설정 파일
- `Jenkinsfile`: 운영 환경(GKE) 및 VM 테스트 환경용 파이프라인 스크립트

---

## 🚀 How to Run (CI/CD Pipeline)

본 프로젝트는 **Jenkins Multibranch Pipeline**을 사용하여 브랜치별로 최적화된 자동화 시나리오를 실행합니다.

1. **Source Control**: `feature/*` 브랜치 푸시 및 PR 생성, 또는 `main` 브랜치 병합 시 웹훅 트리거 발생
2. **CI Stage**: 도커 이미지 빌드 테스트 (빌드 번호 고유 태깅) 및 Docker Hub 푸시를 통한 코드 안정성 검증
3. **CD Stage**: `main` 브랜치 병합 시 GKE 클러스터 인증 후, `sed`를 활용한 이미지 태그 갱신 및 `rollout restart`로 실제 서버 배포
4. **Finalize**: Discord 웹훅을 통한 배포 결과 실시간 알림 및 Jenkins 작업 공간 정리(CleanUp)
