# Sticky Notes

A containerized web application for creating and managing personal sticky notes. Built with Node.js, Express, PostgreSQL (via Sequelize), Docker, Kubernetes (Helm), and CI/CD on AWS.

## Features

* User registration & authentication (JWT-based)
* CRUD operations for sticky notes (each user only accesses their own notes)
* Local development with Postgres
* Containerized with Docker
* Kubernetes deployment via Helm chart
* CI/CD pipeline (GitHub Actions) that:

  * Runs tests against a Postgres service
  * Builds & pushes Docker images to AWS ECR
  * Deploys to AWS EKS via Helm

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Running with Docker](#running-with-docker)
4. [Kubernetes Deployment (Helm)](#kubernetes-deployment-helm)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Testing](#testing)
7. [Configuration](#configuration)
8. [License](#license)

## Prerequisites

* Node.js v18
* Docker
* PostgreSQL (for local dev) or Docker
* kubectl, Helm (for Kubernetes)
* AWS CLI, `eksctl` (for EKS)
* GitHub account with repository secrets configured

## Local Development

1. Clone the repo:

   ```bash
   git clone https://github.com/<YOUR_USERNAME>/sticky-notes.git
   cd sticky-notes
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start a local Postgres instance (via Docker):

   ```bash
   docker run --name sticky-postgres -e POSTGRES_DB=sticky_dev \
     -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
   ```

4. Configure environment variables (create a `.env` file):

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sticky_dev
   DB_USER=postgres
   DB_PASS=postgres
   JWT_SECRET=your_jwt_secret
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

## Running with Docker

1. Build the image:

   ```bash
   docker build -t sticky-notes:latest .
   ```

2. Run a container:

   ```bash
   docker run -d \
     --name sticky-notes \
     --link sticky-postgres:postgres \
     -e DB_HOST=postgres -e DB_PORT=5432 \
     -e DB_NAME=sticky_dev -e DB_USER=postgres \
     -e DB_PASS=postgres -e JWT_SECRET=your_jwt_secret \
     -p 3000:3000 sticky-notes:latest
   ```

## Kubernetes Deployment (Helm)

1. Ensure your cluster is running and `kubectl` is configured.
2. Deploy Postgres in-cluster:

   ```bash
   kubectl apply -f postgres.yaml
   ```
3. Deploy the app chart:

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
4. Port-forward to test locally:

   ```bash
   kubectl port-forward svc/sticky-notes-sticky-notes-chart 3000:3000
   ```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) performs:

1. **Tests**: Spins up a Postgres service and runs Jest.
2. **Build & Push**: Builds Docker image, ensures ECR repo exists, logs in, and pushes.
3. **Deploy**: Updates EKS kubeconfig and deploys via Helm.

Add these Actions secrets in your GitHub repo:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_REGION`
* `ECR_REGISTRY`
* `ECR_REPOSITORY`
* `EKS_CLUSTER_NAME`
* `JWT_SECRET`

## Testing

* Run unit & integration tests:

  ```bash
  npm test
  ```

## Configuration

All configuration is driven by environment variables or Helm `--set` flags:

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
