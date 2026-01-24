# 本地开发服务器使用指南

本项目提供两种本地开发服务器方案：**Node.js** 和 **Python**，都支持实时预览和文件监听。

## 方案一：Node.js (推荐)

### 技术栈
- **live-server**: 轻量级开发服务器，内置实时刷新功能
- **Node.js**: JavaScript运行时环境

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
npm run dev
```

### 功能特性
✅ 自动打开浏览器到 http://localhost:3000
✅ 监听 pages/ 目录下所有文件变化
✅ 自动刷新浏览器（500ms延迟，防止频繁刷新）
✅ 支持 CORS 跨域请求
✅ 支持所有静态文件类型（HTML/CSS/JS/图片/字体等）
✅ 优雅的日志输出

### 自定义配置

可以在 `package.json` 中修改启动参数：

```json
"scripts": {
  "dev": "live-server pages --port=3000 --host=0.0.0.0 --open=/index.html --watch=pages --wait=500"
}
```

参数说明：
- `--port=3000`: 指定端口号
- `--host=0.0.0.0`: 监听所有网络接口
- `--open=/index.html`: 自动打开浏览器
- `--watch=pages`: 监听 pages 目录
- `--wait=500`: 文件变化后等待500ms再刷新

---

## 方案二：Python

### 技术栈
- **http.server**: Python内置HTTP服务器
- **watchdog**: 文件系统监控库
- **pathlib**: 现代化的文件路径处理

### 安装依赖

```bash
pip install -r requirements.txt
```

或直接安装：

```bash
pip install watchdog
```

### 启动服务器

```bash
python start-dev.py
```

### 功能特性
✅ 自动打开浏览器到 http://localhost:3000
✅ 使用 watchdog 监控文件系统变化
✅ 支持 CORS 跨域请求
✅ 自定义 MIME 类型支持
✅ 优雅的控制台日志输出
✅ Ctrl+C 优雅退出

---

## 服务器启动输出示例

```
========================================
  ImageAI Pro Development Server
========================================

Server running at:
  → Local:   http://localhost:3000
  → Network: http://0.0.0.0:3000

Serving files from: pages/

Press Ctrl+C to stop the server

========================================

Server started successfully!
```

## 实时预览工作原理

1. **文件监听**: 服务器监控 `pages/` 目录下的所有文件
2. **变化检测**: 当保存 HTML、CSS 或 JS 文件时，服务器检测到变化
3. **自动刷新**: 浏览器通过 WebSocket 或轮询检测到变化后自动刷新
4. **实时预览**: 修改立即生效，无需手动刷新浏览器

## 开发工作流

1. 启动开发服务器（Node.js 或 Python）
2. 浏览器自动打开到 http://localhost:3000
3. 修改 `pages/index.html` 或其他文件
4. 保存文件
5. 浏览器自动刷新显示最新更改

## 常见问题

### Q: 端口 3000 被占用怎么办？

**Node.js**: 修改 `package.json` 中的 `--port` 参数
**Python**: 修改 `start-dev.py` 中的 `PORT` 变量

### Q: 如何禁用自动打开浏览器？

**Node.js**: 移除 `--open=/index.html` 参数
**Python**: 注释掉 `webbrowser.open(browser_url)` 行

### Q: 如何调整文件变化后的刷新延迟？

**Node.js**: 修改 `--wait` 参数（单位：毫秒）
**Python**: Python方案使用默认延迟，如需自定义可修改 watchdog 配置

### Q: 服务器监听哪些文件？

默认监听 `pages/` 目录下的所有文件，包括：
- HTML 文件
- CSS 文件
- JavaScript 文件
- 图片文件
- 字体文件
- 其他静态资源

### Q: 支持 HTTPS 吗？

默认不支持 HTTPS。如需 HTTPS，可以：
1. 使用反向代理（如 Nginx）
2. 使用 SSL 代理工具（如 Caddy）
3. 配置 Cloudflare Workers（生产环境推荐）

## 推荐使用场景

### Node.js 方案适合：
- 已有 Node.js 环境
- 需要简单快速的设置
- 前端开发为主
- 需要丰富的配置选项

### Python 方案适合：
- Python 开发者
- 需要更灵活的定制
- 想要完全控制服务器行为
- 需要集成其他 Python 工具

## 性能对比

| 特性 | Node.js (live-server) | Python |
|------|----------------------|--------|
| 启动速度 | 快 | 快 |
| 内存占用 | ~50MB | ~30MB |
| 文件监听 | 内置 | 使用 watchdog |
| 浏览器刷新 | WebSocket | 轮询 |
| 配置灵活性 | 中等 | 高 |
| 学习曲线 | 简单 | 中等 |

## 生产环境部署

开发服务器仅用于本地开发，生产环境请使用：

1. **Cloudflare Pages** (推荐本项目)
   ```bash
   wrangler pages deploy pages
   ```

2. **Nginx/Apache**
   ```bash
   # 配置反向代理到静态文件目录
   ```

3. **Vercel/Netlify**
   - 直接连接 Git 仓库
   - 自动部署

---

## 快速开始

### 最快启动方式（Node.js）

```bash
npm install
npm run dev
```

### 最快启动方式（Python）

```bash
pip install watchdog
python start-dev.py
```

🚀 服务器启动后，浏览器会自动打开 http://localhost:3000
