import React from 'react';
import { Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import { SOCIAL_LINKS } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-background pt-24 pb-12 px-6 md:px-12 border-t border-charcoal/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

        <div className="md:col-span-4 flex flex-col justify-between h-full">
          <div>
            <h2 className="font-serif text-3xl mb-4">Feel free to reach out!</h2>
            <p className="text-charcoal/60 text-lg">
              I'm always open for collaboration and new opportunities :)
            </p>
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-9 flex flex-col gap-6">
          <h3 className="uppercase tracking-widest text-xs font-semibold text-charcoal/40">Connect</h3>
          <div className="flex flex-col gap-4">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-moss transition-colors group">
              <Instagram size={20} className="text-charcoal group-hover:text-moss transition-colors" />
              <span>Instagram</span>
            </a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-moss transition-colors group">
              <Twitter size={20} className="text-charcoal group-hover:text-moss transition-colors" />
              <span>Twitter</span>
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-moss transition-colors group">
              <Linkedin size={20} className="text-charcoal group-hover:text-moss transition-colors" />
              <span>LinkedIn</span>
            </a>
            <a href={SOCIAL_LINKS.email} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-moss transition-colors group">
              <Mail size={20} className="text-charcoal group-hover:text-moss transition-colors" />
              <span>Email Me</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-12 mt-16 pt-8 border-t border-charcoal/5 flex flex-col md:flex-row justify-between items-center text-sm text-charcoal/40">
          <p>Designed by Aditya, Built with Antigravity</p>
          <p> California {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;