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
  Star
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { label: 'Empresas Cadastradas', value: '1,200+', icon: Building },
    { label: 'Produtos Disponíveis', value: '50,000+', icon: Package },
    { label: 'Transações Realizadas', value: 'R$ 150M+', icon: Globe },
    { label: 'Satisfação do Cliente', value: '98%', icon: Star }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Todas as transações são protegidas por criptografia de ponta e verificação rigorosa de fornecedores.'
    },
    {
      icon: Truck,
      title: 'Logística Integrada',
      description: 'Parceria com principais transportadoras para garantir entregas rápidas e seguras em todo o Brasil.'
    },
    {
      icon: Award,
      title: 'Qualidade Certificada',
      description: 'Todos os fornecedores passam por processo de verificação e certificação de qualidade.'
    },
    {
      icon: Users,
      title: 'Suporte Especializado',
      description: 'Equipe de especialistas em B2B disponível para auxiliar em todas as etapas do processo.'
    }
  ];

  const team = [
    {
      name: 'Dr. Carlos Silva',
      role: 'CEO & Fundador',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      description: '20+ anos de experiência em comércio B2B'
    },
    {
      name: 'Ana Costa',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      description: 'Especialista em tecnologia e inovação'
    },
    {
      name: 'João Santos',
      role: 'Diretor Comercial',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      description: 'Expert em desenvolvimento de negócios B2B'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('aboutTitle')}
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              {t('aboutDescription')} - Conectando indústrias com eficiência, 
              segurança e inovação desde 2020.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 min-w-[200px]">
                  <stat.icon size={32} className="mx-auto mb-3 text-blue-300" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
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
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Building size={32} className="text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{t('mission')}</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                Democratizar o acesso ao comércio B2B, conectando pequenas e médias empresas 
                a fornecedores qualificados, proporcionando transparência, eficiência e 
                crescimento sustentável para todos os participantes do ecossistema industrial brasileiro.
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
                Ser a principal plataforma de comércio B2B da América Latina, 
                reconhecida pela excelência em conectar empresas, promover inovação 
                e impulsionar o crescimento econômico regional através da tecnologia.
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
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos uma experiência completa e segura para empresas que buscam 
              excelência em seus processos de compra e venda B2B.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 rounded-xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nossa Equipe</h2>
            <p className="text-xl text-gray-600">
              Profissionais experientes dedicados ao seu sucesso
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
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{t('contact')}</h2>
              <p className="text-xl text-blue-200">
                Entre em contato conosco para começar sua jornada B2B
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('location')}</h3>
                <p className="text-blue-200">
                  Av. Paulista, 1000<br />
                  São Paulo - SP<br />
                  CEP: 01310-100
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Telefone</h3>
                <p className="text-blue-200">
                  +55 (11) 3000-0000<br />
                  +55 (11) 9 8000-0000<br />
                  Atendimento 24/7
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-800 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Email</h3>
                <p className="text-blue-200">
                  contato@b2bmarketplace.com<br />
                  suporte@b2bmarketplace.com<br />
                  vendas@b2bmarketplace.com
                </p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-16 bg-blue-800/50 rounded-xl p-8">
              <div className="flex items-center justify-center mb-6">
                <Clock size={24} className="mr-3" />
                <h3 className="text-2xl font-bold">Horário de Atendimento</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <p className="font-semibold mb-2">Suporte Técnico</p>
                  <p className="text-blue-200">Segunda a Sexta: 8h às 18h</p>
                  <p className="text-blue-200">Sábado: 9h às 14h</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Vendas & Comercial</p>
                  <p className="text-blue-200">Segunda a Sexta: 8h às 19h</p>
                  <p className="text-blue-200">Sábado: 9h às 16h</p>
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