## 生产部署（PM2 + Nginx）

### 前置要求

- Node.js ≥ 20（推荐 20 LTS）, 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 node 版本。
- 全局安装 PM2：`npm i -g pm2`
- 服务器已安装并启用 Nginx
- 确认后端地址用于 `NEXT_PUBLIC_API_BASE`

### 构建

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_BASE=https://api.example.com npm run build
```

### 使用 PM2 启动

```bash
# 假设占用端口 18880，如需更换端口请同步修改 Nginx 配置
pm2 start npm --name "playable-frontend" -- start -- -p 18880
pm2 save
```

### 配置 Nginx（反向代理到 127.0.0.1:18880）

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:18880;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

应用配置：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 更新流程（零停机）

```bash
cd frontend
git pull
npm ci
NEXT_PUBLIC_API_BASE=https://api.example.com npm run build
pm2 reload playable-frontend
```

### 备注

- 变更 `NEXT_PUBLIC_API_BASE` 需重新构建后再 `pm2 reload`
- 若更换端口，需同时更新 Nginx 的 `proxy_pass`
