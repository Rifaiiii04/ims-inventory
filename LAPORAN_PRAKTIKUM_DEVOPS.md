# LAPORAN PRAKTIKUM DEVOPS

## Sistem Inventory Management Angkringan (Angkringan IMS)

---

## 1. Nama dan NIM

**Nama:** [NAMA LENGKAP]  
**NIM:** [NIM]

---

## 2. Nama Kelompok dan Anggota

**Nama Kelompok:** [NAMA KELOMPOK]

**Anggota Kelompok:**

1. [NAMA ANGGOTA 1] - NIM: [NIM 1]
2. [NAMA ANGGOTA 2] - NIM: [NIM 2]
3. [NAMA ANGGOTA 3] - NIM: [NIM 3]
4. [NAMA ANGGOTA 4] - NIM: [NIM 4]

---

## 3. Tujuan Praktikum

Tujuan praktikum ini adalah untuk memahami dan mengimplementasikan prinsip-prinsip DevOps dalam pengembangan sistem perangkat lunak, khususnya pada proyek **Sistem Inventory Management Angkringan (Angkringan IMS)**.

Melalui praktikum ini, diharapkan dapat:

1. Memahami konsep dan prinsip DevOps
2. Merencanakan implementasi DevOps untuk sistem yang dikembangkan
3. Mengidentifikasi tools DevOps yang sesuai
4. Menganalisis tantangan dalam implementasi DevOps
5. Memahami manfaat DevOps bagi Manajer Proyek Sistem Informasi

---

## 4. Hasil dan Pembahasan

### 4.1. Deskripsi Sistem

**Angkringan IMS** adalah sistem manajemen inventori untuk mengelola stok barang pada usaha angkringan. Sistem terdiri dari:

-   **Backend**: Laravel 10 (PHP)
-   **Frontend**: React 19 dengan Vite dan Tailwind CSS
-   **OCR Service**: Python Flask dengan EasyOCR dan Google Gemini AI
-   **Database**: MySQL
-   **Workflow Automation**: N8N untuk notifikasi stok

### 4.2. Rencana Implementasi DevOps

#### 4.2.1. Continuous Integration (CI)

**Tools yang Dipilih:**

-   GitHub Actions atau GitLab CI/CD
-   PHPUnit untuk testing Laravel
-   Jest untuk testing React

**Workflow CI:**

1. Developer push code ke repository
2. Trigger automated build
3. Install dependencies (Composer & NPM)
4. Run linter dan unit tests
5. Build production assets
6. Generate test coverage report

#### 4.2.2. Continuous Deployment (CD)

**Tools yang Dipilih:**

-   Docker untuk containerization
-   Docker Compose untuk orchestration
-   Nginx sebagai reverse proxy

**Deployment Strategy:**

-   Blue-Green Deployment untuk zero-downtime
-   Feature Flags untuk gradual rollout
-   Database Migration dengan rollback capability

#### 4.2.3. Infrastructure as Code (IaC)

**Tools yang Dipilih:**

-   Terraform untuk provisioning infrastructure
-   Ansible untuk configuration management

**Infrastructure Components:**

-   Virtual Private Cloud (VPC)
-   Load Balancer
-   Application Servers (Auto Scaling)
-   Database (RDS/Managed MySQL)
-   Storage (S3 untuk file uploads)

#### 4.2.4. Monitoring dan Logging

**Tools yang Dipilih:**

-   Prometheus untuk metrics collection
-   Grafana untuk visualization
-   ELK Stack untuk log aggregation
-   Sentry untuk error tracking

**Key Metrics:**

-   Response time API
-   Error rate
-   CPU dan Memory usage
-   Database query performance
-   OCR service processing time

#### 4.2.5. Version Control

**Tools yang Dipilih:**

-   Git dengan GitFlow workflow
-   GitHub/GitLab sebagai repository
-   Pull Request dengan code review mandatory

#### 4.2.6. Security

**Tools dan Praktik:**

-   Dependabot atau Snyk untuk dependency scanning
-   OWASP ZAP untuk security testing
-   Secrets Management dengan HashiCorp Vault
-   SSL/TLS certificates dengan Let's Encrypt

### 4.3. Tantangan dalam Implementasi DevOps

#### 4.3.1. Tantangan Teknis

**a. Multi-Stack Architecture**

