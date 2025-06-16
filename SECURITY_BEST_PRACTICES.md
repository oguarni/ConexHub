# 🔒 Guia de Melhores Práticas de Segurança

## 📋 Índice
1. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
2. [Segurança de JWT](#segurança-de-jwt)
3. [Proteção de Banco de Dados](#proteção-de-banco-de-dados)
4. [Validação e Sanitização](#validação-e-sanitização)
5. [CORS e Headers de Segurança](#cors-e-headers-de-segurança)
6. [Logs e Monitoramento](#logs-e-monitoramento)
7. [Deploy Seguro](#deploy-seguro)
8. [Checklist de Segurança](#checklist-de-segurança)

---

## 🔧 Configuração de Variáveis de Ambiente

### ✅ Boas Práticas

#### 1. **Nunca Hardcode Secrets**
```javascript
// ❌ ERRADO - Hardcoded
const token = jwt.sign(payload, 'my-secret-key');

// ✅ CORRETO - Variável de ambiente
const token = jwt.sign(payload, process.env.JWT_SECRET);
```

#### 2. **Use Configuração Centralizada**
```javascript
// ✅ Use o sistema de configuração
const config = require('./src/config');
const token = jwt.sign(payload, config.JWT_SECRET);
```

#### 3. **Valide na Inicialização**
```javascript
// ✅ Falha rápido se configuração inválida
npm run validate-config
```

### 🔑 Gerando Secrets Seguros

```bash
# JWT Secret (64 caracteres, base64)
openssl rand -base64 64

# JWT Secret (hex, 32 bytes)
openssl rand -hex 32

# UUID para identificadores
uuidgen

# Via script npm
npm run generate-secrets
```

### 📁 Estrutura de .env

```bash
# Desenvolvimento
.env                 # Local (nunca commitar)
.env.example        # Template (pode commitar)
.env.local          # Overrides locais
.env.development    # Configs de dev
.env.production     # Configs de prod (secretas)
.env.test          # Configs de teste
```

---

## 🎫 Segurança de JWT

### 🔒 Configuração Segura

#### 1. **Secrets Robustos**
```javascript
// ✅ Critérios para JWT_SECRET:
// - Mínimo 32 caracteres
// - Maiúsculas, minúsculas, números, símbolos
// - Único por ambiente
// - Rotacionado regularmente

const jwtConfig = {
  secret: process.env.JWT_SECRET,        // 64+ chars
  refreshSecret: process.env.JWT_REFRESH_SECRET, // Diferente!
  expiresIn: '15m',                      // Curto para access tokens
  refreshExpiresIn: '7d'                 // Mais longo para refresh
};
```

#### 2. **Implementação Dupla de Tokens**
```javascript
// ✅ Access + Refresh tokens
const generateTokens = (user) => ({
  accessToken: jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: '7d' })
});
```

#### 3. **Rotação de Secrets**
```bash
# Processo de rotação:
# 1. Gerar novo secret
NEW_SECRET=$(openssl rand -base64 64)

# 2. Atualizar variável de ambiente
# 3. Invalidar tokens existentes (opcional)
# 4. Monitorar logs para erros
```

---

## 🗄️ Proteção de Banco de Dados

### 🔐 Configuração Segura

#### 1. **Credenciais Separadas**
```bash
# ❌ ERRADO - Tudo na URL
DATABASE_URL=postgresql://user:pass@host:5432/db

# ✅ MELHOR - Variáveis separadas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marketplace
DB_USER=app_user
DB_PASSWORD=strong_random_password
```

#### 2. **Conexão SSL**
```javascript
// ✅ Força SSL em produção
const dbConfig = {
  dialectOptions: {
    ssl: config.isProduction() ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};
```

#### 3. **Pool de Conexões Limitado**
```javascript
// ✅ Previne esgotamento de conexões
const pool = {
  max: 5,          // Máximo 5 conexões
  min: 0,          // Mínimo 0 conexões
  acquire: 30000,  // 30s timeout para nova conexão
  idle: 10000      // 10s antes de fechar conexão idle
};
```

---

## 🛡️ Validação e Sanitização

### ✅ Entrada Segura

#### 1. **Validação de Schema**
```javascript
// ✅ Use o sistema de validação
const { productValidation } = require('../middleware/validation');

router.post('/products', [
  sanitizeInput,
  ...productValidation.create
], asyncHandler(async (req, res) => {
  // Dados já validados e sanitizados
}));
```

#### 2. **Sanitização Automática**
```javascript
// ✅ Remove espaços, normaliza dados
const sanitizeInput = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};
```

#### 3. **Validação Específica Brasileira**
```javascript
// ✅ CPF, CNPJ, CEP validados
const { validateCPF, validateCNPJ, validateCEP } = require('../middleware/validation');

body('cpf').custom(value => {
  if (value && !validateCPF(value)) {
    throw new Error('CPF inválido');
  }
  return true;
});
```

---

## 🌐 CORS e Headers de Segurança

### 🔒 Configuração de Produção

#### 1. **CORS Restritivo**
```javascript
// ✅ Produção - Origins específicas
const corsOptions = {
  origin: [
    'https://app.meudominio.com',
    'https://admin.meudominio.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

#### 2. **Headers de Segurança**
```javascript
// ✅ Helmet com configuração robusta
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: config.isProduction(),
  noSniff: true,
  xssFilter: true
}));
```

#### 3. **Rate Limiting Inteligente**
```javascript
// ✅ Diferentes limites por rota
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,                   // 5 tentativas de login
  message: 'Muitas tentativas de login'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,                 // 100 requests gerais
  message: 'Rate limit excedido'
});
```

---

## 📊 Logs e Monitoramento

### 📝 Logging Seguro

#### 1. **Nunca Logar Dados Sensíveis**
```javascript
// ❌ ERRADO - Loga senha
console.log('User login:', { email, password });

// ✅ CORRETO - Omite dados sensíveis
console.log('User login attempt:', { 
  email, 
  ip: req.ip,
  userAgent: req.get('User-Agent')
});
```

#### 2. **Estrutura de Logs**
```javascript
// ✅ Logs estruturados para análise
const logData = {
  timestamp: new Date().toISOString(),
  level: 'info',
  event: 'user_login',
  userId: user.id,
  ip: req.ip,
  success: true
};

logger.info('User authentication', logData);
```

#### 3. **Monitoramento de Segurança**
```javascript
// ✅ Detecta tentativas suspeitas
const securityEvents = [
  'failed_login_attempt',
  'jwt_token_invalid',
  'rate_limit_exceeded',
  'cors_violation',
  'sql_injection_attempt'
];
```

---

## 🚀 Deploy Seguro

### 🔐 Ambiente de Produção

#### 1. **Variáveis de Ambiente Seguras**
```bash
# ✅ Use serviços de secrets management
# AWS Secrets Manager, Azure Key Vault, etc.

# Para containerização:
docker run -e JWT_SECRET_FILE=/run/secrets/jwt_secret myapp
```

#### 2. **HTTPS Obrigatório**
```javascript
// ✅ Redireciona HTTP para HTTPS
app.use((req, res, next) => {
  if (config.isProduction() && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});
```

#### 3. **Healthcheck Seguro**
```javascript
// ✅ Healthcheck sem dados sensíveis
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version
    // Não expor: secrets, URLs de banco, etc.
  });
});
```

---

## ✅ Checklist de Segurança

### 🔍 Pré-Deploy

```bash
# 1. Validar configuração
npm run validate-config

