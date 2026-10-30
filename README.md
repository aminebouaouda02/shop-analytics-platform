# Shop Analytics Platform

An e-commerce platform with sales analytics, built as a PFE portfolio project.

The idea is simple: a small online shop (products, orders) plus an analytics
side that processes sales data to show what is actually selling — revenue by
category, best-selling products, and trends over time. The transactional part
and the analytics part are kept separate, the way they would be in a real system.

## Screenshots

The app running locally, with sample data:

**Home page** (`/`)

![Home page](docs/screenshots/home.png)

**Product catalogue** (`/products`, login required)

![Product catalogue](docs/screenshots/products.png)

**Orders** (`/orders`, login required)

![Orders](docs/screenshots/orders.png)

**Dashboard** (`/dashboard`, login required)

![Dashboard](docs/screenshots/dashboard.png)

## Tech Stack

**Backend**
- Java 17, Spring Boot 3
- Spring Web, Spring Data JPA, Spring Security, Bean Validation
- PostgreSQL

**Frontend**
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS

**Big Data**
- Apache Spark (PySpark) for batch sales analysis
- Hadoop / HDFS under the `bigdata` Docker profile, see `big-data/README.md`
- CSV as the starting data format, before moving to a data lake layout

**Infra**
- Docker Compose for local development (PostgreSQL by default; Hadoop HDFS + Spark under the `bigdata` profile)

## Architecture Overview

```
shop-analytics-platform/
├── backend/     Spring Boot REST API — products, orders, auth, analytics
├── frontend/    Next.js web app — storefront and analytics dashboard
└── big-data/    Spark jobs that read order data and compute sales KPIs
```

Flow (implemented end to end):

1. A customer places an order through the Next.js frontend.
2. The Spring Boot backend validates it and stores it in PostgreSQL.
3. Order data is exported to CSV / HDFS.
4. A Spark job aggregates it (for example total revenue per category).
5. Aggregated results are displayed in the dashboard.

All five steps above are implemented: the endpoints, the UI pages and the
Spark job all exist, and the roadmap below tracks what is done.

## How to Run

From a clean checkout, starting the database, backend and frontend takes
under 10 minutes (plus `npm install` the first time). No demo data is seeded
yet — register an account, then create products and orders through the UI
or the API below.

### Prerequisites
- Docker and Docker Compose
- Java 17 and Maven (to run the backend locally)
- Node.js 18+ and npm (to run the frontend locally)

### 1. Start the database

```bash
docker compose up -d postgres
```

This starts PostgreSQL on `localhost:5432`
(database: `shopanalytics`, user: `shop`, password: `shop_dev_password`).

### 1b. Start the Big Data profile (optional)

```bash
docker compose --profile bigdata up -d
```

This starts PostgreSQL plus the Hadoop NameNode and DataNode. The
`bigdata` profile is optional on purpose: the default `docker compose up`
stays light. NameNode web UI: http://localhost:9870 — HDFS address:
`hdfs://localhost:9000`.

```bash
# Check HDFS is up
docker compose --profile bigdata exec namenode hdfs dfs -ls /

# Run the Spark job inside a container (one-shot, not a daemon)
docker compose --profile bigdata run --rm spark \
  spark-submit spark/sales_analysis.py data/sample_orders.csv

# Stop everything
docker compose down
```

The Spark job still reads local CSV files by default; reading its input
from HDFS is the next step (see `big-data/README.md`).

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Health check:

```bash
curl http://localhost:8080/api/health
# {"status":"UP","service":"shop-analytics-backend", ...}
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 4. Try the Spark job (optional)

```bash
cd big-data
# Requires a local Spark / PySpark install for now
spark-submit spark/sales_analysis.py data/sample_orders.csv
```

It reads the sample orders CSV and prints total revenue per category.

## API Reference

Base URL when the backend runs locally: `http://localhost:8080`.
Interactive docs (Swagger UI): `http://localhost:8080/swagger-ui.html`,
raw OpenAPI JSON: `http://localhost:8080/v3/api-docs`.
All endpoints except health, auth and the docs themselves require an
`Authorization: Bearer <token>` header, using the token from login.

| Method | Endpoint | Auth | What it does |
|--------|----------|------|--------------|
| GET | `/api/health` | No | Backend health check |
| POST | `/api/auth/register` | No | Create an account, returns a JWT |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/products` | Yes | List products, optional `?category=` filter |
| GET | `/api/products/{id}` | Yes | One product |
| POST | `/api/products` | Yes | Create a product |
| PUT | `/api/products/{id}` | Yes | Update a product |
| DELETE | `/api/products/{id}` | Yes | Delete a product |
| GET | `/api/orders` | Yes | List orders, optional `?status=` filter |
| GET | `/api/orders/{id}` | Yes | One order |
| POST | `/api/orders` | Yes | Create an order (total computed server-side) |
| PUT | `/api/orders/{id}/status?status=` | Yes | Change an order's status |
| DELETE | `/api/orders/{id}` | Yes | Delete an order |
| GET | `/api/analytics/sales` | Yes | Latest Spark result: revenue per category |

Example calls (copy-paste ready, same style as a Postman collection):

```bash
# 1. Register, then log in and save the token
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"demo12345"}'

TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo12345"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# 2. Create a product
curl -X POST http://localhost:8080/api/products \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Headphones","description":"Wireless over-ear","price":79.99,"category":"Electronics","stockQuantity":50}'

# 3. List products and read the analytics result
curl http://localhost:8080/api/products -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/api/analytics/sales -H "Authorization: Bearer $TOKEN"
```

Error codes: `400` for invalid input, `401` for a missing or bad token,
`404` for an unknown id, `409` when registering an existing username.

## Roadmap

- [x] **Day 1 — Project scaffold**
  - [x] Repository structure, README, `.gitignore`, Docker Compose (PostgreSQL)
  - [x] Spring Boot skeleton: `Product` / `Order` entities, repositories, health endpoint, basic security config
  - [x] Next.js skeleton: home page, API helper
  - [x] PySpark skeleton + sample orders CSV
- [x] **Products module** — CRUD REST API + DTO validation
  - [x] `ProductController`: full CRUD (`POST`/`PUT`/`DELETE` added), `ProductRequest` DTO with `@Valid`
  - [x] Controller tests (12 JUnit/Mockito tests: `ProductControllerTest`, `OrderControllerTest`, `AuthControllerTest` — create/list/filter, 404/400/409/401 cases, and server-side order total calculation)
- [x] **Orders module** — CRUD REST API + DTO validation
  - [x] `OrderController`: create/list/detail/status-update/delete; `OrderRequest` DTO; total price computed server-side from the current product price
- [x] **Authentication** — JWT with Spring Security, register / login
  - [x] `User` entity, `AuthController` (`/api/auth/register`, `/api/auth/login`), JWT filter, BCrypt password hashing
  - [x] `/login` and `/register` pages, token stored in the browser, protected route group with `/dashboard`
- [x] **Frontend catalogue** — product and order list pages fetching from the API
  - [x] `/products` and `/orders` pages under the protected route group, linked from `/dashboard`
- [x] **Frontend detail pages** — product detail view with edit form, order detail view with status change; each page shows loading and error states, and list pages link to the detail pages
- [ ] **Frontend orders** — cart / checkout flow (simple version)
- [x] **Spark analytics v1** — revenue per category on a generated 600-row sample, result JSON served by `GET /api/analytics/sales`
- [x] **Hadoop integration** — HDFS in Docker Compose under the `bigdata` profile (NameNode + DataNode) and a Spark job-runner service; Spark jobs still read local CSV by default, reading from HDFS is the next step
- [x] **Analytics dashboard** — charts in Next.js from aggregated results
  - [x] `/dashboard` shows a revenue-per-category bar chart from `GET /api/analytics/sales` (total revenue, items sold and order count per category), with a clear note instead of a chart if the Spark result has not been generated yet
- [x] **Polish & documentation** — README rewritten for the finished features, API reference table with copy-paste examples, OpenAPI/Swagger UI enabled, setup under 10 minutes
- [x] CI — GitHub Actions runs the backend tests and the frontend build on every push to main and every pull request (`.github/workflows/ci.yml`)
- [ ] Deployment notes, better error handling
- [ ] Frontend component test setup (deferred: adding Jest + Testing Library needs new dev dependencies and a verified install, so it will be set up with the CI work rather than added unverified)

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on every pull
request, in two jobs: the backend job sets up Java 17 and runs `mvn -B test`
in `backend/`; the frontend job sets up Node.js 20, runs `npm ci` and
`npm run build` in `frontend/`. The backend tests are unit tests with mocked
repositories, so CI needs no database. A green check on a pull request means
the code builds and the tests pass; see the Actions tab on GitHub for the run
history.

## Tests

Backend unit tests live in `backend/src/test/java/...` and use JUnit 5
with Mockito (repositories mocked, no database needed). Run them with:

```bash
cd backend
mvn test
```

Note: Java/Maven are not installed in the workspace where this work was
prepared, so the tests were checked for consistency with the controllers
(signatures, status codes, DTO fields) but not executed there — run
`mvn test` locally or in CI to see them pass.

## Author

Amine Bouaouda — PFE internship portfolio project.
GitHub: [@aminebouaouda02](https://github.com/aminebouaouda02)