-   **Masalah**: Sistem menggunakan 3 teknologi berbeda (PHP/Laravel, Node.js/React, Python)
-   **Tantangan**: CI/CD pipeline kompleks, koordinasi deployment, dependency management berbeda
-   **Solusi**: Docker containerization, Docker Compose orchestration, microservices architecture

**b. OCR Service Integration**

-   **Masalah**: Python OCR service harus terintegrasi dengan Laravel backend
-   **Tantangan**: Service communication, error handling, service discovery, monitoring
-   **Solusi**: API Gateway pattern, circuit breaker, health check endpoints

**c. Database Migration**

-   **Masalah**: Database schema changes perlu dikelola dengan baik
-   **Tantangan**: Zero-downtime migration, rollback strategy, data consistency
-   **Solusi**: Laravel migration dengan backward compatibility, blue-green deployment

**d. Environment Management**

-   **Masalah**: Perbedaan konfigurasi antara development, staging, dan production
-   **Tantangan**: Environment-specific configurations, secrets management
-   **Solusi**: Environment variables, secrets management tools, Infrastructure as Code

#### 4.3.2. Tantangan Organisasi

**a. Cultural Change**

-   **Masalah**: Perubahan mindset dari traditional development ke DevOps
-   **Tantangan**: Resistance to change, learning curve, collaboration
-   **Solusi**: Training dan workshop, gradual adoption, cross-functional teams

**b. Skill Gap**

-   **Masalah**: Tim belum familiar dengan DevOps tools
-   **Tantangan**: Training requirements, time investment
-   **Solusi**: Pair programming, code review sessions, documentation

**c. Resource Allocation**

-   **Masalah**: Implementasi DevOps membutuhkan waktu dan resources
-   **Tantangan**: Balancing feature development, budget, prioritization
-   **Solusi**: Phased approach, ROI calculation, open source tools

#### 4.3.3. Tantangan Operasional

**a. Monitoring Complexity**

-   **Masalah**: Multiple services menghasilkan banyak metrics dan logs
-   **Tantangan**: Log aggregation, alert fatigue, cost management
-   **Solusi**: Centralized logging (ELK Stack), smart alerting, dashboards

**b. Testing Strategy**

-   **Masalah**: Comprehensive testing untuk multi-stack application
-   **Tantangan**: Unit testing, integration testing, test data management
-   **Solusi**: Test pyramid strategy, automated testing in CI, test environments

**c. Deployment Complexity**

-   **Masalah**: Deployment melibatkan multiple services
-   **Tantangan**: Deployment order, service dependencies, rollback strategy
-   **Solusi**: Deployment orchestration tools, feature flags, canary deployment

#### 4.3.4. Tantangan Keamanan

**a. Security in CI/CD**

-   **Masalah**: Security vulnerabilities dalam dependencies dan code
-   **Tantangan**: Dependency scanning, secrets exposure, container security
-   **Solusi**: Automated security scanning, secrets management, container image scanning

**b. Compliance**

-   **Masalah**: Memenuhi standar keamanan dan compliance
-   **Tantangan**: Data protection, audit trails, access control
-   **Solusi**: Compliance automation, audit logging, RBAC, data encryption

### 4.4. Tabel Rencana Implementasi DevOps

```
|-------------------------------------------------------------------------------------------|
| No | Aspek DevOps          | Tools yang Dipilih              | Keterangan                |
|-------------------------------------------------------------------------------------------|
| 1  | Version Control       | Git, GitHub, GitLab             | Source code management   |
|-------------------------------------------------------------------------------------------|
| 2  | CI/CD                 | GitHub Actions, GitLab CI        | Automation pipeline       |
|-------------------------------------------------------------------------------------------|
| 3  | Containerization      | Docker, Docker Compose           | Application packaging      |
|-------------------------------------------------------------------------------------------|
| 4  | Orchestration         | Kubernetes, Docker Swarm         | Container orchestration   |
|-------------------------------------------------------------------------------------------|
| 5  | Infrastructure as Code| Terraform, Ansible               | Infrastructure automation |
|-------------------------------------------------------------------------------------------|
| 6  | Monitoring             | Prometheus, Grafana              | Metrics & visualization   |
|-------------------------------------------------------------------------------------------|
| 7  | Logging                | ELK Stack, Loki                  | Log aggregation           |
|-------------------------------------------------------------------------------------------|
| 8  | Testing                | PHPUnit, Jest, Selenium          | Automated testing         |
|-------------------------------------------------------------------------------------------|
| 9  | Security               | Snyk, OWASP ZAP, SonarQube       | Security scanning         |
|-------------------------------------------------------------------------------------------|
| 10 | Documentation           | Swagger, Postman                 | API documentation         |
|-------------------------------------------------------------------------------------------|
```

