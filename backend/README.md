# 云迹后端 API

这是一个零依赖 Node.js 后端，不需要 Express，不需要安装额外包。

## 启动

在项目根目录运行：

```bash
npm run server
```

启动后访问：

```text
http://localhost:3001/api/health
```

## 数据存储位置

所有数据保存在：

```text
backend/data/
```

包含：

- `users.json` 用户与角色
- `destinations.json` 目的地
- `orders.json` 订单
- `trips.json` AI 行程
- `profiles.json` 个人资料
- `apiLogs.json` API 调用日志
- `settings.json` 系统设置

## 常用接口

### 登录

```http
POST /api/auth/login
```

```json
{
  "account": "admin",
  "password": "123456"
}
```

### 注册

```http
POST /api/auth/register
```

```json
{
  "account": "test",
  "password": "123456",
  "name": "测试游客"
}
```

### 通用 CRUD

以下集合都支持 GET / POST / PUT / DELETE：

```text
/api/users
/api/destinations
/api/orders
/api/trips
/api/profiles
/api/apiLogs
```

示例：

```http
GET /api/destinations
GET /api/destinations?q=杭州
POST /api/destinations
PUT /api/destinations/1
DELETE /api/destinations/1
```

### 统计

```http
GET /api/stats
```

返回用户数、游客数、目的地数、订单数、行程数、总收入等。

## 答辩可讲点

- 前后端分离
- RESTful API
- JSON 文件持久化
- 登录注册接口
- 通用 CRUD 封装
- 超级管理员保护
- 数据统计接口
- 后续可平滑替换为 MySQL / MongoDB

