import React from 'react';

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 
    flex items-center justify-center text-neutral-600 dark:text-neutral-400 
    hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 
    transition-all duration-300 hover:scale-110"
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
);

export default SocialLink;