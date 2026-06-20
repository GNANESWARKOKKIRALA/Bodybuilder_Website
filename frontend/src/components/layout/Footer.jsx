import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCrown, FaInstagram, FaYoutube, FaFacebookF, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

const footerLinks = {
  'Quick Links': [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Blog', path: '/blog' },
  ],
  Programs: [
    { name: 'Weight Loss', path: '/services' },
    { name: 'Muscle Building', path: '/services' },
    { name: 'Competition Prep', path: '/services' },
    { name: 'Online Coaching', path: '/services' },
    { name: 'Nutrition Plans', path: '/services' },
  ],
  Resources: [
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Transformations', path: '/transformations' },
    { name: 'Fitness Resources', path: '/resources' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact Us', path: '/contact' },
  ],
};

const socialLinks = [
  { icon: FaInstagram, href: 'https://instagram.com/gnaneswar_bb', label: 'Instagram' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
];

const Footer = () => {
  return (
    <footer className="relative bg-dark-950 border-t border-white/5">
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      <div className="container-custom section-padding !pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <FaCrown className="text-dark-950 text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-wide">
                  <span className="text-gradient-gold">GNANESWAR</span>
                </h3>
                <p className="text-[10px] uppercase tracking-[3px] text-dark-400 -mt-1">Fitness Platform</p>
              </div>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6 max-w-sm">
              Transform your body and mind with India's premier fitness coaching platform.
              Personalized training, nutrition, and coaching from certified professionals.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href !== '#' ? '_blank' : undefined}
                  rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-dark-400 hover:text-gold-400 hover:border-gold-500/30 transition-all duration-300"
                >
                  <social.icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-dark-400 hover:text-gold-400 transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-dark-400">
              <a href="mailto:gapbodybuilder@gmail.com" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <FaEnvelope className="text-gold-600" />
                gapbodybuilder@gmail.com
              </a>
              <a href="tel:+916309764875" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <FaPhone className="text-gold-600" />
                +91 63097 64875
              </a>
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gold-600" />
                India
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-dark-500">
            © {new Date().getFullYear()} Gnaneswar Fitness Platform. All rights reserved. Built with{' '}
            <FaHeart className="inline text-gold-500 text-xs" /> by Gnaneswar
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
