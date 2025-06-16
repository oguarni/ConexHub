#!/bin/bash
set -e

echo "🔒 Script de Remoção de Secrets - git-filter-repo"
echo "================================================"

# Variáveis
REPO_DIR="/home/guarnieri/Desktop/Comércio Eletrônico/MarketPlace_B2B/B2B"
BACKUP_DIR="${REPO_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
FILTER_REPO="$REPO_DIR/backend/git-filter-repo"

# Função para criar backup
create_backup() {
    echo "📦 Criando backup em: $BACKUP_DIR"
    cp -r "$REPO_DIR" "$BACKUP_DIR"
    echo "✅ Backup criado com sucesso"
}

# Função para validar pré-requisitos
validate_prerequisites() {
    echo "🔍 Validando pré-requisitos..."
    
    if [ ! -f "$FILTER_REPO" ]; then
        echo "❌ git-filter-repo não encontrado em: $FILTER_REPO"
        exit 1
    fi
    
    if [ ! -d "$REPO_DIR/.git" ]; then
        echo "❌ Não é um repositório Git válido: $REPO_DIR"
        exit 1
    fi
    
    echo "✅ Pré-requisitos validados"
}

# Função para substituir secrets usando git-filter-repo
replace_secrets() {
    echo "🔄 Removendo secrets do histórico..."
    
    cd "$REPO_DIR"
    
    # Script Python inline para substituições
    cat > replace_secrets_filter.py << 'EOF'
#!/usr/bin/env python3
import re
import git_filter_repo as fr

def blob_callback(blob):
    if not blob.data:
        return
    
    try:
        # Tenta decodificar como texto
        content = blob.data.decode('utf-8')
        original_content = content
        
        # Lista de substituições de segurança
        replacements = [
            # JWT secrets hardcoded
            (r'your-super-secret-jwt-key-change-in-production', 'process.env.JWT_SECRET'),
            (r'your-secret-key', 'process.env.JWT_SECRET'),
            
            # Database credentials
            (r'postgresql://postgres:password@postgres:5432', 'postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}'),
            (r'postgresql://postgres:password@localhost:5434', 'postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}'),
            
            # Admin emails hardcoded
            (r'admin@b2bmarketplace\.com', 'process.env.ADMIN_EMAIL'),
            
            # Console logs com dados sensíveis
            (r'console\.log\([\'"].*password.*[\'"].*\)', '// Sensitive log removed'),
            (r'console\.log\([\'"].*secret.*[\'"].*\)', '// Sensitive log removed'),
            (r'console\.log\([\'"].*token.*[\'"].*\)', '// Sensitive log removed'),
            
            # Remove comentários com TODOs de segurança
            (r'// TODO: change this secret in production', '// Security: Using environment variables'),
            (r'// FIXME: hardcoded secret', '// Security: Using environment variables'),
        ]
        
        # Aplica substituições
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
        # Se houve mudanças, atualiza o blob
        if content != original_content:
            blob.data = content.encode('utf-8')
            
    except UnicodeDecodeError:
        # Arquivo binário, pula
        pass

# Configurações do filtro
args = fr.FilteringOptions.parse_args(['--force'])
fr.RepoFilter(args, blob_callback=blob_callback).run()
EOF
    
    chmod +x replace_secrets_filter.py
    
    # Executa o filtro
    python3 replace_secrets_filter.py
    
    # Remove script temporário
    rm -f replace_secrets_filter.py
    
    echo "✅ Secrets removidos do histórico"
}

