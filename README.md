# MyApp — Task Manager

Full-stack Task Management Application

**Stack:** React + Vite | Node.js + Express | PostgreSQL + Prisma | Docker

---

## 🚀 รันบนเครื่อง (Local Development)

### ต้องมีก่อน
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 20+](https://nodejs.org)
- [Git](https://git-scm.com)

### ขั้นตอน

```bash
# 1. Clone project
git clone https://github.com/yourname/myapp.git
cd myapp

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. รัน Docker (Database + Backend + Frontend)
docker compose up -d

# 4. รัน Migration + Seed ข้อมูลตัวอย่าง
docker compose exec backend npx prisma migrate dev
docker compose exec backend npm run db:seed

# 5. เปิด browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# Health:   http://localhost:8000/health
```

### Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| demo@example.com | password123 | User |
| admin@example.com | password123 | Admin |

---

## 📁 โครงสร้าง Project

```
myapp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth, validation, error
│   │   └── routes/             # API routes
│   ├── server.js               # Entry point
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI
│   │   ├── context/            # React Context (Auth)
│   │   ├── pages/              # Page components
│   │   └── services/           # API calls
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register | - |
| POST | /api/auth/login | Login | - |
| GET | /api/auth/me | Get current user | ✅ |
| PATCH | /api/auth/change-password | Change password | ✅ |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/tasks | List tasks (filter + paginate) | ✅ |
| GET | /api/tasks/stats | Task statistics | ✅ |
| GET | /api/tasks/:id | Get single task | ✅ |
| POST | /api/tasks | Create task | ✅ |
| PUT | /api/tasks/:id | Update task | ✅ |
| DELETE | /api/tasks/:id | Delete task | ✅ |
| DELETE | /api/tasks/bulk | Delete multiple | ✅ |

---

## ⚙️ คำสั่งที่ใช้บ่อย

```bash
# ดู logs
docker compose logs -f backend
docker compose logs -f frontend

# Prisma Studio (GUI database)
docker compose exec backend npm run db:studio

# Reset database
docker compose exec backend npm run db:reset

# เข้า container
docker compose exec backend sh
docker compose exec db psql -U admin -d myappdb

# หยุด + ลบ containers
docker compose down
docker compose down -v  # ลบ volume (ข้อมูล DB) ด้วย
```

---

## 🚢 Deploy ไป AWS

ดูคู่มือละเอียดได้ที่ `aws-deploy-guide.md`

ต้องการ GitHub Secrets:
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET
CF_DISTRIBUTION_ID
API_URL
EC2_HOST
EC2_SSH_KEY
```
