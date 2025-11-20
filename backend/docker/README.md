# MzeeChakula Backend API - Docker Deployment Guide

This directory contains Docker configuration files for deploying the MzeeChakula Backend API.

## Files

- `Dockerfile` - Multi-stage production-ready Docker image
- `docker-compose.yml` - Docker Compose configuration for easy deployment
- `.dockerignore` - Files to exclude from Docker build context
- `README.md` - This file

## Quick Start

### Local Testing with Docker Compose

```bash
# From the backend/docker directory
cd backend/docker

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

The API will be available at `http://localhost:8000`

### Building the Docker Image

```bash
# From project root
docker build -f backend/docker/Dockerfile -t mzeechakula-api:latest .

# Or with a specific tag
docker build -f backend/docker/Dockerfile -t mzeechakula-api:v1.0.0 .
```

### Running the Container

```bash
# Basic run
docker run -d \
  --name mzeechakula-api \
  -p 8000:8000 \
  mzeechakula-api:latest

# With environment variables
docker run -d \
  --name mzeechakula-api \
  -p 8000:8000 \
  -e MODEL_DIR=/app/models \
  -e PORT=8000 \
  mzeechakula-api:latest

# With mounted volumes (for logs)
docker run -d \
  --name mzeechakula-api \
  -p 8000:8000 \
  -v $(pwd)/logs:/app/logs \
  mzeechakula-api:latest
```

## VPS Deployment

### Prerequisites

1. VPS with Docker installed
2. At least 2GB RAM
3. Port 8000 open (or configure reverse proxy)

### Deployment Steps

#### 1. Transfer Image to VPS

Option A: Build on VPS

```bash
# Clone repository on VPS
git clone <your-repo-url>
cd Graph-Enhanced-LLMs-for-Locally-Sourced-Elderly-Nutrition-Planning-in-Uganda

# Build image
docker build -f backend/docker/Dockerfile -t mzeechakula-api:latest .
```

Option B: Push to Registry and Pull

```bash
# On local machine - Tag and push to Docker Hub
docker tag mzeechakula-api:latest yourusername/mzeechakula-api:latest
docker push yourusername/mzeechakula-api:latest

# On VPS - Pull the image
docker pull yourusername/mzeechakula-api:latest
```

Option C: Save and Transfer

```bash
# On local machine - Save image to tar
docker save mzeechakula-api:latest | gzip > mzeechakula-api.tar.gz

# Transfer to VPS
scp mzeechakula-api.tar.gz user@your-vps-ip:/home/user/

# On VPS - Load image
gunzip -c mzeechakula-api.tar.gz | docker load
```

#### 2. Run on VPS

Using Docker Compose (Recommended)

```bash
# Copy docker-compose.yml to VPS
scp backend/docker/docker-compose.yml user@your-vps-ip:/home/user/

# On VPS
cd /home/user
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f api
```

Using Docker Run

```bash
docker run -d \
  --name mzeechakula-api \
  --restart unless-stopped \
  -p 8000:8000 \
  mzeechakula-api:latest
```

#### 3. Configure Reverse Proxy (Optional but Recommended)

Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name api.mzeechakula.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.mzeechakula.com
```

### 4. Verify Deployment

```bash
# Health check
curl http://your-vps-ip:8000/health

# Or with domain
curl https://api.mzeechakula.com/health

# API documentation
curl http://your-vps-ip:8000/docs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_DIR` | `/app/models` | Directory containing model files |
| `PORT` | `8000` | Port to run the API on |
| `PYTHONUNBUFFERED` | `1` | Disable Python output buffering |

## Docker Image Details

- **Base Image**: Python 3.12-slim
- **Multi-stage Build**: Yes (reduces image size)
- **Non-root User**: Yes (security best practice)
- **Health Check**: Built-in
- **Image Size**: ~800MB (optimized)

## Monitoring & Maintenance

### View Logs

```bash
# Docker Compose
docker-compose logs -f api

# Docker
docker logs -f mzeechakula-api
```

### Check Health

```bash
# Container health status
docker ps

# API health endpoint
curl http://localhost:8000/health
```

### Restart Service

```bash
# Docker Compose
docker-compose restart api

# Docker
docker restart mzeechakula-api
```

### Update Deployment

```bash
# Pull latest image
docker pull yourusername/mzeechakula-api:latest

# Stop old container
docker-compose down

# Start with new image
docker-compose up -d
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs mzeechakula-api

# Inspect container
docker inspect mzeechakula-api
```

### Model loading errors

- Ensure model files are present in `src/results/models/`
- Check file permissions (models should be readable)
- Verify MODEL_DIR environment variable

### Connection refused

- Check if container is running: `docker ps`
- Verify port mapping: `-p 8000:8000`
- Check firewall rules on VPS
- Ensure port 8000 is not already in use

### High memory usage

- Reduce number of workers in CMD (default is 2)
- Consider using gunicorn with fewer workers
- Monitor with: `docker stats mzeechakula-api`

## Production Checklist

- [ ] Models are included in image or mounted as volume
- [ ] Environment variables configured
- [ ] HTTPS enabled with valid certificate
- [ ] Firewall configured properly
- [ ] Health checks working
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Monitoring set up (optional: Prometheus, Grafana)
- [ ] Auto-restart enabled (`--restart unless-stopped`)

## API Endpoints

Once deployed, the following endpoints are available:

- `GET /health` - Health check
- `GET /health/models` - Model status
- `GET /health/encoding` - Encoding reference
- `POST /predict/` - Single prediction
- `POST /predict/batch` - Batch predictions
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative API documentation

## Support

For issues or questions:

- Check logs: `docker logs mzeechakula-api`
- Review API docs: `http://your-server:8000/docs`
- GitHub Issues: [Your repository link]

## License

[Your License]
