# 云迹真正网站版 Render 部署说明

当前项目已经具备前后端：

- 前端：Vue3 + Vite
- 后端：Node.js RESTful API
- 数据：`backend/data/*.json`

## 一、本地运行

开两个命令行窗口。

### 1. 启动后端

```bash
cd "C:\Users\34266\Documents\New project 14"
npm run server
```

后端地址：

```text
http://localhost:3001/api/health
```

### 2. 启动前端

```bash
cd "C:\Users\34266\Documents\New project 14"
npm run dev
```

前端地址：

```text
http://localhost:5173/#/
```

## 二、现在已经接入后端的功能

以下功能已经不再只是 localStorage，而是走 Node 后端：

- 登录：`POST /api/auth/login`
- 注册：`POST /api/auth/register`
- 目的地列表：`GET /api/destinations`
- 新增目的地：`POST /api/destinations`
- 编辑目的地：`PUT /api/destinations/:id`
- 删除目的地：`DELETE /api/destinations/:id`
- 订单列表：`GET /api/orders`
- 新增订单：`POST /api/orders`
- 编辑订单：`PUT /api/orders/:id`
- 删除订单：`DELETE /api/orders/:id`
- 数据统计：`GET /api/stats`

## 三、Render 部署方式：推荐单服务

现在项目已经改成“一个 Node 服务同时托管前端页面和后端 API”。

部署后访问同一个网址即可：

```text
https://travel-spark-site.onrender.com/#/
```

接口也在同一个域名下：

```text
https://travel-spark-site.onrender.com/api/health
```

### 方式 A：使用 Blueprint，最简单

项目根目录已经添加：

```text
render.yaml
```

你可以在 Render 里选择 Blueprint，连接 GitHub 仓库，Render 会创建一个服务：

- `travel-spark-site`

它会自动执行：

```bash
npm install && npm run build
```

然后启动：

```bash
npm run server
```

### 方式 B：手动创建 Web Service

Render 点击：

```text
New + -> Web Service
```

配置：

```text
Name: travel-spark-site
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run server
```

部署成功后测试：

```text
https://travel-spark-site.onrender.com/api/health
```

```text
https://travel-spark-site.onrender.com/#/
```

## 四、注意事项

Render 免费后端会休眠，第一次打开可能要等几十秒。

当前后端使用 JSON 文件存储，适合答辩演示。如果要长期正式运营，建议把 `backend/data/*.json` 换成 MongoDB Atlas、Supabase 或 MySQL。

## 五、答辩说法

可以这样讲：

> 本项目已经升级为真正的前后端分离网站。前端使用 Vue3 和 Vite 构建，后端使用 Node.js 提供 RESTful API。登录、注册、目的地管理和订单管理已经接入后端接口，数据会保存到后端 JSON 数据库中。部署到 Render 后，前端通过环境变量连接云端 API，实现公网访问和云端数据读写。