### 4.5. Tabel Tantangan dan Solusi

```
|--------------------------------------------------------------------------------------------------------|
| No | Kategori Tantangan    | Tantangan                                  | Solusi                      |
|--------------------------------------------------------------------------------------------------------|
| 1  | Teknis                | Multi-stack architecture                   | Docker containerization    |
|--------------------------------------------------------------------------------------------------------|
| 2  | Teknis                | OCR service integration                    | API Gateway pattern        |
|--------------------------------------------------------------------------------------------------------|
| 3  | Teknis                | Database migration                         | Blue-green deployment      |
|--------------------------------------------------------------------------------------------------------|
| 4  | Teknis                | Environment management                     | Infrastructure as Code     |
|--------------------------------------------------------------------------------------------------------|
| 5  | Organisasi            | Cultural change                            | Training & workshop        |
|--------------------------------------------------------------------------------------------------------|
| 6  | Organisasi            | Skill gap                                  | Pair programming           |
|--------------------------------------------------------------------------------------------------------|
| 7  | Organisasi            | Resource allocation                        | Phased approach            |
|--------------------------------------------------------------------------------------------------------|
| 8  | Operasional           | Monitoring complexity                      | Centralized logging        |
|--------------------------------------------------------------------------------------------------------|
| 9  | Operasional           | Testing strategy                           | Test pyramid strategy      |
|--------------------------------------------------------------------------------------------------------|
| 10 | Operasional           | Deployment complexity                      | Deployment orchestration   |
|--------------------------------------------------------------------------------------------------------|
| 11 | Keamanan              | Security in CI/CD                          | Automated security scan    |
|--------------------------------------------------------------------------------------------------------|
| 12 | Keamanan              | Compliance                                 | Compliance automation      |
|--------------------------------------------------------------------------------------------------------|
```

### 4.6. Roadmap Implementasi DevOps

```
|--------------------------------------------------------------------------------------------------------|
| Phase | Waktu          | Aktivitas                                                                    |
|--------------------------------------------------------------------------------------------------------|
| 1     | Bulan 1-2      | Setup version control, basic CI pipeline, Docker environment, unit tests  |
|--------------------------------------------------------------------------------------------------------|
| 2     | Bulan 3-4      | Complete CI pipeline, staging environment, CD pipeline, migration strategy |
|--------------------------------------------------------------------------------------------------------|
| 3     | Bulan 5-6      | Infrastructure as Code, production environment, load balancing, backup     |
|--------------------------------------------------------------------------------------------------------|
| 4     | Bulan 7-8      | Monitoring & logging, performance optimization, security hardening         |
|--------------------------------------------------------------------------------------------------------|
```

---

## 5. Kesimpulan

### 5.1. Manfaat DevOps untuk Manajer Proyek Sistem Informasi

Pemahaman tentang DevOps sangat penting bagi Manajer Proyek Sistem Informasi karena:

**1. Peningkatan Kecepatan Delivery**

-   Continuous Integration dan Continuous Deployment memungkinkan release yang lebih cepat
-   Automation mengurangi manual work dan human error
-   **Hasil**: Time-to-market lebih cepat

**2. Peningkatan Kualitas Perangkat Lunak**

-   Automated Testing memastikan setiap perubahan code diuji sebelum deployment
-   Code Quality Tools memastikan code quality standards
-   **Hasil**: Reduced bugs in production, higher customer satisfaction

**3. Visibilitas dan Transparansi**

-   Monitoring dan Logging memberikan real-time visibility
-   Metrics dan Dashboards membantu tracking progress
-   **Hasil**: Better decision making, proactive issue resolution

**4. Risk Management**

-   Automated Rollback mechanisms mengurangi risiko failed deployments
-   Blue-Green Deployment memungkinkan zero-downtime
-   **Hasil**: Reduced downtime, better business continuity

**5. Cost Optimization**

-   Resource Optimization melalui auto-scaling
-   Reduced Manual Work mengurangi operational costs
-   **Hasil**: Lower operational costs, better ROI

