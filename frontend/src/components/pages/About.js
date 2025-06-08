import React from 'react';
import { 
  Building, 
  Users, 
  Globe, 
  Award, 
  Shield, 
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Package
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('registeredCompanies') || 'Empresas Cadastradas', value: '1,200+', icon: Building },
    { label: t('availableProducts') || 'Produtos Disponíveis', value: '50,000+', icon: Package },
    { label: t('transactionsCompleted') || 'Transações Realizadas', value: 'R$ 150M+', icon: Globe },
    { label: t('customerSatisfaction') || 'Satisfação do Cliente', value: '98%', icon: Star }
  ];

  const features = [
    {
      icon: Shield,
      title: t('guaranteedSecurity') || 'Segurança Garantida',
      description: t('securityDescription') || 'Todas as transações são protegidas por criptografia de ponta e verificação rigorosa de fornecedores.'
    },
    {
      icon: Truck,
      title: t('integratedLogistics') || 'Logística Integrada',
      description: t('logisticsDescription') || 'Parceria com principais transportadoras para garantir entregas rápidas e seguras em todo o Brasil.'
    },
    {
      icon: Award,
      title: t('certifiedQuality') || 'Qualidade Certificada',
      description: t('qualityDescription') || 'Todos os fornecedores passam por processo de verificação e certificação de qualidade.'
    },
    {
      icon: Users,
      title: t('specializedSupport') || 'Suporte Especializado',
      description: t('supportDescription') || 'Equipe de especialistas em B2B disponível para auxiliar em todas as etapas do processo.'
    }
  ];

  const team = [
    {
      name: 'Dr. Carlos Silva',
      role: t('ceoFounder') || 'CEO & Fundador',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      description: t('carlosDescription') || '20+ anos de experiência em comércio B2B'
    },
    {
      name: 'Ana Costa',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      description: t('anaDescription') || 'Especialista em tecnologia e inovação'
    },
    {
      name: 'João Santos',
      role: t('commercialDirector') || 'Diretor Comercial',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      description: t('joaoDescription') || 'Expert em desenvolvimento de negócios B2B'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('aboutTitle')}
            </h1>
            <p className="text-xl mb-8 text-green-100">
              {t('aboutDescription')} - {t('aboutSubtitle') || 'Conectando indústrias com eficiência, segurança e inovação desde 2020.'}
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 min-w-[200px]">
                  <stat.icon size={32} className="mx-auto mb-3 text-green-300" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-green-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Building size={32} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{t('mission')}</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t('missionText') || 'Democratizar o acesso ao comércio B2B, conectando pequenas e médias empresas a fornecedores qualificados, proporcionando transparência, eficiência e crescimento sustentável para todos os participantes do ecossistema industrial brasileiro.'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Globe size={32} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{t('vision')}</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t('visionText') || 'Ser a principal plataforma de comércio B2B da América Latina, reconhecida pela excelência em conectar empresas, promover inovação e impulsionar o crescimento econômico regional através da tecnologia.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('whyChooseUs') || 'Por que escolher nossa plataforma?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('whyChooseDescription') || 'Oferecemos uma experiência completa e segura para empresas que buscam excelência em seus processos de compra e venda B2B.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('ourTeam') || 'Nossa Equipe'}</h2>
            <p className="text-xl text-gray-600">
              {t('teamDescription') || 'Profissionais experientes dedicados ao seu sucesso'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-green-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{t('contact')}</h2>
              <p className="text-xl text-green-200">
                {t('contactDescription') || 'Entre em contato conosco para começar sua jornada B2B'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('location')}</h3>
                <p className="text-green-200">
                  Av. Paulista, 1000<br />
                  São Paulo - SP<br />
                  CEP: 01310-100
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('phone') || 'Telefone'}</h3>
                <p className="text-green-200">
                  +55 (11) 3000-0000<br />
                  +55 (11) 9 8000-0000<br />
                  {t('support247') || 'Atendimento 24/7'}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('email') || 'Email'}</h3>
                <p className="text-green-200">
                  contato@b2bmarketplace.com<br />
                  suporte@b2bmarketplace.com<br />
                  vendas@b2bmarketplace.com
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-16 bg-green-800/50 rounded-xl p-8">
              <div className="flex items-center justify-center mb-6">
                <Clock size={24} className="mr-3" />
                <h3 className="text-2xl font-bold">{t('businessHours') || 'Horário de Atendimento'}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <p className="font-semibold mb-2">{t('technicalSupport') || 'Suporte Técnico'}</p>
                  <p className="text-green-200">{t('mondayToFriday') || 'Segunda a Sexta'}: 8h às 18h</p>
                  <p className="text-green-200">{t('saturday') || 'Sábado'}: 9h às 14h</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">{t('salesCommercial') || 'Vendas & Comercial'}</p>
                  <p className="text-green-200">{t('mondayToFriday') || 'Segunda a Sexta'}: 8h às 19h</p>
                  <p className="text-green-200">{t('saturday') || 'Sábado'}: 9h às 16h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;