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

- **Docker** e **Docker Compose** instalados
- **Git** para clonar o repositório
- **4GB RAM** disponível para os containers

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/conexhub.git
cd conexhub
```

### 2. Configuração do Ambiente

```bash
# Copie o arquivo de ambiente (se necessário)
cp .env.example .env

# As configurações padrão já funcionam para desenvolvimento
```

### 3. Iniciar a Aplicação

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Aguardar inicialização (30-60 segundos)
docker-compose logs -f
```

### 4. Popular o Banco de Dados

```bash
# Executar migrações (automático na inicialização)
# Popular dados de exemplo
curl -X POST http://localhost:3001/api/seed
```

### 5. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Banco de Dados**: localhost:5434

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

### Endpoints Principais

#### Autenticação
```http
POST /api/auth/register    # Registrar usuário
POST /api/auth/login       # Login
GET  /api/auth/profile     # Perfil do usuário
```

#### Produtos
```http
GET    /api/products       # Listar produtos
GET    /api/products/:id   # Detalhes do produto
POST   /api/products       # Criar produto (fornecedor)
PUT    /api/products/:id   # Atualizar produto
DELETE /api/products/:id   # Excluir produto
```

#### Cotações
```http
POST /api/quotes/request           # Solicitar cotação
GET  /api/quotes/buyer             # Cotações do comprador
GET  /api/quotes/supplier          # Cotações do fornecedor
PUT  /api/quotes/:id/respond       # Responder cotação
POST /api/quotes/:id/accept        # Aceitar cotação
```

#### PIX
```http
POST /api/pix/quotes/:id/payment   # Criar pagamento PIX
GET  /api/pix/payments/:id         # Status do pagamento
POST /api/pix/validate-key         # Validar chave PIX
```

### Autenticação

```javascript
// Headers necessários
{
  "Authorization": "Bearer seu_jwt_token",
  "Content-Type": "application/json"
}
```

### Exemplos de Requisições

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@empresa.com","password":"123456"}'

# Listar produtos
curl -X GET http://localhost:3001/api/products \
  -H "Authorization: Bearer seu_token"

# Solicitar cotação
curl -X POST http://localhost:3001/api/quotes/request \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{"productId":"uuid","quantity":10,"urgency":"normal"}'
```

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