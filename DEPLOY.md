# Production deploy (travel)

Same flow as pixel-dashboard-admin: GitHub Actions builds a Docker image and pushes it to Docker Hub. This app is a Next.js server with Prisma, so the container runs Node instead of nginx.

## Environment variables

These are read when the container **starts**. They are not baked into the image.

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:/data/app.db` | SQLite file. Keep this path so the `/data` volume holds the database. |
| `APP_ENV` | `prod` | Cloudinary folder: `local`, `dev`, or `prod`. |
| `IMAGE_UPLOAD_DRIVER` | `cloudinary` | `cloudinary` or `local`. |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloud` | Cloudinary credentials. Or set the three variables below. |
| `CLOUDINARY_CLOUD_NAME` | | Used when `CLOUDINARY_URL` is unset. |
| `CLOUDINARY_API_KEY` | | Used when `CLOUDINARY_URL` is unset. |
| `CLOUDINARY_API_SECRET` | | Used when `CLOUDINARY_URL` is unset. |

Copy `.env.example` to `.env` for local dev. On the server, use a separate env file and set `DATABASE_URL=file:/data/app.db`.

Set GitHub repo secrets `DOCKER_HUB_USERNAME` and `DOCKER_HUB_ACCESS_TOKEN` for `.github/workflows/deploy-prod.yml` (push to `main`) and `.github/workflows/deploy.yml` (push to `development`). Both publish `DOCKER_HUB_USERNAME/travel:latest`.

## Docker build

```bash
docker build -t travel:latest .
```

`.dockerignore` excludes `.env`, `node_modules`, and local SQLite files.

## Run

Map host port 80 to the app port 3000, and keep the database on a named volume.

```bash
docker run -d --name travel --restart unless-stopped \
  -p 80:3000 \
  --env-file .env \
  -v travel-data:/data \
  travel:latest
```

On start, the container runs `prisma migrate deploy`, then `node server.js`.

After a Docker Hub push, on the server:

```bash
docker pull DOCKER_HUB_USERNAME/travel:latest
docker stop travel && docker rm travel
docker run -d --name travel --restart unless-stopped \
  -p 80:3000 \
  --env-file /path/to/.env \
  -v travel-data:/data \
  DOCKER_HUB_USERNAME/travel:latest
```

`local` image uploads are written under `/app/public/uploads` inside the container. Use `IMAGE_UPLOAD_DRIVER=cloudinary` in production so uploads survive a new container.
