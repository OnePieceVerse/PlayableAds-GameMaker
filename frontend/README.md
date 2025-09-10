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
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run build
```

### 使用 PM2 启动
使用 `ecosystem.config.js`（推荐，便于统一管理与开机自启）， 在 frontend 目录下创建：

```js
module.exports = {
  apps: [
    {
      name: "playableall-game-maker-frontend",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 18880",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_BASE: "http://localhost:8000"
      },
      max_memory_restart: "512M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true
    }
  ]
};
```

启动与自启：

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 status
pm2 save
pm2 startup  # 按提示执行命令配置系统开机自启
```

### 配置 Nginx（反向代理到 127.0.0.1:18880）

```nginx
server {
  listen 8080;
  server_name playableall-game.woa.com;

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
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run build
pm2 reload playableall-game-maker-frontend
```

### 备注

- 变更 `NEXT_PUBLIC_API_BASE` 需重新构建后再 `pm2 reload`
- 若更换端口，需同时更新 Nginx 的 `proxy_pass`
