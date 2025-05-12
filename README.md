# Sticky Notes

A containerized web application for creating and managing personal sticky notes. Built with Node.js, Express, PostgreSQL (Sequelize), Docker, Kubernetes (Helm), and automated CI/CD on AWS.

## Features

* User registration & JWT-based authentication
* CRUD operations for sticky notes (user-specific)
* Configurable rate limiting on API routes
* Local development with Dockerized Postgres
* Containerized application via Docker
* Kubernetes deployment with Helm chart
* CI/CD pipeline that tests, builds, and deploys to AWS EKS

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)

   * [Setup](#setup)
   * [Running the App](#running-the-app)
   * [Testing](#testing)
3. [API Usage](#api-usage)
4. [Running with Docker](#running-with-docker)
5. [Kubernetes Deployment (Helm)](#kubernetes-deployment-helm)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Configuration](#configuration)
8. [License](#license)

## Prerequisites

* Node.js v18
* Docker
* Kubernetes CLI (`kubectl`) and Helm (for K8s deployments)
* AWS CLI and `eksctl` (for AWS EKS)
* Git and GitHub repository with Actions secrets configured

## Local Development

### Setup

1. Clone the repo:

   ```bash
   git clone https://github.com/<YOUR_USERNAME>/sticky-notes.git
   cd sticky-notes
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start a local Postgres via Docker:

   ```bash
   docker run --name sticky-postgres -e POSTGRES_DB=sticky_dev \
     -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
   ```
4. Create a `.env` file in project root:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sticky_dev
   DB_USER=postgres
   DB_PASS=postgres
   JWT_SECRET=your_jwt_secret
   ```

### Running the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Testing

Run unit and integration tests against the local Postgres:

```bash
npm test
```

## API Usage

Interact with the API using `curl` or any HTTP client:

1. **Register** a user:

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"alice","password":"secret"}'
   ```
2. **Login** to obtain a JWT:

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"alice","password":"secret"}'
   ```

   Response:

   ```json
   { "token": "<YOUR_JWT_TOKEN>" }
   ```
3. **Create** a note:

   ```bash
   curl -X POST http://localhost:3000/api/notes \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Hello","content":"World"}'
   ```
4. **List** notes:

   ```bash
   curl -X GET http://localhost:3000/api/notes \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
   ```
5. **Update** a note:

   ```bash
   curl -X PUT http://localhost:3000/api/notes/<NOTE_ID> \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Updated","content":"Changed"}'
   ```
6. **Delete** a note:

   ```bash
   curl -X DELETE http://localhost:3000/api/notes/<NOTE_ID> \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
   ```

## Running with Docker

1. Build the Docker image:

   ```bash
   docker build -t sticky-notes:latest .
   ```
2. Run the container (link to local Postgres):

   ```bash
   docker run -d --name sticky-notes \
     --link sticky-postgres:postgres \
     -e DB_HOST=postgres -e DB_PORT=5432 \
     -e DB_NAME=sticky_dev -e DB_USER=postgres \
     -e DB_PASS=postgres -e JWT_SECRET=your_jwt_secret \
     -p 3000:3000 sticky-notes:latest
   ```

## Kubernetes Deployment (Helm)

1. Ensure your cluster is up and `kubectl` is configured.
2. Deploy Postgres:

   ```bash
   kubectl apply -f postgres.yaml
   ```
3. Deploy the chart:

   ```bash
   helm upgrade --install sticky-notes ./sticky-notes-chart \
     --namespace default \
     --set env.dbHost=postgres \
     --set env.dbPort=5432 \
     --set env.dbName=sticky_dev \
     --set env.dbUser=postgres \
     --set env.dbPass=postgres \
     --set env.jwtSecret=your_jwt_secret \
     --set image.repository=<ECR_REGISTRY>/<ECR_REPO> \
     --set image.tag=<IMAGE_TAG>
   ```
4. Port-forward:

   ```bash
   kubectl port-forward svc/sticky-notes-sticky-notes-chart 3000:3000
   ```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) performs:

1. **Tests**: Spins up Postgres service & runs Jest.
2. **Build & Push**: Builds Docker image, ensures ECR repo exists, pushes to ECR.
3. **Deploy**: Updates kubeconfig and deploys via Helm.

Add these secrets in GitHub repo settings:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_REGION`
* `ECR_REGISTRY`
* `ECR_REPOSITORY`
* `EKS_CLUSTER_NAME`
* `JWT_SECRET`

## Configuration

Environment variables or Helm `--set` flags:

| Variable/Flag           | Description                 | Default      |
| ----------------------- | --------------------------- | ------------ |
| `DB_HOST`               | PostgreSQL host             | `localhost`  |
| `DB_PORT`               | PostgreSQL port             | `5432`       |
| `DB_NAME`               | Database name               | `sticky_dev` |
| `DB_USER`               | Database user               | `postgres`   |
| `DB_PASS`               | Database password           | `postgres`   |
| `JWT_SECRET`            | Secret for signing JWTs     | **required** |
| `image.repository`      | Docker image repo           | **required** |
| `image.tag`             | Docker image tag            | **required** |
| `serviceAccount.create` | Create a K8s ServiceAccount | `false`      |
| `ingress.enabled`       | Enable ingress              | `false`      |
| `autoscaling.enabled`   | Enable HPA                  | `false`      |