import React from 'react';
import {
  Brain, Shield, BookOpen, AlertTriangle,
  Globe, Users, Award, TrendingUp,
  Twitter, Github, Linkedin, Youtube,
  Mail, Phone, MapPin, ExternalLink,
  MessageCircle, GraduationCap, CheckCircle
} from 'lucide-react';
import ChatButton from './ChatButton';
import FooterLink from './FooterLink';
import SocialLink from './SocialLink';

const Footer = ({ currentUser, isAuthenticated, onLogout }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-neutral-900 dark:to-primary-950/20 backdrop-blur-xl border-t border-primary-100 dark:border-primary-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    Mpanolo-tsaina AI
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Assistant de Litt&eacute;ratie M&eacute;diatique
                  </p>
                </div>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                Un assistant intelligent qui aide les &eacute;tudiants malgaches &agrave; v&eacute;rifier la fiabilit&eacute;
                des contenus &eacute;ducatifs viraux et &agrave; d&eacute;velopper leur esprit critique.
              </p>
              <div className="flex items-center space-x-4">
                <SocialLink
                  href="https://twitter.com/votre_nom"
                  icon={<Twitter className="h-5 w-5" />}
                  label="Twitter"
                />
                <SocialLink
                  href="https://github.com/ketsyed41"
                  icon={<Github className="h-5 w-5" />}
                  label="GitHub"
                />
                <SocialLink
                  href="https://linkedin.com/in/votre_nom"
                  icon={<Linkedin className="h-5 w-5" />}
                  label="LinkedIn"
                />
                <SocialLink
                  href="https://youtube.com/@votre_chaine"
                  icon={<Youtube className="h-5 w-5" />}
                  label="YouTube"
                />
              </div>
            </div>

            {/* Navigation Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary-500" />
                Navigation
              </h3>
              <ul className="space-y-3">
                <FooterLink href="/" label="Accueil" />
                <FooterLink href="/analyser" label="Analyser un contenu" icon={<CheckCircle className="h-4 w-4" />} />
                <FooterLink href="/formation" label="Formation" icon={<GraduationCap className="h-4 w-4" />} />
                <FooterLink href="/resources" label="Ressources &eacute;ducatives" icon={<BookOpen className="h-4 w-4" />} />
                <FooterLink href="/statistiques" label="Statistiques" icon={<TrendingUp className="h-4 w-4" />} />
                <FooterLink href="/about" label="&Agrave; propos" />
              </ul>
            </div>

            {/* Modules Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-secondary-500" />
                Modules
              </h3>
              <ul className="space-y-3">
                <FooterLink href="/modules/verification" label="V&eacute;rification IA" icon={<Brain className="h-4 w-4" />} />
                <FooterLink href="/modules/biais" label="D&eacute;tection de biais" icon={<AlertTriangle className="h-4 w-4" />} />
                <FooterLink href="/modules/critique" label="Esprit critique" icon={<Users className="h-4 w-4" />} />
                <FooterLink href="/modules/credibilite" label="Analyse de cr&eacute;dibilit&eacute;" icon={<Award className="h-4 w-4" />} />
                <FooterLink href="/api-docs" label="Documentation API" />
                <FooterLink href="/mode-hors-ligne" label="Mode hors-ligne" />
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Contact & Support</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Email</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      yandiepassot@gmail.com
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-secondary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Support</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      +261 38 89 913 56
                    </p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Localisation</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Tsimbazaza, Antananarivo
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-primary-200 dark:border-primary-800">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Restez inform&eacute; sur la litt&eacute;ratie m&eacute;diatique
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Recevez des astuces, des analyses et des ressources &eacute;ducatives en malgache et en fran&ccedil;ais.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Adresse email"
                  className="flex-1 px-4 py-3 rounded-xl border border-primary-300 dark:border-primary-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02]">
                  Mi-abonner
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-200 dark:border-primary-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span>© {currentYear} Mpanolo-tsAIna . Tous droits r&eacute;serv&eacute;s.</span>
                <div className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Un projet pour</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    l&apos;&eacute;ducation num&eacute;rique &agrave; Madagascar
                  </span>
                </div>
              </div>


              <div className="flex items-center space-x-6 text-sm">
                <a href="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Politique de confidentialit&eacute;
                </a>
                <a href="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Conditions d&apos;utilisation
                </a>
                <a href="/opensource" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Open Source
                </a>
                <a href="/credits" className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  <span>Cr&eacute;dits & Partenaires</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-900 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Interface disponible en Malagasy et Fran&ccedil;ais •
                Sp&eacute;cialement con&ccedil;u pour le contexte &eacute;ducatif malgache •
                Powered by AI for Social Good
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button Component - Conserv&eacute; comme demand&eacute; */}
      <ChatButton
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />
    </footer>
  );
};

export default Footer;