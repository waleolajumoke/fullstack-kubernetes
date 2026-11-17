# Tech365 Full-Stack Kubernetes Classroom Lab

React + Node.js Express + PostgreSQL, deployed into a single Minikube cluster.

## Prerequisites

Ubuntu with Docker, Minikube and kubectl installed. Suggested: 4 CPUs and 8GB RAM.

## Run

From the project root:

```bash
minikube start --driver=docker --cpus=3 --memory=5120
minikube image build -t tech365-backend:v1 ./backend
minikube image build -t tech365-frontend:v1 ./frontend
kubectl apply -f k8s/01-namespace.yaml
kubectl apply -f k8s/02-secret.yaml
kubectl apply -f k8s/03-postgres.yaml
kubectl -n tech365 rollout status deployment/postgres --timeout=180s
kubectl apply -f k8s/04-backend.yaml
kubectl -n tech365 rollout status deployment/backend --timeout=180s
kubectl apply -f k8s/05-frontend.yaml
kubectl -n tech365 rollout status deployment/frontend --timeout=180s
kubectl -n tech365 port-forward svc/frontend 8080:80
```

Open http://localhost:8080 in a browser running on the Ubuntu host. If Ubuntu is a remote cloud server, use SSH port forwarding from your laptop:

```bash
ssh -L 8080:localhost:8080 USER@SERVER_IP
```

Then open http://localhost:8080 on the laptop.

Check resources with `kubectl get all -n tech365` and the PVC with `kubectl get pvc -n tech365`.

## Architecture

Browser -> Frontend nginx on port 80 -> `/api/` -> backend ClusterIP Service port 3000 -> PostgreSQL ClusterIP Service port 5432 -> PVC.

## Important limitations

This is a teaching demo, **not** a production-grade PostgreSQL installation. For production, prefer a managed database or correctly configured StatefulSet with backups, high availability, TLS, non-default secrets, network policies, and access controls. The manifest contains an intentionally visible demo-only password. Do not commit live credentials. The UI is exposed only via local port forwarding.
