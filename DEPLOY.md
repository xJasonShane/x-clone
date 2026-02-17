# Cloudflare Pages 部署指南

本项目可以部署到 Cloudflare Pages。以下是详细的部署步骤。

## 前置要求

1. 一个 GitHub 账号
2. 一个 Cloudflare 账号
3. 一个 Supabase 项目（已创建表结构）

## 部署步骤

### 1. 准备 GitHub 仓库

将项目推送到 GitHub 仓库：

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 GitHub
git push -u origin main
```

### 2. 在 Cloudflare Dashboard 创建项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权 GitHub 并选择你的仓库
5. 配置构建设置：
   - **Production branch**: `main`
   - **Build command**: `pnpm run pages:build`
   - **Build output directory**: `.vercel/output/static`
6. 点击 **Save and Deploy**

### 3. 配置环境变量

在 Cloudflare Dashboard 中配置环境变量：

1. 进入项目 → **Settings** → **Environment variables**
2. 添加以下变量：

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL（如 `https://xxx.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥（在 Supabase Dashboard → Settings → API 中获取） |

1. 选择 **Production** 和 **Preview** 环境
2. 点击 **Save**

### 4. 重新部署

配置环境变量后，需要重新触发部署：

- 方法1：在 Cloudflare Dashboard → Deployments 中点击 **Retry deployment**
- 方法2：推送新的 commit 到 GitHub

## 本地预览 Cloudflare 环境

```bash
# 安装依赖
pnpm install

# 构建
pnpm run pages:build

# 本地预览
pnpm run pages:dev
```

## 注意事项

### 1. 环境变量命名

Cloudflare Pages 要求客户端可访问的环境变量使用 `NEXT_PUBLIC_` 前缀。

### 2. 数据库配置

确保 Supabase 项目已正确配置：

- 表结构已创建
- Row Level Security (RLS) 已正确设置
- 允许来自 Cloudflare IP 的连接

### 3. 图片优化

由于 Cloudflare Pages 的限制，图片优化功能已禁用（`unoptimized: true`）。如需图片优化，可以使用 Cloudflare Images 服务。

### 4. API 路由

所有 API 路由都会自动适配 Cloudflare Workers 运行时。无需额外配置。

## 自定义域名

1. 在 Cloudflare Dashboard → Pages 项目 → **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名并验证
4. 更新 DNS 记录指向 Cloudflare

## 常见问题

### 构建失败

检查构建日志，常见原因：

- 环境变量未配置
- 依赖安装失败
- TypeScript 错误

### 运行时错误

检查 Functions 日志：

- Cloudflare Dashboard → Pages 项目 → **Logs**

### 数据库连接问题

确保：

- Supabase URL 和密钥正确
- RLS 策略允许访问
- 网络连接正常
