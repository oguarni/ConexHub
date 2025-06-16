# Guia de Tratamento de Erros Centralizado

## Visão Geral

O sistema agora possui um tratamento de erros centralizado que garante respostas consistentes e padronizadas em toda a API.

## Componentes Principais

### 1. Classe AppError

```javascript
const { AppError } = require('./src/middleware/errorHandler');

// Uso básico
throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');

// Com detalhes adicionais
throw new AppError(
  'Dados inválidos', 
  400, 
  'VALIDATION_ERROR', 
  { field: 'email', value: 'invalid-email' }
);
```

### 2. AsyncHandler Wrapper

```javascript
const { asyncHandler } = require('./src/middleware/errorHandler');

// Automaticamente captura erros async e chama next(error)
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }
  res.json({ success: true, user });
}));
```

### 3. Middleware de Erro Centralizado

O middleware captura todos os erros e retorna respostas padronizadas:

```json
{
  "success": false,
  "status": "fail",
  "message": "Usuário não encontrado",
  "code": "USER_NOT_FOUND",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Tipos de Erro Suportados

### 1. Erros de Validação (400)
- Sequelize validation errors
- Express-validator errors
- Dados malformados

### 2. Erros de Autenticação (401)
- Token inválido/expirado
- Credenciais incorretas
- Token em falta

### 3. Erros de Autorização (403)
- Permissões insuficientes
- Acesso negado

### 4. Erros de Recurso (404)
- Usuário/produto não encontrado
- Rota não encontrada

### 5. Erros de Conflito (409)
- Recursos duplicados
- Constraint violations

### 6. Erros de Servidor (500)
- Erros inesperados
- Falhas de conexão

## Códigos de Erro Padronizados

```javascript
// Autenticação
'MISSING_TOKEN'
'INVALID_TOKEN'
'EXPIRED_TOKEN'
'INVALID_CREDENTIALS'

// Autorização
'ACCESS_DENIED'
'ADMIN_ACCESS_REQUIRED'
'SUPPLIER_ACCESS_REQUIRED'

// Recursos
'USER_NOT_FOUND'
'PRODUCT_NOT_FOUND'
'ORDER_NOT_FOUND'

// Validação
'VALIDATION_ERROR'
'INVALID_ID_FORMAT'
'DUPLICATE_RESOURCE'

// Sistema
'INTERNAL_SERVER_ERROR'
'ROUTE_NOT_FOUND'
```

## Exemplos de Uso

### Em Controllers

```javascript
// Antes (inconsistente)
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

// Depois (padronizado)
if (!user) {
  throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
}
```

### Em Middleware

```javascript
// Antes
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Admin access required' });
}

// Depois
if (req.user.role !== 'admin') {
  throw new AppError('Acesso de administrador requerido', 403, 'ADMIN_ACCESS_REQUIRED');
}
```

## Configuração de Variáveis de Ambiente

O sistema agora valida todas as variáveis essenciais na inicialização:

```javascript
// src/config/environment.js
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET'
];
```

### Validações de Segurança

- JWT_SECRET deve ter pelo menos 32 caracteres
- DATABASE_URL deve ser uma string de conexão válida
- PORT deve estar entre 1 e 65535

## Logs Estruturados

### Desenvolvimento
- Stack trace completo
- Dados de depuração

### Produção
- Logs estruturados em JSON
- Informações de contexto (IP, rota, timestamp)
- Não exposição de dados sensíveis

## Benefícios

1. **Consistência**: Todas as respostas de erro seguem o mesmo formato
2. **Debugging**: Códigos de erro específicos facilitam a identificação
3. **Segurança**: Não vazamento de informações sensíveis em produção
4. **Manutenibilidade**: Tratamento centralizado reduz duplicação de código
5. **Monitoramento**: Logs estruturados facilitam observabilidade

## Migration Guide

### Atualizando Rotas Existentes

1. Adicione o import do errorHandler:
```javascript
const { asyncHandler, AppError } = require('../middleware/errorHandler');
```

2. Envolva handlers async:
```javascript
router.get('/path', asyncHandler(async (req, res) => {
  // lógica aqui
}));
```

3. Substitua res.status().json() por AppError:
```javascript
// Antes
return res.status(404).json({ error: 'Not found' });

// Depois
throw new AppError('Recurso não encontrado', 404, 'RESOURCE_NOT_FOUND');
```

4. Remova try/catch desnecessários:
```javascript
// Antes
try {
  const result = await someAsyncOperation();
  res.json(result);
} catch (error) {
  res.status(500).json({ error: 'Internal server error' });
}

// Depois (asyncHandler captura automaticamente)
const result = await someAsyncOperation();
res.json({ success: true, data: result });
```