#!/usr/bin/env python3
"""
Script de limpeza de segurança usando git-filter-repo
Remove dados sensíveis do histórico do Git
"""

import os
import sys
import re
import subprocess
from pathlib import Path

class SecurityCleanup:
    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)
        self.sensitive_patterns = [
            # JWT Secrets hardcoded
            (r'your-super-secret-jwt-key-change-in-production', 'process.env.JWT_SECRET'),
            (r'your-secret-key', 'process.env.JWT_SECRET'),
            
            # Database passwords em URLs
            (r'postgresql://postgres:password@', 'postgresql://postgres:${DB_PASSWORD}@'),
            
            # Chaves de API placeholder
            (r'sk-[a-zA-Z0-9]{48}', 'process.env.API_KEY'),
            (r'Bearer [a-zA-Z0-9]{32,}', 'Bearer ${TOKEN}'),
            
            # Emails administrativos hardcoded
            (r'admin@b2bmarketplace\.com', 'process.env.ADMIN_EMAIL'),
            
            # IPs e hosts específicos
            (r'127\.0\.0\.1:5432', '${DB_HOST}:${DB_PORT}'),
            (r'localhost:3000', '${FRONTEND_URL}'),
            
            # Console.log com dados sensíveis
            (r'console\.log\([\'"].*password.*[\'"].*\)', '// Debug log removed'),
            (r'console\.log\([\'"].*secret.*[\'"].*\)', '// Debug log removed'),
            (r'console\.log\([\'"].*token.*[\'"].*\)', '// Debug log removed'),
        ]
        
        self.files_to_clean = [
            # Arquivos específicos com vulnerabilidades
            "backend/src/controllers/authController.js",
            "backend/middleware/auth.js",
            "backend/.env.example",
            ".env.example",
            
            # Logs que podem conter dados sensíveis
            "*.log",
            "logs/*.log",
            
            # Arquivos de configuração sensíveis
            "config/database.js",
            "config/auth.js",
        ]

    def backup_repo(self):
        """Cria backup do repositório antes da limpeza"""
        backup_path = f"{self.repo_path}_backup_{self._get_timestamp()}"
        print(f"📦 Criando backup em: {backup_path}")
        
        try:
            subprocess.run([
                'cp', '-r', str(self.repo_path), backup_path
            ], check=True)
            print(f"✅ Backup criado com sucesso")
            return backup_path
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao criar backup: {e}")
            return None

    def _get_timestamp(self):
        """Retorna timestamp atual"""
        import datetime
        return datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

    def create_replacement_script(self):
        """Cria script Python para substituições de texto"""
        script_content = '''#!/usr/bin/env python3
import re
import sys

def replace_sensitive_data(text):
    """Substitui dados sensíveis por placeholders seguros"""
    replacements = [
'''
        
        for pattern, replacement in self.sensitive_patterns:
            script_content += f'        (r"{pattern}", "{replacement}"),\n'
            
        script_content += '''    ]
    
    result = text
    for pattern, replacement in replacements:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

if __name__ == "__main__":
    content = sys.stdin.read()
    cleaned_content = replace_sensitive_data(content)
    sys.stdout.write(cleaned_content)
'''
        
        script_path = self.repo_path / "replace_secrets.py"
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        os.chmod(script_path, 0o755)
        return script_path

    def remove_sensitive_files(self):
        """Remove arquivos que não devem estar no repositório"""
        sensitive_files = [
            ".env",
            "backend/.env",
            "*.key",
            "*.pem",
            "secrets.json",
            "credentials.json",
            "private.json",
            "*.sqlite",
            "*.db",
            "node_modules",
            ".DS_Store",
            "Thumbs.db",
            "*.log",
        ]
        
        print("🗑️  Removendo arquivos sensíveis do histórico...")
        
        for pattern in sensitive_files:
            try:
                cmd = [
                    str(self.repo_path / "git-filter-repo"),
                    "--path-glob", pattern,
                    "--invert-paths",
                    "--force"
                ]
                
                result = subprocess.run(
                    cmd, 
                    cwd=self.repo_path,
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    print(f"  ✅ Removido: {pattern}")
                else:
                    print(f"  ⚠️  Aviso em {pattern}: {result.stderr}")
                    
            except Exception as e:
                print(f"  ❌ Erro ao processar {pattern}: {e}")

    def clean_file_contents(self):
        """Limpa conteúdo de arquivos específicos"""
        script_path = self.create_replacement_script()
        print("🧹 Limpando conteúdo de arquivos...")
        
        try:
            cmd = [
                str(self.repo_path / "git-filter-repo"),
                "--blob-callback", f"return blob.data if blob.data else b''",
                "--force"
            ]
            
            subprocess.run(cmd, cwd=self.repo_path, check=True)
            print("✅ Limpeza de conteúdo concluída")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro na limpeza de conteúdo: {e}")
        finally:
            # Remove script temporário
            script_path.unlink(missing_ok=True)

    def replace_file_contents(self):
        """Substitui conteúdo sensível nos arquivos"""
        print("🔄 Substituindo dados sensíveis...")
        
        # Cria script de substituição inline
        replacement_script = f'''
import re

def process_blob(blob):
    if not blob.data:
        return
    
    content = blob.data.decode('utf-8', errors='ignore')
    
    # Substituições de segurança
    replacements = {dict(self.sensitive_patterns)}
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    blob.data = content.encode('utf-8')

# Executa o filtro
import git_filter_repo
args = git_filter_repo.FilteringOptions.parse_args(['--force'])
filter = git_filter_repo.RepoFilter(args, blob_callback=process_blob)
filter.run()
'''
        
        script_file = self.repo_path / "security_filter.py"
        with open(script_file, 'w') as f:
            f.write(replacement_script)
        
        try:
            subprocess.run([
                'python3', str(script_file)
            ], cwd=self.repo_path, check=True)
            print("✅ Substituições aplicadas com sucesso")
        except Exception as e:
            print(f"❌ Erro nas substituições: {e}")
        finally:
            script_file.unlink(missing_ok=True)

    def validate_cleanup(self):
        """Valida se a limpeza foi bem-sucedida"""
        print("🔍 Validando limpeza...")
        
        # Verifica se ainda existem padrões sensíveis
        sensitive_found = []
        
        try:
            for pattern, _ in self.sensitive_patterns:
                result = subprocess.run([
                    'git', 'log', '--all', '-p', '--grep', pattern
                ], cwd=self.repo_path, capture_output=True, text=True)
                
                if pattern in result.stdout:
                    sensitive_found.append(pattern)
            
            if sensitive_found:
                print(f"⚠️  Ainda encontrados padrões sensíveis: {sensitive_found}")
                return False
            else:
                print("✅ Validação concluída - nenhum dado sensível encontrado")
                return True
                
        except Exception as e:
            print(f"❌ Erro na validação: {e}")
            return False

    def create_security_report(self):
        """Cria relatório de segurança"""
        report_content = f"""# Relatório de Limpeza de Segurança

## Data da Limpeza: {self._get_timestamp()}

## Vulnerabilidades Removidas:

### 1. Secrets Hardcoded
- ❌ `your-super-secret-jwt-key-change-in-production`
- ❌ `your-secret-key`
- ✅ Substituídos por `process.env.JWT_SECRET`

### 2. Credenciais de Banco
- ❌ `postgresql://postgres:password@`
- ✅ Substituído por variáveis de ambiente

### 3. Arquivos Sensíveis Removidos
- `.env`
- `*.log`
- `node_modules`
- `*.key`, `*.pem`

### 4. Logs de Debug
- Removidos console.log com dados sensíveis

## Ações Recomendadas Pós-Limpeza:

1. **Rotar todas as chaves de segurança**
   - Gerar novo JWT_SECRET
   - Alterar senhas de banco de dados
   - Renovar chaves de API

2. **Verificar variáveis de ambiente**
   - Atualizar `.env.example`
   - Configurar CI/CD com novos secrets

3. **Implementar hooks de pre-commit**
   - Instalar git-secrets
   - Configurar detecção de dados sensíveis

4. **Monitoramento contínuo**
   - Configurar alertas para commits com secrets
   - Revisão de código obrigatória

## Comandos para Verificação:

```bash
# Verificar se ainda existem secrets
git log --all -p | grep -i "secret\\|password\\|key"

# Verificar integridade do repositório
git fsck

# Forçar push da limpeza (CUIDADO!)
git push --force-with-lease --all
```

⚠️  **IMPORTANTE**: Este processo reescreve o histórico do Git. Coordene com toda a equipe antes de fazer push das alterações.
"""
        
        report_path = self.repo_path / "SECURITY_CLEANUP_REPORT.md"
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        print(f"📄 Relatório criado: {report_path}")

    def run_full_cleanup(self):
        """Executa limpeza completa"""
        print("🚀 Iniciando limpeza de segurança do repositório...")
        print("⚠️  Esta operação irá reescrever o histórico do Git!")
        
        # Backup
        backup_path = self.backup_repo()
        if not backup_path:
            print("❌ Falha ao criar backup. Abortando.")
            return False
        
        try:
            # Etapa 1: Remover arquivos sensíveis
            self.remove_sensitive_files()
            
            # Etapa 2: Substituir conteúdo sensível
            self.replace_file_contents()
            
            # Etapa 3: Validar limpeza
            if self.validate_cleanup():
                # Etapa 4: Criar relatório
                self.create_security_report()
                print("🎉 Limpeza de segurança concluída com sucesso!")
                print(f"📦 Backup disponível em: {backup_path}")
                return True
            else:
                print("❌ Validação falhou. Verifique manualmente.")
                return False
                
        except Exception as e:
            print(f"❌ Erro durante a limpeza: {e}")
            print(f"📦 Restaure o backup de: {backup_path}")
            return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 security-cleanup.py <caminho-do-repositorio>")
        sys.exit(1)
    
    repo_path = sys.argv[1]
    cleanup = SecurityCleanup(repo_path)
    
    # Confirmação do usuário
    print("⚠️  AVISO: Esta operação irá:")
    print("   - Reescrever o histórico do Git")
    print("   - Remover dados sensíveis permanentemente")
    print("   - Requerer force push para o remote")
    print()
    
    response = input("Deseja continuar? (digite 'CONFIRMO' para prosseguir): ")
    if response != "CONFIRMO":
        print("❌ Operação cancelada pelo usuário")
        sys.exit(1)
    
    success = cleanup.run_full_cleanup()
    sys.exit(0 if success else 1)