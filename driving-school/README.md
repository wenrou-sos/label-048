# 驾校学员管理平台

一个功能完整的驾校学员管理系统，基于 Next.js 14+ App Router 架构和 Prisma ORM 开发，使用 MySQL 数据库存储数据。

## 功能特性

### 1. 学员管理系统
- 学员在线注册与报名
- 个人信息管理
- 学习进度跟踪与显示
- 学时统计

### 2. 教练选择与管理
- 教练列表展示（简介、评分、评价等）
- 学员自主选择教练
- 教练信息管理
- 教练评价系统

### 3. 预约与排课系统
- 学员在线预约练车时间
- 教练确认预约工作流
- 系统自动排课与时间表生成
- 预约冲突检测与处理机制

### 4. 考试与驾照状态管理
- 考试结果录入
- 驾照状态自动更新
- 学习历程记录
- 考试成绩查询

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **ORM**: Prisma 5
- **数据库**: MySQL
- **验证**: Zod
- **密码加密**: bcryptjs

## 环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm 或 yarn

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd driving-school
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并根据实际情况修改：

```env
DATABASE_URL="mysql://root:password@localhost:3306/driving_school"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

**注意**: 请确保 MySQL 数据库已启动，并且数据库密码设置为 `password`（或根据实际情况修改）。

### 4. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE driving_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. 初始化数据库

```bash
# 推送数据模型到数据库
npm run db:push

# 插入测试数据
npm run db:seed
```

或者一键执行：

```bash
npm run db:setup
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
driving-school/
├── prisma/
│   ├── schema.prisma       # Prisma 数据模型
│   └── seed.ts             # 测试数据种子
├── src/
│   ├── app/
│   │   ├── api/            # API 路由
│   │   │   ├── auth/       # 认证相关
│   │   │   ├── bookings/   # 预约管理
│   │   │   ├── coaches/    # 教练管理
│   │   │   ├── courses/    # 课程管理
│   │   │   ├── exams/      # 考试管理
│   │   │   ├── schedules/  # 排课管理
│   │   │   └── students/   # 学员管理
│   │   ├── booking/        # 预约页面
│   │   ├── coaches/        # 教练页面
│   │   ├── courses/        # 课程页面
│   │   ├── exams/          # 考试页面
│   │   ├── login/          # 登录页面
│   │   ├── register/       # 注册页面
│   │   ├── students/       # 学员页面
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/
│   │   └── Navbar.tsx      # 导航栏组件
│   └── lib/
│       └── prisma.ts       # Prisma 客户端
├── .env                    # 环境变量
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 数据模型

### 核心数据表

- **User**: 用户表（学员、教练、管理员共用）
- **Student**: 学员表
- **Coach**: 教练表
- **Course**: 课程表
- **Schedule**: 排课表
- **Booking**: 预约表
- **ExamRecord**: 考试记录表
- **Review**: 评价表
- **Payment**: 支付记录表
- **Notification**: 通知表

### 枚举类型

- **UserRole**: 用户角色 (STUDENT, COACH, ADMIN)
- **LicenseType**: 驾照类型 (C1, C2, B1, B2, A1, A2, A3, D, E, F)
- **StudyPhase**: 学习阶段 (SUBJECT_1 ~ SUBJECT_4, COMPLETED)
- **BookingStatus**: 预约状态 (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- **ExamStatus**: 考试状态 (NOT_TAKEN, PASSED, FAILED)
- **LicenseStatus**: 驾照状态 (NOT_APPLIED, APPLYING, LEARNING, TESTING, OBTAINED, REVOKED)
- **CourseType**: 课程类型 (SUBJECT_2, SUBJECT_3, REFRESHER)

## API 文档

### 学员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/students` | 获取学员列表 |
| POST | `/api/students` | 学员注册 |
| GET | `/api/students/:id` | 获取学员详情 |
| PUT | `/api/students/:id` | 更新学员信息 |

### 教练管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/coaches` | 获取教练列表 |
| POST | `/api/coaches` | 创建教练信息 |
| GET | `/api/coaches/:id` | 获取教练详情 |
| PUT | `/api/coaches/:id` | 更新教练信息 |

### 预约管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bookings` | 获取预约列表 |
| POST | `/api/bookings` | 创建预约 |
| GET | `/api/bookings/:id` | 获取预约详情 |
| PUT | `/api/bookings/:id` | 更新预约状态 |
| DELETE | `/api/bookings/:id` | 删除预约 |

### 课程管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/courses` | 获取课程列表 |
| POST | `/api/courses` | 创建课程 |

### 排课管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/schedules` | 获取排课列表 |
| POST | `/api/schedules` | 创建排课 |

### 考试管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/exams` | 获取考试记录列表 |
| POST | `/api/exams` | 创建考试记录 |

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |

## 测试账号

系统预置以下测试账号（密码均为 `123456`）：

| 角色 | 邮箱 | 说明 |
|------|------|------|
| 管理员 | admin@driving.com | 系统管理员 |
| 学员 | student1@driving.com | 普通学员 |
| 教练 | coach1@driving.com | 张教练 |

## 可用脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 推送数据库 schema
npm run db:push

# 生成 Prisma 客户端
npm run prisma:generate

# 种子数据
npm run db:seed

# 一键设置数据库
npm run db:setup
```

## 功能说明

### 预约冲突检测

系统在创建预约时会自动检测以下冲突：
- 同一教练同一时间段是否已有预约
- 同一学员同一时间段是否已有预约

如果检测到冲突，会返回 409 状态码和冲突详情。

### 学习进度自动更新

当预约状态更新为 COMPLETED（已完成）时，系统会自动：
- 计算完成的学时
- 累加到学员的已完成学时中

### 考试状态自动流转

当录入考试通过成绩时，系统会自动：
- 推进学员的学习阶段（科目一 → 科目二 → 科目三 → 科目四 → 完成）
- 更新驾照状态
- 发送通知提醒

### 响应式设计

系统采用响应式设计，支持在以下设备上良好显示：
- 桌面端 (1024px+)
- 平板 (768px - 1024px)
- 手机端 (< 768px)

## 部署说明

### 生产环境部署

1. 构建应用：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm run start
```

### Docker 部署

可使用 Docker 进行容器化部署，建议配置：
- Node.js 容器运行 Next.js 应用
- MySQL 容器运行数据库
- Nginx 作为反向代理

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 代码规范
- API 响应统一使用 JSON 格式
- 错误处理使用 try-catch 和合适的 HTTP 状态码

## 常见问题

### 1. 数据库连接失败？

请检查：
- MySQL 服务是否启动
- 数据库地址、端口、用户名、密码是否正确
- 数据库是否已创建

### 2. 如何重置数据库？

```bash
# 删除所有数据并重新推送 schema
npx prisma db push --force-reset

# 重新插入测试数据
npm run db:seed
```

### 3. 如何添加新的测试数据？

编辑 `prisma/seed.ts` 文件，添加需要的数据后重新运行：

```bash
npm run db:seed
```

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
