# Planejador Financeiro

## Requisitos
- Node.js 18+
- Docker Desktop + WSL2 (Windows)

## Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repo>
```

### 2. Configure o backend
```bash
cd api
cp .env.example .env
npm install
```

### 3. Suba o banco
```bash
cd ..
docker compose up -d
```

### 4. Rode as migrations
```bash
cd api
npm run migration:run
```

### 5. Inicie o backend
```bash
npm run start:dev
```

## Portas que serão utilizadas
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api/v1
