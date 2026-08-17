import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Globe, Share2, ExternalLink, Heart } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Contests', path: '/contests' },
    { label: 'Practice', path: '/practice' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Submissions', path: '/submissions' },
  ],
  Resources: [
    { label: 'Documentation', path: '#' },
    { label: 'API Reference', path: '#' },
    { label: 'Platform Status', path: '#' },
  ],
  Company: [
    { label: 'About CodeArena', path: '#' },
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
    { label: 'Community Guidelines', path: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-theme bg-theme-surface mt-20 pt-16 pb-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-theme">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 text-decoration-none">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Code2 size={20} className="text-white" />
              </div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                CodeArena
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-theme-muted max-w-sm leading-relaxed">
              The modern competitive programming platform built for colleges, competitive coders, and the next generation of engineers.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { icon: <Globe size={16} />, href: '#', label: 'Website' },
                { icon: <Share2 size={16} />, href: '#', label: 'Share' },
                { icon: <ExternalLink size={16} />, href: '#', label: 'Links' },
              ].map((item) => (

                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="h-8.5 w-8.5 rounded-xl border border-theme bg-theme-card flex items-center justify-center text-theme-muted hover:text-blue-500 hover:border-blue-500/40 transition-colors"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-bold text-theme-main uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-theme-muted hover:text-theme-main transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
          <p>© {new Date().getFullYear()} CodeArena. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart size={13} className="text-rose-500 fill-rose-500" /> for passionate developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
