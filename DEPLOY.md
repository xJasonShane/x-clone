# 部署指南

本项目支持多种部署方式，包括 Cloudflare Pages、Vercel 和 Docker。以下是详细的部署步骤。

## 📋 部署选项

### 1. Cloudflare Pages 部署

**优势**：免费、全球 CDN、支持边缘函数

#### 前置要求

- GitHub 账号
- Cloudflare 账号
- Supabase 项目（已创建表结构）

#### 部署步骤

##### 步骤 1：准备 GitHub 仓库

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

##### 步骤 2：创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 选择 **Connect to Git**
4. 授权 GitHub 并选择你的仓库
5. 配置构建设置：
   - **Production branch**: `main`
   - **Build command**: `pnpm run pages:build`
   - **Build output directory**: `.vercel/output/static`
6. 点击 **Save and Deploy**

##### 步骤 3：配置环境变量

1. 进入项目 → **Settings** → **Environment variables**
2. 添加以下变量：

| 变量名 | 说明 | 值示例 |
|--------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 长字符串密钥 |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | `https://xxx.storage.googleapis.com` |
| `COZE_BUCKET_NAME` | 存储桶名称 | `your-bucket-name` |

3. 选择 **Production** 和 **Preview** 环境
4. 点击 **Save**

##### 步骤 4：重新部署

配置环境变量后，需要重新触发部署：
- 方法1：在 Cloudflare Dashboard → Deployments 中点击 **Retry deployment**
- 方法2：推送新的 commit 到 GitHub

### 2. Vercel 部署

**优势**：与 Next.js 深度集成、一键部署

#### 部署步骤

1. 点击下方按钮：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/x-clone)

2. 配置环境变量（与 Cloudflare Pages 相同）
3. 点击 **Deploy**

### 3. Docker 部署

**优势**：完全控制运行环境、可部署到任何支持 Docker 的平台

#### 部署步骤

```bash
# 1. 构建镜像
docker build -t x-clone .

# 2. 运行容器
docker run -d \
  --name x-clone \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-supabase-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e COZE_BUCKET_ENDPOINT_URL=your-endpoint \
  -e COZE_BUCKET_NAME=your-bucket \
  x-clone

# 3. 访问应用
# 打开 http://localhost:3000
```

## 🌐 本地预览

### Cloudflare 环境预览

```bash
# 构建
pnpm run pages:build

# 本地预览
pnpm run pages:dev
```

### 标准开发预览

```bash
pnpm dev
```

## ⚙️ 配置说明

### 环境变量命名规范

- **客户端可访问变量**：使用 `NEXT_PUBLIC_` 前缀
- **服务器端变量**：无需前缀（仅在 API 路由中使用）

### Supabase 配置

确保 Supabase 项目已正确设置：

1. **表结构**：运行 `supabase-init.sql` 初始化表结构
2. **Row Level Security (RLS)**：为所有表启用 RLS 并配置适当的策略
3. **网络设置**：允许来自部署平台 IP 的连接

### 图片处理

- **Cloudflare Pages**：图片优化已禁用，建议使用 Cloudflare Images
- **Vercel**：支持自动图片优化
- **Docker**：可配置自定义图片处理服务

## 🎯 自定义域名

### Cloudflare Pages

1. 进入项目 → **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入域名并验证
4. 更新 DNS 记录指向 Cloudflare

### Vercel

1. 进入项目 → **Settings** → **Domains**
2. 添加你的域名
3. 按照提示更新 DNS 记录

## 🐛 常见问题

### 构建失败

**检查事项**：
- 环境变量是否正确配置
- 依赖是否安装成功
- TypeScript 编译是否通过
- 构建日志中的具体错误信息

### 运行时错误

**排查步骤**：
- **Cloudflare**：查看 Functions 日志（Dashboard → Pages → Logs）
- **Vercel**：查看 Functions 日志（Dashboard → Project → Functions）
- **Docker**：查看容器日志 (`docker logs x-clone`)

### 数据库连接问题

**解决方法**：
- 确认 Supabase URL 和密钥正确
- 检查 RLS 策略是否允许访问
- 验证网络连接是否正常
- 检查防火墙设置是否阻止连接

### 图片上传失败

**解决方法**：
- 确认对象存储配置正确
- 检查存储桶权限设置
- 验证网络连接是否稳定

## 📞 支持

如果遇到部署问题，可以参考以下资源：

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Vercel 文档](https://vercel.com/docs)
- [Supabase 文档](https://supabase.com/docs)

## 📝 版本历史

| 版本 | 变更 | 日期 |
|------|------|------|
| 1.0.0 | 初始部署指南 | 2026-02-18 |
