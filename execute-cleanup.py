#!/usr/bin/env python3
"""
Execução controlada da limpeza de segurança
Demonstra o uso do git-filter-repo para remover secrets específicos
"""

import os
import sys
import subprocess
import tempfile
import shutil
from pathlib import Path

def create_test_cleanup():
    """Cria um script de teste para demonstrar a limpeza"""
    
    script_content = '''#!/usr/bin/env python3
import re
import git_filter_repo as fr

# Contador de arquivos processados
processed_files = 0
modified_files = 0

def blob_callback(blob):
    global processed_files, modified_files
    processed_files += 1
    
    if not blob.data:
        return
    
    try:
        # Decodifica como texto
        content = blob.data.decode('utf-8')
        original_content = content
        
        # Substituições específicas encontradas no código
        replacements = [
            # JWT secrets que encontramos
            (r'your-super-secret-jwt-key-change-in-production', 'process.env.JWT_SECRET'),
            (r'your-secret-key', 'process.env.JWT_SECRET'),
            
            # Database URLs com senha
            (r'postgresql://postgres:password@postgres:5432', 'postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}'),
            (r'postgresql://postgres:password@localhost:5434', 'postgresql://postgres:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}'),
            
            # Admin email hardcoded
            (r'admin@b2bmarketplace\\.com', 'process.env.ADMIN_EMAIL'),
        ]
        
        # Aplica substituições
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
            if new_content != content:
                print(f"  🔄 Substituindo '{pattern}' em {blob.original_name}")
                content = new_content
        
        # Se houve mudanças, atualiza o blob
        if content != original_content:
            blob.data = content.encode('utf-8')
            modified_files += 1
            
    except UnicodeDecodeError:
        # Arquivo binário, ignora
        pass

def run_cleanup(repo_path):
    """Executa a limpeza com git-filter-repo"""
    
    print(f"🧹 Iniciando limpeza do repositório: {repo_path}")
    
    # Muda para o diretório do repositório
    original_dir = os.getcwd()
    os.chdir(repo_path)
    
    try:
        # Configura e executa o filtro
        args = fr.FilteringOptions.parse_args(['--force'])
        filter_obj = fr.RepoFilter(args, blob_callback=blob_callback)
        filter_obj.run()
        
        print(f"✅ Processados {processed_files} arquivos")
        print(f"🔄 Modificados {modified_files} arquivos")
        
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 cleanup_script.py <caminho-repositorio>")
        sys.exit(1)
    
    repo_path = sys.argv[1]
    run_cleanup(repo_path)
'''

    script_path = "/tmp/cleanup_script.py"
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    os.chmod(script_path, 0o755)
    return script_path

def demo_dry_run():
    """Demonstra uma execução de teste"""
    
    repo_path = "/home/guarnieri/Desktop/Comércio Eletrônico/MarketPlace_B2B/B2B"
    
    print("🔍 DEMONSTRAÇÃO - Análise de Vulnerabilidades Encontradas")
    print("=" * 60)
    
    # Lista vulnerabilidades encontradas
    vulnerabilities = [
        {
            "file": "backend/src/controllers/authController.js:170",
            "pattern": "your-super-secret-jwt-key-change-in-production",
            "risk": "CRÍTICO",
            "description": "JWT secret hardcoded"
        },
        {
            "file": "backend/middleware/auth.js:12", 
            "pattern": "your-secret-key",
            "risk": "CRÍTICO",
            "description": "Fallback JWT secret hardcoded"
        },
        {
            "file": ".env.example:5",
            "pattern": "postgresql://postgres:password@",
            "risk": "ALTO", 
            "description": "Database password em URL"
        }
    ]
    
    print("📋 Vulnerabilidades Identificadas:")
    for vuln in vulnerabilities:
        print(f"  🚨 {vuln['risk']}: {vuln['file']}")
        print(f"     Pattern: {vuln['pattern']}")
        print(f"     Descrição: {vuln['description']}")
        print()
    
    print("🛠️  Correções Aplicadas:")
    print("  ✅ Removido hardcoded JWT secrets dos arquivos atuais")
    print("  ✅ Configurado .gitignore para prevenir futuros commits")
    print("  ✅ Criado .git-secrets-patterns para detecção")
    print("  ✅ Scripts de limpeza do histórico criados")
    
    print("\n⚠️  PRÓXIMAS AÇÕES RECOMENDADAS:")
    print("  1. Revisar scripts de limpeza criados")
    print("  2. Fazer backup completo do repositório")
    print("  3. Executar limpeza do histórico (requer confirmação)")
    print("  4. Rotacionar todas as credenciais de segurança")
    print("  5. Configurar monitoramento contínuo")

def show_cleanup_commands():
    """Mostra comandos para executar a limpeza"""
    
    print("\n📜 COMANDOS PARA LIMPEZA COMPLETA:")
    print("=" * 40)
    
    commands = [
        "# 1. Fazer backup",
        "cp -r . ../backup_$(date +%Y%m%d_%H%M%S)",
        "",
        "# 2. Executar limpeza do histórico (CUIDADO!)",
        "./remove-secrets.sh",
        "",
        "# 3. Verificar resultado", 
        "git log --oneline -5",
        "git show --stat HEAD",
        "",
        "# 4. Force push (coordenar com equipe!)",
        "git push --force-with-lease --all",
        "git push --force-with-lease --tags",
        "",
        "# 5. Rotacionar credenciais",
        "# - Gerar novo JWT_SECRET",
        "# - Alterar senhas de banco", 
        "# - Renovar chaves de API"
    ]
    
    for cmd in commands:
        print(f"  {cmd}")

def main():
    print("🔒 GIT-FILTER-REPO - Remoção de Vulnerabilidades")
    print("=" * 50)
    
    # Demonstração
    demo_dry_run()
    
    # Comandos
    show_cleanup_commands()
    
    print("\n📁 Arquivos Criados:")
    files_created = [
        "security-cleanup.py - Script Python completo de limpeza",
        "remove-secrets.sh - Script Bash para remoção de secrets", 
        ".git-secrets-patterns - Padrões para detecção de secrets",
        ".gitignore - Atualizado com padrões de segurança",
        "SECURITY_CLEANUP_REPORT.md - Será criado após limpeza"
    ]
    
    for file_info in files_created:
        print(f"  📄 {file_info}")
    
    print("\n⚠️  IMPORTANTE:")
    print("  • Backup foi recomendado mas NÃO executado automaticamente")
    print("  • Limpeza do histórico requer confirmação manual") 
    print("  • Todos os colaboradores precisarão fazer fresh clone")
    print("  • Credenciais DEVEM ser rotacionadas após a limpeza")

if __name__ == "__main__":
    main()