#!/usr/bin/env node
/**
 * Script para validar configuração do ambiente
 * Uso: npm run validate-config
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader(title) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize(title.toUpperCase(), 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));
}

function printSection(title) {
  console.log('\n' + colorize(`📋 ${title}`, 'blue'));
  console.log(colorize('-'.repeat(40), 'blue'));
}

function printSuccess(message) {
  console.log(`${colorize('✅', 'green')} ${message}`);
}

function printError(message) {
  console.log(`${colorize('❌', 'red')} ${message}`);
}

function printWarning(message) {
  console.log(`${colorize('⚠️ ', 'yellow')} ${message}`);
}

function printInfo(message) {
  console.log(`${colorize('ℹ️ ', 'blue')} ${message}`);
}

async function validateConfiguration() {
  printHeader('Validação de Configuração - B2B Marketplace');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  try {
    // 1. Verificar se arquivo .env existe
    printSection('Arquivos de Configuração');
    
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    
    // Skip .env file check in Docker environment
    const isDocker = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:');
    
    if (fs.existsSync(envPath)) {
      printSuccess('Arquivo .env encontrado');
    } else if (isDocker) {
      printInfo('Executando em Docker - variáveis de ambiente carregadas pelo container');
    } else {
      printError('Arquivo .env não encontrado');
      printInfo('Execute: cp .env.example .env');
      hasErrors = true;
    }
    
    if (fs.existsSync(envExamplePath)) {
      printSuccess('Arquivo .env.example encontrado');
    } else {
      printWarning('Arquivo .env.example não encontrado');
      hasWarnings = true;
    }
    
    // 2. Tentar carregar configuração
    printSection('Validação de Configuração');
    
    try {
      const { default: config } = await import('../src/config/index.js');
      printSuccess('Configuração carregada com sucesso');
      
      // 3. Validações específicas
      printSection('Validações de Segurança');
      
      // JWT Secret
      if (config.JWT_SECRET) {
        if (config.JWT_SECRET.length >= 32) {
          printSuccess('JWT_SECRET tem comprimento adequado');
        } else {
          printError('JWT_SECRET muito curto (mínimo 32 caracteres)');
          hasErrors = true;
        }
        
        // Verifica se não é um valor padrão inseguro
        const insecurePatterns = [
          'your-super-secret',
          'your-secret-key',
          'CHANGE_ME',
          'secret',
          'password'
        ];
        
        const isInsecure = insecurePatterns.some(pattern => 
          config.JWT_SECRET.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (isInsecure) {
          printError('JWT_SECRET parece ser um valor padrão inseguro');
          printInfo('Gere um novo: openssl rand -base64 64');
          hasErrors = true;
        } else {
          printSuccess('JWT_SECRET não contém padrões inseguros');
        }
      } else {
        printError('JWT_SECRET não configurado');
        hasErrors = true;
      }
      
      // Database URL
      if (config.DATABASE_URL) {
        if (config.DATABASE_URL.includes('://')) {
          printSuccess('DATABASE_URL tem formato válido');
          
          // Verifica se não tem credenciais hardcoded inseguras
          if (config.DATABASE_URL.includes('password@') || 
              config.DATABASE_URL.includes('postgres:postgres@')) {
            printWarning('DATABASE_URL pode conter credenciais padrão');
            hasWarnings = true;
          }
        } else {
          printError('DATABASE_URL tem formato inválido');
          hasErrors = true;
        }
      } else {
        printError('DATABASE_URL não configurado');
        hasErrors = true;
      }
      
      // Environment
      printSection('Configuração do Ambiente');
      
      console.log(`Ambiente: ${colorize(config.NODE_ENV, 'bright')}`);
      console.log(`Porta: ${colorize(config.PORT, 'bright')}`);
      console.log(`Frontend URL: ${colorize(config.FRONTEND_URL, 'bright')}`);
      
      // Relatório de features
      printSection('Features Habilitadas');
      
      const report = config.getConfigReport();
      
      Object.entries(report.features).forEach(([feature, enabled]) => {
        const status = enabled ? colorize('✅ Habilitado', 'green') : colorize('❌ Desabilitado', 'red');
        console.log(`${feature}: ${status}`);
      });
      
      // Integrações
      printSection('Integrações');
      
      Object.entries(report.integrations).forEach(([integration, configured]) => {
        const status = configured ? colorize('✅ Configurado', 'green') : colorize('⚠️  Não configurado', 'yellow');
        console.log(`${integration}: ${status}`);
        if (!configured) hasWarnings = true;
      });
      
      // Validações específicas por ambiente
      printSection('Validações por Ambiente');
      
      if (config.isProduction()) {
        printInfo('Validações para PRODUÇÃO:');
        
        if (!config.JWT_REFRESH_SECRET) {
          printWarning('JWT_REFRESH_SECRET recomendado em produção');
          hasWarnings = true;
        } else {
          printSuccess('JWT_REFRESH_SECRET configurado');
        }
        
        if (!config.ALLOWED_ORIGINS || config.ALLOWED_ORIGINS.length === 0) {
          printWarning('ALLOWED_ORIGINS recomendado em produção');
          hasWarnings = true;
        } else {
          printSuccess('CORS configurado para produção');
        }
        
        if (!report.integrations.email) {
          printWarning('Configuração de email recomendada em produção');
          hasWarnings = true;
        }
        
      } else if (config.isDevelopment()) {
        printInfo('Ambiente de desenvolvimento detectado');
        printSuccess('Validações básicas aplicadas');
        
      } else if (config.isTest()) {
        printInfo('Ambiente de teste detectado');
        
        if (config.TEST_DATABASE_URL && config.TEST_DATABASE_URL === config.DATABASE_URL) {
          printWarning('TEST_DATABASE_URL deve ser diferente de DATABASE_URL');
          hasWarnings = true;
        } else if (config.TEST_DATABASE_URL) {
          printSuccess('Banco de teste separado configurado');
        }
      }
      
    } catch (configError) {
      printError(`Erro ao carregar configuração: ${configError.message}`);
      
      if (configError.name === 'ConfigurationError') {
        printInfo('Verifique o arquivo .env e corrija os valores inválidos');
      }
      
      hasErrors = true;
    }
    
    // 4. Verificações de arquivo
    printSection('Verificações de Arquivo');
    
    const requiredDirs = ['logs', 'uploads'];
    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, `../${dir}`);
      if (!fs.existsSync(dirPath)) {
        printWarning(`Diretório ${dir}/ não existe`);
        printInfo(`Crie com: mkdir -p ${dir}`);
        hasWarnings = true;
      } else {
        printSuccess(`Diretório ${dir}/ existe`);
      }
    });
    
    // 5. Resultado final
    printSection('Resultado da Validação');
    
    if (hasErrors) {
      printError('Configuração contém ERROS que devem ser corrigidos');
      console.log(colorize('\n🔧 AÇÕES NECESSÁRIAS:', 'yellow'));
      console.log('  1. Corrija os erros listados acima');
      console.log('  2. Configure as variáveis obrigatórias');
      console.log('  3. Execute novamente: npm run validate-config');
      process.exit(1);
    } else if (hasWarnings) {
      printWarning('Configuração válida, mas com alguns avisos');
      console.log(colorize('\n💡 RECOMENDAÇÕES:', 'blue'));
      console.log('  1. Revise os avisos listados acima');
      console.log('  2. Configure integrações opcionais se necessário');
      console.log('  3. Considere as recomendações de segurança');
      process.exit(0);
    } else {
      printSuccess('Configuração VÁLIDA! 🎉');
      console.log(colorize('\n🚀 Pronto para usar!', 'green'));
      process.exit(0);
    }
    
  } catch (error) {
    printError(`Erro inesperado: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Função para gerar configuração segura
async function generateSecureConfig() {
  printHeader('Gerador de Configuração Segura');
  
  const { default: config } = await import('../src/config/index.js');
  
  console.log('🔑 JWT Secrets seguros:');
  console.log(`JWT_SECRET=${config.generateSecureJwtSecret()}`);
  console.log(`JWT_REFRESH_SECRET=${config.generateSecureJwtSecret()}`);
  
  console.log('\n📝 Adicione estas linhas ao seu .env:');
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--generate') || args.includes('-g')) {
    await generateSecureConfig();
  } else {
    await validateConfiguration();
  }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize('❌ Erro fatal:', 'red'), error.message);
    process.exit(1);
  });
}

export { validateConfiguration, generateSecureConfig };