# 2. Verificar secrets no código
git log --all -p | grep -i "secret\|password" | grep -v "process.env"

# 3. Executar testes de segurança
npm run security-check

# 4. Verificar dependências
npm audit

# 5. Validar CORS
curl -H "Origin: https://site-malicioso.com" https://minha-api.com/api/users

# 6. Testar rate limiting
for i in {1..110}; do curl https://minha-api.com/api/test; done
```

### 📋 Checklist Completo

#### **Configuração**
- [ ] JWT_SECRET tem 64+ caracteres
- [ ] JWT_SECRET diferente de JWT_REFRESH_SECRET
- [ ] DATABASE_URL não contém credenciais padrão
- [ ] CORS configurado para produção
- [ ] Rate limiting habilitado
- [ ] HTTPS obrigatório em produção

#### **Código**
- [ ] Nenhum secret hardcoded
- [ ] Todas as entradas validadas
- [ ] Outputs sanitizados
- [ ] Error handling centralizado
- [ ] Logs não contêm dados sensíveis

#### **Infraestrutura**
- [ ] SSL/TLS configurado
- [ ] Firewall configurado
- [ ] Banco com SSL
- [ ] Backups criptografados
- [ ] Monitoramento ativo

#### **Processo**
- [ ] Code review obrigatório
- [ ] Pre-commit hooks para secrets
- [ ] CI/CD com security checks
- [ ] Rotação regular de secrets
- [ ] Incident response plan

---

## 🛠️ Ferramentas Recomendadas

### 🔧 Desenvolvimento
```bash
# Detecção de secrets
npm install -g git-secrets
git secrets --install
git secrets --register-aws

# Auditoria de dependências
npm audit
npm install -g snyk
snyk test

# Linting de segurança
npm install -g eslint-plugin-security
```

### 📊 Monitoramento
```bash
# APM e alertas
- New Relic / DataDog
- Sentry para error tracking
- LogRocket para session replay
- Cloudflare para DDoS protection
```

---

## 🚨 Incident Response

### 📞 Se Detectar Breach

1. **Isolamento imediato**
   - Revogar todos os tokens JWT
   - Trocar todas as credenciais
   - Isolar sistema comprometido

2. **Análise**
   - Revisar logs de acesso
   - Identificar escopo do breach
   - Documentar timeline

3. **Remediação**
   - Aplicar patches de segurança
   - Implementar controles adicionais
   - Notificar stakeholders

4. **Prevenção**
   - Post-mortem detalhado
   - Atualizar processos
   - Treinar equipe

---

**🎯 Lembre-se: Segurança é um processo contínuo, não um estado final!**