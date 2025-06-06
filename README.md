# B2B Marketplace

Sistema de marketplace B2B para Comércio Eletrônico - UTFPR

## Funcionalidades

- **Autenticação**: Registro e login de usuários (compradores, fornecedores, admin)
- **Gestão de Produtos**: CRUD de produtos com categorias
- **Sistema de Cotações**: Solicitação e envio de cotações entre compradores e fornecedores
- **Gestão de Pedidos**: Processamento completo de pedidos
- **Sistema de Avaliações**: Avaliação de fornecedores e produtos
- **Analytics**: Dashboard com métricas de vendas e performance
- **Administração**: Painel administrativo para gestão do sistema

## Tecnologias

- **Backend**: Node.js + Express + PostgreSQL + Sequelize
- **Frontend**: React 18 + Tailwind CSS
- **Autenticação**: JWT
- **Docker**: Para containerização

## Como Executar

### Pré-requisitos
- Docker
- Docker Compose

### Executar o Projeto

1. Clone o repositório:
```bash
git clone <repository-url>
cd MarketPlace_B2B
```

2. Execute com Docker:
```bash
docker-compose up --build
```

3. Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5434

### Seed de Dados

Após subir os containers, acesse o endpoint para popular o banco:
```bash
curl -X POST http://localhost:3001/api/seed
```

### Credenciais de Teste
- **Admin**: admin@b2bmarketplace.com / 123456
- **Comprador**: joao@empresa.com / 123456

### Comandos Úteis

```bash
# Parar containers
docker-compose down

# Limpar volumes
docker-compose down -v

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Estrutura do Projeto

```
MarketPlace_B2B/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Autenticação
- POST `/api/auth/register` - Registro
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Perfil do usuário

### Produtos
- GET `/api/products` - Listar produtos
- GET `/api/products/search` - Buscar produtos
- POST `/api/products` - Criar produto (fornecedor/admin)

### Cotações
- POST `/api/quotes/request` - Solicitar cotação
- GET `/api/quotes/supplier` - Cotações do fornecedor
- POST `/api/quotes/submit` - Enviar cotação

### Pedidos
- POST `/api/orders` - Criar pedido
- GET `/api/orders` - Listar pedidos do usuário
- PUT `/api/orders/:id/status` - Atualizar status

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
