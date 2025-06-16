# 🚀 ConexHub - Marketplace B2B Industrial

**ConexHub** é uma plataforma completa de comércio eletrônico B2B desenvolvida especificamente para o mercado brasileiro, conectando indústrias com eficiência, segurança e inovação.

<div align="center">

![ConexHub Logo](https://img.shields.io/badge/ConexHub-Marketplace%20B2B-16a34a?style=for-the-badge&logo=shopping-cart)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=flat&logo=docker)](https://docker.com/)
[![PIX](https://img.shields.io/badge/PIX-Pagamentos-00AA55?style=flat&logo=pix)](https://www.bcb.gov.br/estabilidadefinanceira/pix)

[🌐 Demo](http://localhost:3000) • [📖 Documentação](#-documentação) • [🚀 Deploy](#-deploy) • [💻 Desenvolvimento](#-desenvolvimento)

</div>

---

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [⚡ Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Início Rápido](#-início-rápido)
- [💻 Desenvolvimento](#-desenvolvimento)
- [🔧 Configuração](#-configuração)
- [🧪 Contas de Teste](#-contas-de-teste)
- [💳 Sistema PIX](#-sistema-pix)
- [🌐 Internacionalização](#-internacionalização)
- [📚 API Documentation](#-api-documentation)
- [🐛 Solução de Problemas](#-solução-de-problemas)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **ConexHub** é uma solução completa de marketplace B2B desenvolvida para democratizar o acesso ao comércio industrial no Brasil. A plataforma conecta pequenas e médias empresas a fornecedores qualificados, oferecendo transparência, eficiência e crescimento sustentável.

### 🌟 Diferenciais

- **🇧🇷 100% Brasileiro**: Desenvolvido especificamente para o mercado brasileiro
- **💳 Pagamentos PIX**: Integração completa com o sistema de pagamentos instantâneos
- **🌍 Bilíngue**: Interface em Português e Inglês
- **📱 Responsivo**: Funciona perfeitamente em dispositivos móveis
- **🔒 Seguro**: Implementa as melhores práticas de segurança
- **⚡ Performance**: Otimizado para alta performance e escalabilidade

---

## ⚡ Funcionalidades

### 👥 Gestão de Usuários
- ✅ Cadastro e autenticação com JWT
- ✅ Perfis diferenciados (Admin, Comprador, Fornecedor)
- ✅ Validação de CNPJ para empresas
- ✅ Gerenciamento de perfis e dados da empresa

### 🛒 Catálogo de Produtos
- ✅ Catálogo industrial abrangente
- ✅ Categorias especializadas (Máquinas, Ferramentas, Matérias-Primas, etc.)
- ✅ Busca avançada com filtros
- ✅ Imagens e especificações detalhadas
- ✅ Gestão de estoque em tempo real

### 💼 Sistema de Cotações B2B
- ✅ Solicitação de cotações personalizadas
- ✅ Resposta de fornecedores com preços e prazos
- ✅ Comparação de cotações lado a lado
- ✅ Aceitação/rejeição de propostas
- ✅ Histórico completo de negociações

### 💳 Pagamentos PIX
- ✅ Geração de QR Codes PIX automática
- ✅ Suporte a todos os tipos de chave PIX
- ✅ Códigos para copiar e colar
- ✅ Controle de expiração de pagamentos
- ✅ Rastreamento de status em tempo real

### 📊 Painel Administrativo
- ✅ Dashboard com estatísticas
- ✅ Gestão de usuários e fornecedores
- ✅ Aprovação de cadastros
- ✅ Relatórios de vendas e transações
- ✅ Moderação de conteúdo

### 🌐 Recursos Adicionais
- ✅ Interface bilíngue (PT-BR/EN)
- ✅ Design responsivo e moderno
- ✅ Notificações em tempo real
- ✅ Histórico de pedidos
- ✅ Sistema de avaliações
- ✅ Página sobre a empresa

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend**
- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM para JavaScript
- **JWT** - Autenticação segura
- **Docker** - Containerização

**Frontend**
- **React 18.2.0** - Biblioteca UI
- **TailwindCSS** - Framework CSS
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos
- **React Context** - Gerenciamento de estado

**DevOps & Ferramentas**
- **Docker Compose** - Orquestração de containers
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

### Estrutura do Projeto

```
ConexHub/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/          # Modelos do banco de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Middlewares de autenticação
│   │   └── services/        # Serviços (PIX, Email, etc.)
│   ├── migrations/          # Migrações do banco
│   └── config/              # Configurações
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos (Auth, Language)
│   │   ├── hooks/           # Hooks customizados
│   │   ├── services/        # Serviços API
│   │   └── utils/           # Utilitários
│   └── public/              # Arquivos estáticos
├── docker-compose.yml       # Configuração Docker
└── README.md               # Este arquivo
```

---

## 🚀 Início Rápido

### Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes softwares instalados:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)
- **Git** para clonar o repositório
- **4GB RAM** disponível para os containers
- **Portas 3000, 3001 e 5434** livres no sistema

### 📋 Guia Passo a Passo

#### 1. Clone o Repositório

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/conexhub.git
cd conexhub

# Verifique se está na branch correta
git branch
```

#### 2. Navegue até a Raiz do Projeto

```bash
# Confirme que está no diretório correto
pwd
# Deve mostrar: /caminho/para/conexhub

# Liste os arquivos para confirmar
ls -la
# Deve mostrar: docker-compose.yml, backend/, frontend/, README.md
```

#### 3. Crie os Arquivos de Ambiente

```bash
# Backend - copie o arquivo de exemplo
cd backend
cp .env.example .env

# Frontend - copie o arquivo de exemplo (se existir)
cd ../frontend
cp .env.example .env || echo "Arquivo .env do frontend não necessário"

# Volte para a raiz
cd ..
```

#### 4. Configure as Variáveis de Ambiente

Edite os arquivos `.env` conforme necessário:

**Backend (.env):**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/b2b_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=b2b_marketplace

# JWT Configuration
JWT_SECRET=DEV_A8x9K2mN5q7P1wT3uY6rE9sA2dF5gH8j
JWT_REFRESH_SECRET=DEV_REFRESH_M6n5B4v3C2x1Z9y8A7s6D5f4G3h2J1k0
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=3001
API_PREFIX=/api

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true

# Security & Performance
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Frontend (.env):**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_NODE_ENV=development

# Development Configuration
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true
FAST_REFRESH=true
```

#### 5. Execute docker-compose up -d --build

```bash
# Construa e inicie todos os serviços
docker-compose up -d --build

# Acompanhe os logs durante a inicialização
docker-compose logs -f

# Para parar de acompanhar os logs, pressione Ctrl+C
```

#### 6. Aguarde a Inicialização Completa

```bash
# Verifique o status dos containers
docker-compose ps

# Todos os serviços devem estar com status "Up"
# Nome                Estado              Portas
# b2b_postgres       Up (healthy)        0.0.0.0:5434->5432/tcp
# b2b_backend        Up (healthy)        0.0.0.0:3001->3001/tcp  
# b2b_frontend       Up (healthy)        0.0.0.0:3000->3000/tcp

# Se algum serviço não estiver "healthy", aguarde alguns minutos
```

#### 7. Popular o Banco de Dados

```bash
# Aguarde o backend estar totalmente online (verifique logs)
curl -f http://localhost:3001/health

# Execute o seed para popular dados de exemplo
curl -X POST http://localhost:3001/api/seed

# Verificação: deve retornar dados sobre usuários criados
# {
#   "success": true,
#   "message": "Dados de exemplo criados com sucesso!",
#   "credentials": {
#     "admin": {"email": "admin@b2bmarketplace.com", "password": "123456"},
#     "user": {"email": "joao@empresa.com", "password": "123456"}
#   }
# }
```

#### 8. Verificar Funcionamento

```bash
# Teste o backend
curl http://localhost:3001/health

# Teste se o frontend está respondendo
curl http://localhost:3000

# Verifique se não há erros nos logs
docker-compose logs --tail=20
```

### 🌐 Acessar a Aplicação

Após a inicialização completa:

- **🎯 Frontend Principal**: http://localhost:3000
- **📱 API Backend**: http://localhost:3001  
- **📚 Documentação da API**: http://localhost:3001/docs
- **🔍 Health Check**: http://localhost:3001/health
- **🗄️ Banco PostgreSQL**: localhost:5434 (usuário: postgres, senha: password)

### ✅ Verificação de Sucesso

A aplicação estará funcionando corretamente quando:

1. ✅ **Frontend carrega sem erros** em http://localhost:3000
2. ✅ **API responde** em http://localhost:3001/health
3. ✅ **Documentação acessível** em http://localhost:3001/docs
4. ✅ **Login funciona** com as credenciais de teste
5. ✅ **Dados de exemplo visíveis** no catálogo de produtos

---

## 💻 Desenvolvimento

### Instalação Local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (novo terminal)
cd frontend
npm install
npm start
```

### Comandos Úteis

```bash
# Ver logs dos containers
docker-compose logs -f [backend|frontend|postgres]

# Reiniciar um serviço
docker-compose restart [serviço]

# Executar migrações
docker exec b2b_backend npx sequelize-cli db:migrate

# Acessar container do banco
docker exec -it b2b_postgres psql -U postgres -d b2b_marketplace

# Construir sem cache
docker-compose build --no-cache
```

### Estrutura de Branches

- `main` - Produção estável
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/b2b_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=b2b_marketplace

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# API
NODE_ENV=development
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 🧪 Contas de Teste

### Credenciais Padrão

| Tipo | Email | Senha | Descrição |
|------|-------|-------|-----------|
| **Admin** | admin@b2bmarketplace.com | 123456 | Administrador do sistema |
| **Comprador** | joao@empresa.com | 123456 | Comprador pessoa física |
| **Fornecedor** | contato@techsupply.com.br | 123456 | Fornecedor TechSupply |
| **Fornecedor** | vendas@industrialsolutions.com.br | 123456 | Industrial Solutions |

### Fluxo de Teste Completo

1. **Login como Comprador** (joao@empresa.com)
2. **Navegar pelo catálogo** de produtos industriais
3. **Solicitar cotação** para produtos de interesse
4. **Login como Fornecedor** (contato@techsupply.com.br)
5. **Responder à cotação** com preço e prazo
6. **Voltar como Comprador** e aceitar cotação
7. **Testar pagamento PIX** com dados fictícios

---

## 💳 Sistema PIX

### Funcionalidades PIX

- **✅ Geração automática de QR Codes**
- **✅ Suporte a todos os tipos de chave PIX**
  - Email
  - Telefone (+55XXXXXXXXXX)
  - CPF (11 dígitos)
  - CNPJ (14 dígitos)
  - Chave aleatória
- **✅ Códigos PIX para copiar/colar**
- **✅ Expiração configurável (15min - 24h)**
- **✅ Rastreamento de pagamentos**

### Como Testar PIX

1. **Aceite uma cotação** como comprador
2. **Clique em "Pagar com PIX"** na lista de cotações
3. **Preencha os dados do recebedor**:
   - Chave PIX: `pagamentos@conexhub.com.br`
   - Nome: `ConexHub Pagamentos`
   - Documento: `12345678000100`
4. **Gere o código PIX**
5. **Escaneie o QR Code** ou copie o código
6. **Simule o pagamento** (em produção usaria app bancário)

### Chaves PIX de Teste

```
Email: pagamentos@conexhub.com.br
Telefone: +5547999887766
CNPJ: 12345678000100
Chave Aleatória: 123e4567-e89b-12d3-a456-426614174000
```

---

## 🌐 Internacionalização

### Idiomas Suportados

- **🇧🇷 Português Brasileiro** (padrão)
- **🇺🇸 English** (internacional)

### Alternar Idioma

1. Clique no **seletor de idioma** no cabeçalho
2. Escolha entre **PT** ou **EN**
3. A interface será **atualizada automaticamente**

---

## 📚 API Documentation

### 🚀 Documentação Interativa Swagger

A API possui documentação completa e interativa disponível em:

**📖 [http://localhost:3001/docs](http://localhost:3001/docs)**

#### Funcionalidades da Documentação:

- ✅ **Interface interativa** para testar endpoints
- ✅ **Autenticação integrada** com Bearer tokens
- ✅ **Schemas completos** com validações
- ✅ **Exemplos de requisições** e respostas
- ✅ **Códigos de erro** documentados
- ✅ **Filtros e busca** por endpoints
- ✅ **Download do OpenAPI spec** em JSON

### 📋 Resumo dos Endpoints

#### 🔐 Autenticação
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/register` | Registrar novo usuário | ❌ |
| `POST` | `/api/auth/login` | Fazer login | ❌ |
| `GET` | `/api/auth/profile` | Obter perfil do usuário | ✅ |
| `PUT` | `/api/auth/profile` | Atualizar perfil | ✅ |
| `POST` | `/api/auth/change-password` | Alterar senha | ✅ |

#### 📦 Produtos
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/products` | Listar produtos (paginado) | ❌ |
| `GET` | `/api/products/search` | Buscar produtos | ❌ |
| `GET` | `/api/products/:id` | Obter produto por ID | ❌ |
| `POST` | `/api/products` | Criar produto | ✅ Supplier/Admin |
| `PUT` | `/api/products/:id` | Atualizar produto | ✅ Supplier/Admin |
| `DELETE` | `/api/products/:id` | Excluir produto | ✅ Supplier/Admin |

#### 💼 Cotações B2B
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/quotes/request` | Solicitar cotação | ✅ |
| `GET` | `/api/quotes/buyer` | Cotações do comprador | ✅ |
| `GET` | `/api/quotes/supplier` | Cotações do fornecedor | ✅ Supplier |
| `PUT` | `/api/quotes/:id/respond` | Responder cotação | ✅ Supplier |
| `POST` | `/api/quotes/:id/accept` | Aceitar cotação | ✅ |
| `POST` | `/api/quotes/:id/reject` | Rejeitar cotação | ✅ |

#### 🛒 Pedidos
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/orders` | Criar pedido | ✅ |
| `GET` | `/api/orders` | Listar pedidos do usuário | ✅ |
| `GET` | `/api/orders/:id` | Obter pedido por ID | ✅ |
| `PUT` | `/api/orders/:id/status` | Atualizar status | ✅ Supplier/Admin |
| `GET` | `/api/orders/:id/invoice` | Gerar nota fiscal | ✅ |

#### 💳 Pagamentos PIX
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/pix/quotes/:id/payment` | Criar pagamento PIX | ✅ |
| `GET` | `/api/pix/payments/:id` | Status do pagamento | ✅ |
| `POST` | `/api/pix/validate-key` | Validar chave PIX | ❌ |

#### 🏪 Fornecedores
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/suppliers` | Listar fornecedores | ❌ |
| `GET` | `/api/suppliers/:id` | Perfil do fornecedor | ❌ |
| `GET` | `/api/suppliers/:id/products` | Produtos do fornecedor | ❌ |
| `PUT` | `/api/suppliers/profile` | Atualizar perfil | ✅ Supplier |

#### 🏷️ Categorias
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/categories` | Listar categorias | ❌ |
| `POST` | `/api/categories` | Criar categoria | ✅ Admin |
| `PUT` | `/api/categories/:id` | Atualizar categoria | ✅ Admin |
| `DELETE` | `/api/categories/:id` | Excluir categoria | ✅ Admin |

#### 👥 Administração
| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/admin/users` | Listar usuários | ✅ Admin |
| `PUT` | `/api/admin/users/:id` | Atualizar usuário | ✅ Admin |
| `POST` | `/api/admin/suppliers/verify/:id` | Verificar fornecedor | ✅ Admin |
| `GET` | `/api/admin/reports` | Relatórios do sistema | ✅ Admin |

### 🔑 Autenticação

#### Como Obter Token JWT:

1. **Registre um usuário** ou use credenciais de teste
2. **Faça login** com POST `/api/auth/login`
3. **Use o token** no header Authorization

```javascript
// Headers para requisições autenticadas
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### 📝 Exemplos Práticos

#### Login e Obtenção de Token:
```bash
# 1. Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@empresa.com",
    "password": "123456"
  }'

# Resposta:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "user": { "id": "...", "name": "João Silva", "role": "buyer" }
#   }
# }
```

#### Usar Token para Acessar Recursos:
```bash
# 2. Listar produtos (token não obrigatório)
curl -X GET "http://localhost:3001/api/products?page=1&limit=10"

# 3. Solicitar cotação (token obrigatório)
curl -X POST http://localhost:3001/api/quotes/request \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "quantity": 10,
    "message": "Preciso desta quantidade para projeto urgente"
  }'
```

#### Resposta Padrão da API:
```json
{
  "success": true|false,
  "message": "Mensagem descritiva",
  "data": { /* dados retornados */ },
  "errors": [ /* erros de validação */ ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 🌐 Testando na Documentação Swagger

1. **Acesse** http://localhost:3001/docs
2. **Clique em "Authorize"** no topo da página
3. **Insira o token** no formato: `Bearer SEU_TOKEN`
4. **Teste qualquer endpoint** clicando em "Try it out"
5. **Veja exemplos reais** de requisições e respostas

---

## 🐛 Solução de Problemas

### Problemas Comuns

#### 🔧 Containers não iniciam
```bash
# Verificar logs
docker-compose logs

# Limpar e reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### 🔧 Banco de dados vazio
```bash
# Executar migrações
docker exec b2b_backend npx sequelize-cli db:migrate

# Popular dados
curl -X POST http://localhost:3001/api/seed
```

#### 🔧 Login não funciona
```bash
# Verificar se dados foram populados
docker exec b2b_postgres psql -U postgres -d b2b_marketplace -c "SELECT email FROM \"Users\";"

# Re-popular se necessário
curl -X POST http://localhost:3001/api/seed
```

#### 🔧 Frontend não carrega
```bash
# Verificar se as portas estão livres
netstat -tlnp | grep :3000
netstat -tlnp | grep :3001

# Reiniciar frontend
docker-compose restart frontend
```

### Logs e Debug

```bash
# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Status dos containers
docker-compose ps

# Usar container interativo
docker exec -it b2b_backend bash
```

---

## 🚀 Deploy

### Deploy em Produção

1. **Configurar variáveis de ambiente**
```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=chave_super_segura_producao
```

2. **Build de produção**
```bash
# Frontend
npm run build

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

### Padrões de Commit

```
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação de código
refactor: refatoração
test: adição de testes
chore: tarefas de manutenção
```

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Equipe

### Desenvolvido com ❤️ por:

- **ConexHub Team** - Desenvolvimento e Arquitetura
- **Claude AI** - Assistência técnica e otimização
- **Comunidade Open Source** - Bibliotecas e ferramentas

---

## 📞 Suporte

### Precisa de Ajuda?

- **📧 Email**: suporte@conexhub.com.br
- **📱 WhatsApp**: +55 47 99988-7766
- **🌐 Site**: https://conexhub.com.br
- **📚 Docs**: https://docs.conexhub.com.br

### Horário de Atendimento

- **Segunda a Sexta**: 08h às 18h
- **Sábado**: 08h às 12h
- **Suporte Técnico**: 24/7

---

<div align="center">

**🚀 ConexHub - Conectando o futuro da indústria brasileira**

[![GitHub](https://img.shields.io/badge/GitHub-ConexHub-181717?style=flat&logo=github)](https://github.com/conexhub)
[![Website](https://img.shields.io/badge/Website-conexhub.com.br-16a34a?style=flat&logo=globe)](https://conexhub.com.br)
[![Email](https://img.shields.io/badge/Email-suporte@conexhub.com.br-ea4335?style=flat&logo=gmail)](mailto:suporte@conexhub.com.br)

</div>

---

*Última atualização: Junho 2025*
