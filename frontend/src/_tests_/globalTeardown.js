module.exports = async () => {
  console.log('🧹 Limpando ambiente de testes...');
  
  // Cleanup global após todos os testes
  delete process.env.NODE_ENV;
  delete process.env.REACT_APP_API_URL;
  
  console.log('✅ Ambiente de testes limpo');
};