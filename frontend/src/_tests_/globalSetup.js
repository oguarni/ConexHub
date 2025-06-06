module.exports = async () => {
  console.log('🧪 Configurando ambiente de testes...');
  
  // Setup global para todos os testes
  process.env.NODE_ENV = 'test';
  process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
  
  console.log('✅ Ambiente de testes configurado');
};