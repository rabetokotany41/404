import React from 'react';

const FooterLink = ({ href, label, icon }) => (
  <li>
    <a
      href={href}
      className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
    >
      {icon && <span className="opacity-60 group-hover:opacity-100">{icon}</span>}
      <span>{label}</span>
    </a>
  </li>
);

export default FooterLink;