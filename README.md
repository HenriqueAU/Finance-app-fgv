# Planejador Financeiro

## Requisitos
- Node.js 18+
- Docker Desktop + WSL2 (Windows)

## Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd Finance-app-fgv
```

### 2. Configure o backend
```bash
cd api
cp .env.example .env
npm install
```

### 3. Suba o banco

Execute na raiz do projeto:

```bash
docker compose up -d
```

### 4. Após subir o banco, rode as migrations
```bash
cd api
npm run migration:run
```

### 5. Inicie o backend
```bash
npm run start:dev
```

### 6. Portas que serão utilizadas
- Frontend: http://localhost:4200
- Backend: http://localhost:3000/api/v1

## Estrutura das branches

### main

* Branch de produção (estável)
* Nunca recebe push direto
* Apenas via Pull Request aprovado

### dev

* Branch de integração
* Recebe todas as features finalizadas
* Usada para testes gerais do sistema

### feature/*

* Desenvolvimento de novas funcionalidades
* Exemplo:

  * feature/auth-login
  * feature/user-crud
  * feature/expense-module

### fix/*

* Correções de bugs
* Exemplo:

  * fix/login-error
  * fix/migration-sync

---

## Fluxo de Trabalho

### 1. Criar uma feature (seguindo o padrão `feature/*` ou `fix/*`)

```bash
git checkout -b feature/nome-da-feature
```

---

### 2. Desenvolver e commitar

```bash
git add .
git commit -m "feat: descrição da feature"
```

---

### 3. Enviar para o GitHub

```bash
git push origin feature/nome-da-feature
```

---

### 4. Abrir Pull Request

* Origem: `feature/*` ou `fix/*`
* Destino: `dev`

---

### 5. Merge na dev

Após review e aprovação:

* Feature é integrada na `dev`

---

### 6. Integração final

Quando tudo estiver testado:

* PR de `dev → main`

---

## Uso da branch dev

* Testes de integração
* Validação de features combinadas
* Ajustes entre backend e frontend

---

### Regras importantes

* Nunca dar push direto na `main`
* Toda feature deve passar por PR
* Código só entra na `main após validação na dev`

---

### Convenção de commits (sugestão)

* feat: nova funcionalidade
* fix: correção de bug

