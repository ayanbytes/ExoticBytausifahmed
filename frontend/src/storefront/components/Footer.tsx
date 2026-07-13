import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#0b0b0b] border-t border-gold/15 pt-20 pb-8 text-cream">
      <div className="section-container">

        {/* Centered Brand Signature */}
        <div className="text-center mb-16">
          <Link
            to="/"
            className="inline-block font-serif text-3xl md:text-4xl font-light tracking-[0.25em] text-cream hover:text-gold transition-colors duration-500"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            EXOTIC
          </Link>
          <p className="text-[9px] text-gold uppercase tracking-[0.4em] mt-2 font-sans font-light">
            BY TAUSIF AHMED
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-8 h-px bg-gold/30" />
            <span className="text-[9px] text-mid tracking-[0.25em] uppercase font-light">Maison Bhopal</span>
            <div className="w-8 h-px bg-gold/30" />
          </div>
        </div>

        {/* 3-Column Symmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 pb-16 text-center border-t border-graphite/30 pt-16">

          {/* Column 1: The Studio coordinates */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-label text-gold text-[10px] tracking-[0.2em] uppercase font-semibold">
              The Studio
            </h3>
            <div className="text-xs text-silver leading-relaxed font-light space-y-1">
              <p>Kohefiza, Bhopal, India</p>
              <p>Mon — Sat: 11:00 AM — 8:00 PM</p>
              <p className="text-gold font-normal tracking-wider mt-2 uppercase text-[9px]">
                ✦ By Private Appointment Only ✦
              </p>
            </div>
          </div>

          {/* Column 2: Curated Collections */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-label text-gold text-[10px] tracking-[0.2em] uppercase font-semibold">
              Collections
            </h3>
            <ul className="flex flex-col space-y-2.5 text-xs text-silver font-light">
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors duration-300">
                  All Masterpieces
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bridal-wear" className="hover:text-gold transition-colors duration-300">
                  Zardozi Bridal Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=luxury-ethnic" className="hover:text-gold transition-colors duration-300">
                  Luxury Ethnic Sets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=jewellery" className="hover:text-gold transition-colors duration-300">
                  Bespoke Jewellery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Inquiries */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-label text-gold text-[10px] tracking-[0.2em] uppercase font-semibold">
              Inquiries
            </h3>
            <ul className="flex flex-col space-y-2.5 text-xs text-silver font-light">
              <li>
                <a
                  href="https://wa.me/919039624538"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors duration-300"
                >
                  WhatsApp Consultation
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@exoticbytausifahmed.com"
                  className="hover:text-gold transition-colors duration-300"
                >
                  Email Boutique Salon
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors duration-300">
                  Book Fitting Session
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors duration-300">
                  The Couture Process
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Minimalist Bottom Bar */}
        <div className="border-t border-graphite/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-[9px] text-mid tracking-widest font-light uppercase">
            © 2026 EXOTIC BY TAUSIF AHMED. ALL RIGHTS RESERVED.
          </p>

          {/* Quick links to socials/mail */}
          <div className="flex items-center gap-4 text-[9px] tracking-wider uppercase font-light text-silver">
            <a
              href="https://www.instagram.com/exotic_bytausifahmed/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors duration-300"
            >
              instagram
            </a>
            <span className="text-graphite/50">•</span>
            <a
              href="https://wa.me/919039624538"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors duration-300"
            >
              whatsapp
            </a>
            <span className="text-graphite/50">•</span>
            <a
              href="mailto:contact@exoticbytausifahmed.com"
              className="hover:text-gold transition-colors duration-300"
            >
              email
            </a>
          </div>

          <p className="text-[9px] text-mid tracking-widest font-light uppercase">
            HANDCRAFTED WITH HERITAGE IN INDIA
          </p>
        </div>

      </div>
    </footer>
  );
}
