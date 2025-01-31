npm run build
docker build -t ashfn0/vite-static .
docker tag ashfn0/vite-static ashfn0/vite-static:latest
docker push ashfn0/vite-static:latest