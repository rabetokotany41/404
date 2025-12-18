import React from 'react';
import { Brain, Shield, Globe, Users, Zap, Award, BookOpen, BarChart, CheckCircle, Heart } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'Intelligence Artificielle Avancée',
      description: 'Utilisation de modèles d\'IA pour analyser et vérifier l\'authenticité des contenus en ligne'
    },
    {
      icon: Shield,
      title: 'Protection contre la Désinformation',
      description: 'Système de détection des fake news et contenus trompeurs'
    },
    {
      icon: Globe,
      title: 'Support Multilingue',
      description: 'Analyse des contenus en Malagasy, Français et Anglais'
    },
    {
      icon: Users,
      title: 'Communauté Engagée',
      description: 'Réseau d\'utilisateurs contribuant à la vérification collective'
    },
    {
      icon: Zap,
      title: 'Analyse Rapide',
      description: 'Vérification en temps réel des contenus partagés'
    },
    {
      icon: Award,
      title: 'Fiabilité Élevée',
      description: 'Algorithmes éprouvés avec un taux de précision élevé'
    }
  ];

  const team = [
    {
      name: 'Rakoto Andriana',
      role: 'Expert IA & Fact-Checking',
      bio: 'Spécialiste en analyse des médias avec 10 ans d\'expérience'
    },
    {
      name: 'Rasoa Nomena',
      role: 'Linguiste Computational',
      bio: 'Expert en traitement automatique des langues malgache'
    },
    {
      name: 'Jean Dupont',
      role: 'Développeur Full-Stack',
      bio: 'Architecte de la plateforme Mpanolo-tsaina AI'
    },
    {
      name: 'Sarah Rabe',
      role: 'Designer UX/UI',
      bio: 'Créatrice de l\'expérience utilisateur intuitive'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Contenus Vérifiés' },
    { value: '98%', label: 'Précision d\'Analyse' },
    { value: '50+', label: 'Sources Fiables' },
    { value: '24/7', label: 'Disponibilité' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            À Propos de <span className="text-blue-600 dark:text-blue-400">Mpanolo-tsaina AI</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Notre mission est de combattre la désinformation et de promouvoir la littératie médiatique 
            à travers une intelligence artificielle dédiée à la vérification des faits.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Notre <span className="text-green-600 dark:text-green-400">Mission</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Dans un monde où l'information circule à vitesse grand V, il devient crucial de disposer 
                d'outils fiables pour distinguer le vrai du faux. Mpanolo-tsaina AI ("Assistant Intelligent" 
                en malgache) a été créé pour répondre à ce besoin urgent.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Nous croyons que l'accès à une information vérifiée est un droit fondamental. 
                Notre plateforme utilise des technologies d'intelligence artificielle avancées 
                pour analyser, vérifier et noter la fiabilité des contenus en ligne.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl p-8 text-white">
                <BookOpen className="h-12 w-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Littératie Médiatique</h3>
                <p className="opacity-90">
                  Nous éduquons les utilisateurs à développer leur esprit critique 
                  et à mieux comprendre les mécanismes de l'information numérique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Nos <span className="text-blue-600 dark:text-blue-400">Fonctionnalités</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Découvrez les technologies innovantes qui font de Mpanolo-tsaina AI 
              l'outil de référence pour la vérification des informations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Notre <span className="text-green-600 dark:text-green-400">Équipe</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Une équipe passionnée et multidisciplinaire au service de la vérité numérique.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 p-1">
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Users className="h-10 w-10 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <CheckCircle className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Rejoignez la lutte contre la désinformation
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Ensemble, créons un écosystème numérique plus sain et plus fiable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300">
              Commencer la Vérification
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors duration-300">
              En Savoir Plus
            </button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <span>Fabriqué avec passion à Madagascar</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Mpanolo-tsaina AI. Tous droits réservés.
            Nous nous engageons à respecter la vie privée et à promouvoir une information éthique.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;