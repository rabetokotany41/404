import React from 'react';
import { Brain, Shield, Globe, Users, Zap, Award, BookOpen, BarChart, CheckCircle, Heart } from 'lucide-react';
import { useTranslation } from '../../../contexts/LanguageContext';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: t('about_feature_ai'),
      description: t('about_feature_ai_desc')
    },
    {
      icon: Shield,
      title: t('about_feature_protection'),
      description: t('about_feature_protection_desc')
    },
    {
      icon: Globe,
      title: t('about_feature_multilingual'),
      description: t('about_feature_multilingual_desc')
    },
    {
      icon: Users,
      title: t('about_feature_community'),
      description: t('about_feature_community_desc')
    },
    {
      icon: Zap,
      title: t('about_feature_speed'),
      description: t('about_feature_speed_desc')
    },
    {
      icon: Award,
      title: t('about_feature_reliability'),
      description: t('about_feature_reliability_desc')
    }
  ];

  const team = [
    {
      name: t('about_team_member1_name'),
      role: t('about_team_member1_role'),
      bio: t('about_team_member1_bio')
    },
    {
      name: t('about_team_member2_name'),
      role: t('about_team_member2_role'),
      bio: t('about_team_member2_bio')
    },
    {
      name: t('about_team_member3_name'),
      role: t('about_team_member3_role'),
      bio: t('about_team_member3_bio')
    },
    {
      name: t('about_team_member4_name'),
      role: t('about_team_member4_role'),
      bio: t('about_team_member4_bio')
    }
  ];

  const stats = [
    { value: '10,000+', label: t('about_stats_verified') },
    { value: '98%', label: t('about_stats_accuracy') },
    { value: '50+', label: t('about_stats_sources') },
    { value: '24/7', label: t('about_stats_availability') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 dark:from-neutral-900 dark:to-neutral-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('about_title')} <span className="text-primary-600 dark:text-primary-400">{t('about_subtitle')}</span>
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-10">
            {t('about_description')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.value}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
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
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
                {t('about_mission_title')} <span className="text-secondary-600 dark:text-secondary-400">{t('about_mission_highlight')}</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">
                {t('about_mission_text1')}
              </p>
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                {t('about_mission_text2')}
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
                <BookOpen className="h-12 w-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{t('about_literacy_title')}</h3>
                <p className="opacity-90">
                  {t('about_literacy_text')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-neutral-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('about_features_title')} <span className="text-primary-600 dark:text-primary-400">{t('about_features_highlight')}</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('about_features_description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-300 hover:shadow-xl">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300">
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
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('about_team_title')} <span className="text-secondary-600 dark:text-secondary-400">{t('about_team_highlight')}</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              {t('about_team_description')}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 text-center border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-1">
                  <div className="w-full h-full rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Users className="h-10 w-10 text-neutral-600 dark:text-neutral-300" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <div className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <CheckCircle className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('about_cta_title')}
          </h2>
          <p className="text-xl opacity-90 mb-8">
            {t('about_cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-primary-600 rounded-full font-bold hover:bg-neutral-100 transition-colors duration-300">
              {t('about_cta_start')}
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-colors duration-300">
              {t('about_cta_learn_more')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 mb-4">
            <Heart className="h-5 w-5 text-warning-500 fill-current" />
            <span>{t('about_footer_made_with')}</span>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            {t('about_footer_copyright').replace('{year}', new Date().getFullYear())}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;