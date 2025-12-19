import React from 'react';
import { 
  Heart, Coffee, Rocket, 
  Shield, Globe, MessageSquare, Star, Code,
  Twitter, Github, Linkedin, Figma,
  Mail, Phone, MapPin, ExternalLink,
  MessageCircle
} from 'lucide-react';
import ChatButton from './ChatButton';
import FooterLink from './FooterLink';
import SocialLink from './SocialLink';

const Footer = ({ currentUser, isAuthenticated, onLogout }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-gradient-to-br from-white to-white/80 dark:from-neutral-900 dark:to-neutral-900/80 backdrop-blur-xl border-t border-white/40 dark:border-neutral-800/60">
        {/* Top Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    NexusAdmin
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Dashboard Premium</p>
                </div>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                Une plateforme d&apos;administration moderne et intuitive pour gérer vos projets efficacement.
              </p>
              <div className="flex items-center space-x-4">
                <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
                <SocialLink href="#" icon={<Github className="h-5 w-5" />} label="GitHub" />
                <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
                <SocialLink href="#" icon={<Figma className="h-5 w-5" />} label="Figma" />
              </div>
            </div>

            {/* Links Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Navigation</h3>
              <ul className="space-y-3">
                <FooterLink href="/" label="Accueil" />
                <FooterLink href="/services" label="Services" />
                <FooterLink href="/portfolio" label="Portfolio" />
                <FooterLink href="/contact" label="Contact" />
                <FooterLink href="/messages" label="Messages" />
                {currentUser?.role === 'admin' && (
                  <FooterLink href="/admin" label="Tableau de bord" />
                )}
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Ressources</h3>
              <ul className="space-y-3">
                <FooterLink href="/api-docs" label="Documentation API" icon={<Code className="h-4 w-4" />} />
                <FooterLink href="/changelog" label="Changelog" icon={<Rocket className="h-4 w-4" />} />
                <FooterLink href="/security" label="Sécurité" icon={<Shield className="h-4 w-4" />} />
                <FooterLink href="/status" label="Statut" icon={<Globe className="h-4 w-4" />} />
                <FooterLink href="/support" label="Support" icon={<MessageSquare className="h-4 w-4" />} />
                <FooterLink href="/contribute" label="Contribuer" icon={<Star className="h-4 w-4" />} />
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Email</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">support@nexusadmin.com</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-secondary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Téléphone</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">+33 1 23 45 67 89</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Adresse</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Paris, France</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Restez informé
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Recevez les dernières mises à jour et nouveautés directement dans votre boîte mail.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300">
                  S&apos;abonner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

              {/* Copyright */}
              <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span>© {currentYear} NexusAdmin. Tous droits réservés.</span>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center space-x-2">
                  <span>Fait avec</span>
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  <span>et</span>
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <span>par</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">L&apos;équipe Nexus</span>
                </div>
              </div>

              {/* Legal */}
              <div className="flex items-center space-x-6 text-sm">
                <a href="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Politique de confidentialité
                </a>
                <a href="/terms" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Conditions d&apos;utilisation
                </a>
                <a href="/cookies" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Cookies
                </a>
                <a href="/legal" className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  <span>Mentions légales</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button Component */}
      <ChatButton 
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
      />
    </footer>
  );
};

export default Footer;