**6. Team Collaboration**

-   Shared Responsibility antara Development dan Operations
-   Better Communication melalui shared tools
-   **Hasil**: Improved team productivity

**7. Scalability dan Flexibility**

-   Cloud Infrastructure memungkinkan easy scaling
-   Containerization memungkinkan consistent deployments
-   **Hasil**: System dapat scale sesuai kebutuhan bisnis

### 5.2. Peran Manajer Proyek dalam DevOps

Sebagai Manajer Proyek Sistem Informasi, peran dalam DevOps implementation meliputi:

1. **Strategic Planning**: Merencanakan roadmap DevOps yang align dengan business goals
2. **Resource Management**: Mengalokasikan resources untuk DevOps initiatives
3. **Stakeholder Communication**: Mengkomunikasikan benefits DevOps ke stakeholders
4. **Risk Management**: Mengidentifikasi dan mitigate risks dalam DevOps
5. **Team Coordination**: Memastikan collaboration antara Dev dan Ops teams
6. **Metrics Tracking**: Tracking KPIs seperti deployment frequency, lead time, MTTR
7. **Continuous Improvement**: Mendorong continuous improvement dalam processes

### 5.3. Kesimpulan Akhir

Implementasi DevOps pada **Sistem Inventory Management Angkringan** akan memberikan manfaat dalam:

-   **Kecepatan**: Delivery perangkat lunak yang lebih cepat melalui automation
-   **Kualitas**: Perangkat lunak yang lebih berkualitas melalui automated testing
-   **Reliability**: Sistem yang lebih reliable melalui monitoring dan logging
-   **Efficiency**: Operasional yang lebih efisien melalui automation
-   **Collaboration**: Kolaborasi yang lebih baik antara development dan operations

Dengan pemahaman yang baik tentang DevOps, Manajer Proyek Sistem Informasi dapat:

1. Merencanakan delivery perangkat lunak dengan lebih efektif
2. Mengelola risiko dengan lebih baik
3. Mengoptimalkan resources
4. Meningkatkan kualitas perangkat lunak
5. Mengakselerasi time-to-market

DevOps bukan hanya tentang tools dan teknologi, tetapi juga tentang **culture, processes, dan people**. Dengan mengadopsi prinsip-prinsip DevOps, tim dapat bekerja lebih efektif dan menghasilkan perangkat lunak yang lebih berkualitas.

---

## Lampiran

### A. Tabel Tools DevOps

```
|-------------------------------------------------------------------------------------------|
| Kategori              | Tools                           | Keterangan                   |
|-------------------------------------------------------------------------------------------|
| Version Control       | Git, GitHub, GitLab             | Source code management       |
|-------------------------------------------------------------------------------------------|
| CI/CD                 | GitHub Actions, GitLab CI, Jenkins | Automation pipeline        |
|-------------------------------------------------------------------------------------------|
| Containerization      | Docker, Docker Compose           | Application packaging        |
|-------------------------------------------------------------------------------------------|
| Orchestration         | Kubernetes, Docker Swarm         | Container orchestration      |
|-------------------------------------------------------------------------------------------|
| Infrastructure as Code| Terraform, Ansible               | Infrastructure automation     |
|-------------------------------------------------------------------------------------------|
| Monitoring            | Prometheus, Grafana              | Metrics & visualization       |
|-------------------------------------------------------------------------------------------|
| Logging               | ELK Stack, Loki                  | Log aggregation              |
|-------------------------------------------------------------------------------------------|
| Testing               | PHPUnit, Jest, Selenium          | Automated testing            |
|-------------------------------------------------------------------------------------------|
| Security              | Snyk, OWASP ZAP, SonarQube       | Security scanning            |
|-------------------------------------------------------------------------------------------|
| Documentation         | Swagger, Postman                 | API documentation            |
|-------------------------------------------------------------------------------------------|
```

### B. Referensi

1. Kim, G., Humble, J., Debois, P., & Willis, J. (2016). _The DevOps Handbook_.
2. Bass, L., Weber, I., & Zhu, L. (2015). _DevOps: A Software Architect's Perspective_.
3. Humble, J., & Farley, D. (2010). _Continuous Delivery_.

---

**Catatan**: Dokumen ini dibuat berdasarkan analisis sistem **Angkringan IMS** dan best practices DevOps.