# Função para remover arquivos sensíveis
remove_sensitive_files() {
    echo "🗑️  Removendo arquivos sensíveis..."
    
    cd "$REPO_DIR"
    
    # Lista de padrões de arquivos sensíveis
    sensitive_patterns=(
        "*.log"
        "*.env"
        "*.key"
        "*.pem"
        "*.p12"
        "*.pfx"
        "secrets.json"
        "credentials.json"
        "private.json"
        ".DS_Store"
        "Thumbs.db"
        "desktop.ini"
        "*.tmp"
        "*.bak"
        "*.swp"
        "*.swo"
        "*~"
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        echo "  🔍 Procurando: $pattern"
        
        # Usando git-filter-repo para remover arquivos que correspondem ao padrão
        if "$FILTER_REPO" --path-glob "$pattern" --invert-paths --force --dry-run 2>/dev/null | grep -q "New history"; then
            "$FILTER_REPO" --path-glob "$pattern" --invert-paths --force
            echo "    ✅ Removido: $pattern"
        else
            echo "    ℹ️  Não encontrado: $pattern"
        fi
    done
}

# Função para validar limpeza
validate_cleanup() {
    echo "🔍 Validando limpeza..."
    
    cd "$REPO_DIR"
    
    # Verifica se ainda existem secrets no histórico
    secrets_found=0
    
    patterns_to_check=(
        "your-super-secret-jwt-key"
        "your-secret-key"
        "password@postgres"
        "postgresql://postgres:password"
    )
    
    for pattern in "${patterns_to_check[@]}"; do
        if git log --all -p | grep -qi "$pattern"; then
            echo "⚠️  Ainda encontrado no histórico: $pattern"
            secrets_found=1
        fi
    done
    
    if [ $secrets_found -eq 0 ]; then
        echo "✅ Validação concluída - nenhum secret encontrado no histórico"
        return 0
    else
        echo "❌ Validação falhou - secrets ainda presentes"
        return 1
    fi
}

# Função para criar relatório
create_report() {
    echo "📄 Criando relatório de segurança..."
    
    cat > "$REPO_DIR/SECURITY_CLEANUP_REPORT.md" << EOF
# Relatório de Limpeza de Segurança

**Data:** $(date '+%Y-%m-%d %H:%M:%S')  
**Ferramenta:** git-filter-repo  
**Backup:** $BACKUP_DIR  

## Vulnerabilidades Removidas

### 🔑 Secrets Hardcoded
- ❌ \`your-super-secret-jwt-key-change-in-production\`
- ❌ \`your-secret-key\` 
- ✅ Substituídos por \`process.env.JWT_SECRET\`

### 🗄️ Credenciais de Banco
- ❌ \`postgresql://postgres:password@...\`
- ✅ Substituído por variáveis de ambiente

### 📧 Emails Administrativos  
- ❌ \`admin@b2bmarketplace.com\`
- ✅ Substituído por \`process.env.ADMIN_EMAIL\`

### 📁 Arquivos Sensíveis Removidos
- \`.env\` files
- \`*.log\` files  
- \`*.key\`, \`*.pem\` files
- Arquivos temporários

## ⚠️ Ações Obrigatórias Pós-Limpeza

### 1. Rotacionar Credenciais
\`\`\`bash
# Gerar novo JWT secret (32+ caracteres)
openssl rand -base64 32

# Alterar senha do banco de dados
# Gerar novas chaves de API
\`\`\`

### 2. Atualizar Configurações
- [ ] Atualizar \`.env.example\`
- [ ] Configurar CI/CD com novos secrets
- [ ] Verificar variáveis de ambiente em produção

### 3. Force Push (CUIDADO!)
\`\`\`bash
# Verificar mudanças
git log --oneline -10

# Push forçado (coordenar com equipe!)
git push --force-with-lease --all
git push --force-with-lease --tags
\`\`\`

### 4. Implementar Prevenção
- [ ] Instalar git-secrets
- [ ] Configurar pre-commit hooks
- [ ] Implementar revisão de código obrigatória

## Comandos de Verificação

\`\`\`bash
# Verificar se ainda existem secrets
git log --all -p | grep -i "secret\\|password"

# Verificar integridade
git fsck --full

# Verificar tamanho do repositório
git count-objects -vH
\`\`\`

## 📦 Restauração de Backup (se necessário)

\`\`\`bash
# Remover diretório atual
rm -rf "$REPO_DIR"

# Restaurar backup
mv "$BACKUP_DIR" "$REPO_DIR"
\`\`\`

---
**⚠️ IMPORTANTE:** O histórico do Git foi reescrito. Todos os colaboradores devem fazer fresh clone do repositório.
EOF

    echo "✅ Relatório criado: SECURITY_CLEANUP_REPORT.md"
}

# Função principal
main() {
    echo
    echo "⚠️  AVISO IMPORTANTE:"
    echo "   • Esta operação irá REESCREVER o histórico do Git"
    echo "   • Todos os colaboradores precisarão fazer fresh clone"
    echo "   • Um backup será criado automaticamente"
    echo "   • Force push será necessário para aplicar mudanças"
    echo
    
    read -p "Deseja continuar? (digite 'CONFIRMO' para prosseguir): " confirmation
    
    if [ "$confirmation" != "CONFIRMO" ]; then
        echo "❌ Operação cancelada pelo usuário"
        exit 1
    fi
    
    echo
    echo "🚀 Iniciando limpeza de segurança..."
    
    # Executa etapas
    validate_prerequisites
    create_backup
    replace_secrets
    remove_sensitive_files
    
    if validate_cleanup; then
        create_report
        echo
        echo "🎉 Limpeza de segurança concluída com sucesso!"
        echo "📦 Backup: $BACKUP_DIR"
        echo "📄 Relatório: $REPO_DIR/SECURITY_CLEANUP_REPORT.md"
        echo
        echo "⚠️  PRÓXIMOS PASSOS:"
        echo "   1. Revisar o relatório de segurança"
        echo "   2. Rotacionar todas as credenciais"
        echo "   3. Coordenar force push com a equipe"
        echo "   4. git push --force-with-lease --all"
    else
        echo
        echo "❌ Limpeza falhou na validação"
        echo "📦 Backup disponível: $BACKUP_DIR"
        exit 1
    fi
}

# Executa se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi