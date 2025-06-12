# 📦 Calculadora de Frete em Pedidos - Guia Completo

## ✅ Nova Funcionalidade Implementada!

Agora você pode **calcular frete simulado** diretamente na tela de pedidos!

## 🎯 Como Funciona

### 1. **Acesse os Pedidos**
- Faça login com qualquer usuário demo
- Clique no ícone "Pedidos" no header
- Visualize a lista de pedidos/cotações

### 2. **Calcule o Frete**
- Localize o pedido desejado
- Na seção "Calcular Frete", digite um CEP de destino
- Clique no botão "Calcular"
- Aguarde o processamento (simula 1.5s de API)

### 3. **Visualize os Resultados**
- **Custo do Frete**: Valor calculado baseado no CEP e produto
- **Prazo de Entrega**: Dias úteis estimados por região
- **Total com Frete**: Valor do produto + frete

## 🧮 Algoritmo de Cálculo

### Fatores Considerados:
1. **Peso do Produto**: 0.5kg por unidade
2. **Região do CEP**: Multiplicadores por estado
3. **Valor do Produto**: Taxa de seguro para produtos > R$ 1.000
4. **Quantidade**: Desconto de 15% para pedidos ≥ 10 unidades

### Multiplicadores por Região:
```
0xxx-xxx (SP Capital): 1.8x
1xxx-xxx (SP Interior): 1.5x
2xxx-xxx (Rio de Janeiro): 1.3x
3xxx-xxx (Minas Gerais): 1.4x
4xxx-xxx (Bahia): 1.6x
5xxx-xxx (Paraná): 1.7x
6xxx-xxx (Pernambuco): 1.9x
7xxx-xxx (Ceará): 1.8x
8xxx-xxx (Pará): 2.0x
9xxx-xxx (Rondônia): 2.2x
```

### Prazos de Entrega:
```
SP Capital: 2 dias úteis
SP Interior: 3 dias úteis
Rio de Janeiro: 3 dias úteis
Minas Gerais: 4 dias úteis
Bahia: 6 dias úteis
Paraná: 4 dias úteis
Pernambuco: 7 dias úteis
Ceará: 8 dias úteis
Pará: 10 dias úteis
Rondônia: 12 dias úteis
```

## 🔧 Funcionalidades Avançadas

### 💾 **Persistência Local**
- Cálculos salvos automaticamente no localStorage
- Resultados mantidos entre sessões
- Não precisa recalcular ao reabrir

### 🔄 **Recalcular Frete**
- Clique no "X" ao lado do resultado
- Digite um novo CEP
- Calcule novamente

### 📱 **Interface Responsiva**
- Funciona em desktop e mobile
- Layout adaptativo
- Campos organizados por tela

## 🧪 CEPs para Teste

### Teste diferentes regiões:
```
01234-567 - São Paulo (frete mais barato, 2 dias)
20123-456 - Rio de Janeiro (frete médio, 3 dias)
30123-456 - Belo Horizonte (frete médio, 4 dias)
40123-456 - Salvador (frete alto, 6 dias)
60123-456 - Fortaleza (frete alto, 8 dias)
80123-456 - Belém (frete muito alto, 10 dias)
```

### Teste com diferentes produtos:
- **Produtos caros** (> R$ 1.000): Taxa de seguro adicional
- **Grandes quantidades** (≥ 10 un): Desconto de 15%
- **Produtos leves vs pesados**: Variação no peso

## 🎯 Exemplos Práticos

### Exemplo 1: Produto Caro + SP
```
Produto: Torno CNC (R$ 45.000)
CEP: 01234-567 (São Paulo)
Resultado: ~R$ 495 (inclui seguro de R$ 450)
Prazo: 2 dias úteis
```

### Exemplo 2: Grande Quantidade + Interior
```
Produto: Parafusos (100 unidades)
CEP: 13000-000 (Campinas)
Resultado: ~R$ 108 (com desconto de 15%)
Prazo: 3 dias úteis
```

### Exemplo 3: Região Distante
```
Produto: Furadeira (2 unidades)
CEP: 69000-000 (Manaus)
Resultado: ~R$ 142
Prazo: 12 dias úteis
```

## 🔄 Integração com Pedidos

### Estados dos Pedidos:
- **Pendente**: Pode calcular frete
- **Confirmado**: Frete calculado é usado para envio
- **Enviado**: Tracking com prazo estimado
- **Entregue**: Histórico completo

### Visão por Usuário:
- **Compradores**: Calculam frete para seus pedidos
- **Fornecedores**: Veem cálculos de frete dos clientes
- **Admins**: Acesso completo a todos os cálculos

## 🎉 Benefícios

1. **Transparência**: Cliente sabe o custo total antes de decidir
2. **Planejamento**: Prazos estimados por região
3. **Flexibilidade**: Pode testar diferentes CEPs
4. **Persistência**: Cálculos salvos localmente
5. **Realismo**: Algoritmo baseado em fatores reais

## 🚀 Como Testar

1. **Login**: Use `buyer@demo.com` / `demo123`
2. **Acesse Pedidos**: Clique no ícone no header
3. **Escolha um Pedido**: Qualquer pedido da lista
4. **Digite CEP**: Use um dos exemplos acima
5. **Calcule**: Clique em "Calcular"
6. **Veja Resultado**: Custo + prazo + total

**Sistema 100% funcional e pronto para uso!** 📦✨