import React from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Shield, 
  Users,
  Star,
  Package,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t('securedTransactions') || 'Transações Seguras',
      description: t('securedTransactionsDesc') || 'Proteção completa em todas as suas negociações'
    },
    {
      icon: Users,
      title: t('verifiedSuppliers') || 'Fornecedores Verificados',
      description: t('verifiedSuppliersDesc') || 'Parceiros confiáveis e qualificados'
    },
    {
      icon: TrendingUp,
      title: t('competitivePrices') || 'Preços Competitivos',
      description: t('competitivePricesDesc') || 'Melhores condições do mercado B2B'
    },
    {
      icon: Package,
      title: t('fastDelivery') || 'Entrega Rápida',
      description: t('fastDeliveryDesc') || 'Logística integrada e eficiente'
    }
  ];

  const stats = [
    { number: '1,200+', label: t('registeredCompanies') || 'Empresas Cadastradas' },
    { number: '50,000+', label: t('availableProducts') || 'Produtos Disponíveis' },
    { number: 'R$ 150M+', label: t('transactionsVolume') || 'Volume de Transações' },
    { number: '98%', label: t('customerSatisfaction') || 'Satisfação dos Clientes' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('welcomeTitle') || 'Bem-vindo ao B2B Marketplace'}
            </h1>
            <p className="text-xl mb-8 text-green-100">
              {t('welcomeSubtitle') || 'A plataforma que conecta empresas com eficiência, segurança e inovação'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center justify-center">
                {t('startNow') || 'Começar Agora'}
                <ArrowRight size={20} className="ml-2" />
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-900 transition-colors duration-300">
                {t('learnMore') || 'Saiba Mais'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('whyChooseUs') || 'Por que escolher nossa plataforma?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('platformAdvantages') || 'Oferecemos uma experiência completa e segura para suas necessidades B2B'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-2xl transition-shadow duration-300">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              {t('readyToStart') || 'Pronto para começar?'}
            </h2>
            <p className="text-xl mb-8 text-green-200">
              {t('joinThousands') || 'Junte-se a milhares de empresas que já confiam em nossa plataforma'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center justify-center">
                <ShoppingCart size={20} className="mr-2" />
                {t('createAccount') || 'Criar Conta'}
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-900 transition-colors duration-300">
                {t('viewDemo') || 'Ver Demonstração'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;