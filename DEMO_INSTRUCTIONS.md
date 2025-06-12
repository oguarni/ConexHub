# ConexHub B2B Marketplace - Demo Instructions

## 🚀 Sistema de Cotações Implementado

O sistema de carrinho foi completamente substituído por um **sistema de cotações** mais adequado para o mercado B2B.

## 🔑 Credenciais de Demo

Use as seguintes credenciais para testar diferentes funcionalidades:

### Comprador (Buyer)
- **Email:** `buyer@demo.com`
- **Senha:** `demo123`
- **Funcionalidades:** Adicionar produtos à cotação, calcular frete, finalizar cotações

### Fornecedor (Supplier)
- **Email:** `supplier@demo.com`  
- **Senha:** `demo123`
- **Funcionalidades:** Gerenciar pedidos, atualizar status de pedidos

### Administrador (Admin)
- **Email:** `admin@demo.com`
- **Senha:** `demo123`
- **Funcionalidades:** Todas as funcionalidades + painel administrativo

## ✨ Funcionalidades Principais

### 📋 Sistema de Cotações
- ✅ **Filtros funcionando** - Por categoria (Tools, Raw Materials, Components, etc.) e busca por texto
- ✅ **Adicionar produtos à cotação** - Substitui o carrinho tradicional
- ✅ **Remover produtos da cotação** - Controle total dos itens
- ✅ **Cálculo de frete simulado** - Baseado no CEP com diferentes valores por região
- ✅ **Cálculo de totais** - Subtotal + frete = total

### 💳 Checkout Simulado
- ✅ **Formulário completo** - 4 etapas: dados pessoais, endereço, pagamento, confirmação
- ✅ **Validação de campos** - Todos os campos obrigatórios validados
- ✅ **Métodos de pagamento** - Cartão de crédito e PIX simulados
- ✅ **Geração de ID único** - Cada cotação recebe um ID único (COT-XXXXXXX)

### 📦 Pedidos
- ✅ **Visualização de pedidos** - Lista de cotações finalizadas
- ✅ **Status dos pedidos** - Pendente, Confirmado, Enviado, Entregue
- ✅ **Dados simulados** - Funciona mesmo sem backend

## 🎯 Como Testar

### 1. Filtros de Produtos
1. Faça login com qualquer usuário
2. Use os filtros por categoria no topo da página
3. Digite termos de busca (ex: "furadeira", "motor", "chapa")
4. Observe que os produtos são filtrados em tempo real

### 2. Sistema de Cotações
1. Faça login como **buyer@demo.com**
2. Clique em "Adicionar à Cotação" em qualquer produto
3. Clique no ícone de cotação no header (com contador)
4. Gerencie quantidades, calcule frete e finalize

### 3. Cálculo de Frete
1. Na modal de cotação, digite um CEP (ex: 01234-567)
2. Clique no botão de calcular
3. Observe o valor do frete sendo atualizado

### 4. Checkout Completo
1. Com produtos na cotação, clique em "Finalizar Cotação"
2. Preencha todas as 4 etapas do formulário
3. Escolha entre Cartão de Crédito ou PIX
4. Confirme e receba o ID da cotação

### 5. Visualizar Pedidos
1. Clique no ícone de "Pedidos" no header
2. Veja a lista de cotações finalizadas
3. Como fornecedor, teste as ações de confirmar/cancelar

## 🔧 Dados de Exemplo

O sistema inclui 6 produtos de demonstração:
- Furadeira Industrial HD-2000 (Tools)
- Chapa de Aço Inox 304 (Raw Materials)  
- Motor Elétrico Trifásico 5CV (Components)
- Válvula Pneumática 1/2" (Components)
- Torno CNC Compacto (Machinery)
- Compressor de Ar 50L (Equipment)

## 🚨 Modo Offline

O sistema funciona completamente offline! Se o backend não estiver disponível:
- Produtos de exemplo são carregados
- Login funciona com credenciais de demo
- Pedidos simulados são exibidos
- Todas as funcionalidades permanecem operacionais

## 📝 Mudanças Implementadas

### Arquivos Criados/Modificados:
1. **QuotationContext.js** - Novo contexto para cotações
2. **QuotationModal.js** - Modal principal de cotações
3. **QuotationButton.js** - Botão de cotação no header
4. **CheckoutModal.js** - Atualizado para cotações
5. **OrdersModal.js** - Atualizado com dados simulados
6. **ProductCard.js** - Botão "Adicionar à Cotação"
7. **App.js** - Removido CartProvider, adicionado QuotationProvider
8. **Header.js** - Substituído CartButton por QuotationButton
9. **AppProvider.js** - Produtos e usuários de demonstração

### Funcionalidades Removidas:
- Sistema de carrinho tradicional
- Dependência obrigatória do backend

### Funcionalidades Adicionadas:
- Sistema completo de cotações B2B
- Cálculo de frete simulado
- Checkout em 4 etapas
- Geração de IDs únicos
- Modo offline total