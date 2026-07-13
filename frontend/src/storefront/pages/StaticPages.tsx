import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Mail, MessageSquare, MapPin, Clock, ExternalLink, ArrowRight } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
import { FadeInSection } from '../../components/motion/FadeInSection';

// Interactive 3D Card component with physical tilt and sweeping glare
interface Stat {
  label: string;
  value: string;
  desc: string;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const [hovered, setHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse coordinates to 3D rotation
  const rotateX = useTransform(y, [-120, 120], [12, -12]);
  const rotateY = useTransform(x, [-120, 120], [-12, 12]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setHovered(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative bg-[#111111] border border-white/10 hover:border-gold/30 p-8 md:p-10 text-center transition-all duration-500 shadow-xl hover:shadow-[0_25px_50px_rgba(201,168,76,0.12)] overflow-hidden cursor-pointer rounded-2xl"
    >
      {/* Glare Sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: hovered ? '100%' : '-100%' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />

      {/* Subtle background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Content with translateZ for depth */}
      <div style={{ transform: 'translateZ(40px)' }} className="space-y-3 relative z-20">
        <p className="font-serif text-4xl font-light text-gold tracking-wide transition-transform duration-300 group-hover:scale-105">
          {stat.value}
        </p>
        <p className="text-[10px] tracking-[0.25em] text-cream/50 uppercase font-semibold">
          {stat.label}
        </p>
        <p className="text-xs text-cream/70 font-light leading-relaxed">
          {stat.desc}
        </p>
      </div>
    </motion.div>
  );
}

export function AboutPage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.25]);

  return (
    <>
      <Helmet>
        <title>About — Exotic by Tausif Ahmed</title>
        <meta name="description" content="The story behind Exotic by Tausif Ahmed — custom bridal designing, Zardozi heritage embroidery, and luxury ethnic couture based in Bhopal." />
      </Helmet>

      <div className="bg-[#0A0A0A] text-cream">
        {/* Parallax Hero */}
        <div className="relative h-[65vh] min-h-[450px] overflow-hidden flex items-end">
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(/brand/img4.png)`,
              y: heroY,
              opacity: heroOpacity
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-[2]" />
          <div className="relative section-container pb-20 z-10 w-full">
            <FadeInSection>
              <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold mb-3">Our Legacy</p>
              <h1 className="text-5xl md:text-7xl font-serif font-light text-white tracking-wide leading-none">About Exotic</h1>
            </FadeInSection>
          </div>
        </div>

        {/* Content Section */}
        <div className="section-container py-20 md:py-28 max-w-5xl space-y-24 md:space-y-32">
          
          {/* Legacy Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] tracking-[0.25em] text-[#C9A84C] uppercase font-medium">A Journey of Passion</span>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-white tracking-wide leading-tight">A Legacy of Zardozi</h2>
              <p className="text-sm text-cream/70 leading-relaxed font-light font-sans">
                Exotic by Tausif Ahmed was founded with a singular commitment: preserving and elevating the timeless art of handcrafted Zardozi. Based in the historic city of Bhopal, Tausif Ahmed brings over 12 years of pristine design craftsmanship to luxury ethnic bridal couture.
              </p>
              <p className="text-sm text-cream/70 leading-relaxed font-light font-sans">
                Every design is a meticulously customized heritage story — woven with gold threads, intricate metallic beads, and fine silks. We operate exclusively by appointment to ensure each bride receives a bespoke, mastercrafted couture experience.
              </p>
            </div>
            <div className="lg:col-span-5 relative group overflow-hidden border border-white/5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full aspect-[4/5] overflow-hidden"
              >
                <img
                  src="/brand/img1.png"
                  alt="Exotic by Tausif Ahmed Bridal Couture work"
                  className="w-full h-full object-cover transition-transform duration-700"
                />
              </motion.div>
              <div className="absolute inset-0 border border-gold/10 pointer-events-none" />
            </div>
          </div>

          {/* 3D Animated Statistics Cards with forced inline margins to prevent overlapping */}
          <div 
            style={{ marginTop: '5rem', marginBottom: '5rem' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              { label: 'Craftsmanship', value: '12+ Yrs', desc: 'Dedicated to traditional Indian Zardozi' },
              { label: 'Collections', value: 'Bespoke', desc: 'Exquisite bridal & luxury ethnic couture' },
              { label: 'Studio trials', value: 'Bhopal', desc: 'Personalized couture trials by appointment' },
            ].map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>

          {/* Couture Philosophy & Director's Note */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center pt-12 md:pt-16">
            <div className="lg:col-span-5 relative group overflow-hidden border border-white/5 order-last lg:order-first">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full aspect-[4/5] overflow-hidden"
              >
                <img
                  src="/brand/img5.png"
                  alt="Crafting Details"
                  className="w-full h-full object-cover transition-transform duration-700"
                />
              </motion.div>
              <div className="absolute inset-0 border border-gold/10 pointer-events-none" />
            </div>
            
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] tracking-[0.25em] text-[#C9A84C] uppercase font-medium">Philosophy</span>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-white tracking-wide leading-tight">The Couture Philosophy</h2>
                <p className="text-sm text-cream/70 leading-relaxed font-light font-sans">
                  We believe in custom craftsmanship over mass production. Every bridal lehenga, sherwani, and sharara suit is created as a masterpiece, tailored specifically to the client's silhouette and personal taste.
                </p>
                <p className="text-sm text-cream/70 leading-relaxed font-light font-sans">
                  Through countless hours of hand-guided needlework, traditional Zardozi embroidery, and the selection of pure fabrics, we give our clients a garment that carries both heritage and unmatched elegance.
                </p>
              </div>

              {/* Quote note style */}
              <div className="bg-[#121212] border-l-2 border-[#C9A84C] p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <span className="absolute top-0 right-1 text-gold/5 font-serif text-[120px] leading-none select-none pointer-events-none font-bold">“</span>
                <p className="font-serif text-sm italic text-cream/90 leading-relaxed font-light mb-4 relative z-10">
                  "Fashion is transient, but heritage is eternal. Our creations are not just garments, but handwoven art designed to be passed down through generations."
                </p>
                <p className="text-[9px] text-[#C9A84C] uppercase tracking-[0.25em] font-medium font-sans">
                  — Tausif Ahmed, Creative Director
                </p>
              </div>
            </div>
          </div>

          {/* Bottom spacer to prevent image touching the footer */}
          <div className="h-16 md:h-28" />

        </div>
      </div>
    </>
  );
}

export function ContactPage() {
  const contactItems = [
    {
      title: 'Email',
      value: 'info@exoticbytausifahmed.com',
      desc: 'For couture orders, corporate requests, or general inquiries.',
      href: 'mailto:info@exoticbytausifahmed.com',
      icon: <Mail size={18} />,
    },
    {
      title: 'WhatsApp',
      value: '+91 98267 04113',
      desc: 'Direct line for bridal trials, pricing, and custom design booking.',
      href: 'https://wa.me/919826704113',
      icon: <MessageSquare size={18} />,
    },
    {
      title: 'Instagram',
      value: '@exotic_bytausifahmed',
      desc: 'Follow us to view behind-the-scenes craft details and campaign updates.',
      href: 'https://www.instagram.com/exotic_bytausifahmed/',
      icon: <InstagramIcon />,
    },
    {
      title: 'Studio',
      value: 'EXOTIC BY TAUSIF AHMED, Bhopal',
      desc: 'Couture design workshop & private trial fittings by appointment.',
      href: 'https://maps.app.goo.gl/TzF3AJPXw1zq1QhC7',
      icon: <MapPin size={18} />,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact — Exotic by Tausif Ahmed</title>
        <meta name="description" content="Reach Exotic by Tausif Ahmed. Book a bespoke bridal couture trial at our Bhopal studio, or contact us via email, WhatsApp, or Instagram." />
      </Helmet>

      <div className="bg-[#0A0A0A] text-cream min-h-screen pb-16">
        {/* Physical spacer to push content below the fixed header navbar */}
        <div className="h-20 md:h-28" />

        <div className="section-container max-w-5xl">
          {/* Luxury Magazine Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
            
            {/* Left Column: Premium Editorial Image Banner */}
            <div className="lg:col-span-5 relative h-[50vh] lg:h-auto min-h-[400px] rounded-3xl overflow-hidden group shadow-2xl flex flex-col justify-end">
              <img 
                src="/brand/img4.png" 
                alt="Exotic Bridal Editorial"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              

            </div>

            {/* Right Column: Minimalist Elegant Contact Details */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-10 pl-0 lg:pl-6 pt-6 lg:pt-0">
              <div>
                <span className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold mb-3 block">Get in Touch</span>
                <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-wide leading-none mb-6">Contact Us</h1>
                <p className="text-xs text-cream/75 leading-relaxed font-light font-sans max-w-md">
                  Whether you wish to schedule a private trial session at our studio, discuss custom bridal silhouette details, or query an order, Tausif Ahmed and our design assistants are here to offer a dedicated bespoke service.
                </p>
              </div>

              <div className="divide-y divide-white/10 border-t border-b border-white/10">
                {contactItems.map((item, i) => (
                  <motion.a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center justify-between py-6 group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="text-gold p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-gold group-hover:text-black transition-all duration-300">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] tracking-[0.2em] text-cream/45 uppercase font-medium">{item.title}</span>
                          <ExternalLink size={10} className="text-cream/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-serif font-light text-white group-hover:text-gold transition-colors leading-tight">{item.value}</p>
                        <p className="text-[10px] text-cream/60 font-light font-sans max-w-xs md:max-w-md">{item.desc}</p>
                      </div>
                    </div>
                    <div className="text-cream/35 group-hover:text-gold transition-all duration-300 transform translate-x-0 group-hover:translate-x-1.5 pr-2">
                      <ArrowRight size={14} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

          </div>

          {/* Embedded Google Map - Clickable to open in Google Maps */}
          <motion.a 
            href="https://maps.app.goo.gl/TzF3AJPXw1zq1QhC7"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-60 md:h-[280px] relative block group cursor-pointer"
          >
            <iframe
              src="https://maps.google.com/maps?q=Exotic,%20VIP%20Road,%20Bhopal&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Exotic Bhopal Location Map"
            />
            {/* Clickable Overlay */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-[10px] tracking-widest text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase font-medium">
                Open in Google Maps
              </div>
            </div>
          </motion.a>

          {/* Bottom spacing before footer */}
          <div className="h-16 md:h-28" />
        </div>
      </div>
    </>
  );
}


export function ShippingPage() {
  return (
    <>
      <Helmet><title>Shipping & Returns — Exotic</title></Helmet>
      <div className="pt-24 section-container py-16 max-w-3xl">
        <FadeInSection>
          <h1 className="text-headline mb-10">Shipping & Returns</h1>
        </FadeInSection>
        <FadeInSection delay={0.1} className="space-y-10">
          {[
            {
              title: 'Delivery',
              content: 'Standard delivery across India takes 3–7 business days. Express delivery (1–2 days) is available in select cities. Orders above ₹2000 ship free. Orders below ₹2000 incur a flat ₹99 shipping fee.',
            },
            {
              title: 'Returns',
              content: 'We accept returns within 30 days of delivery for unworn items with original tags attached. Items must be in original packaging. Sale items are final sale and cannot be returned.',
            },
            {
              title: 'Exchanges',
              content: 'Size exchanges are free of charge within 30 days. Contact us via WhatsApp with your order number to initiate an exchange.',
            },
            {
              title: 'Damaged or Incorrect Items',
              content: 'If you received a damaged or incorrect item, please contact us within 48 hours of delivery with photos. We will arrange a replacement at no additional cost.',
            },
          ].map((section) => (
            <div key={section.title} className="border-b border-graphite pb-8">
              <h2 className="font-serif text-xl font-light mb-3">{section.title}</h2>
              <p className="text-silver leading-relaxed">{section.content}</p>
            </div>
          ))}
        </FadeInSection>
      </div>
    </>
  );
}

export function PrivacyPage() {
  return (
    <>
      <Helmet><title>Privacy Policy — Exotic</title></Helmet>
      <div className="pt-24 section-container py-16 max-w-3xl">
        <FadeInSection>
          <h1 className="text-headline mb-2">Privacy Policy</h1>
          <p className="text-mid text-sm mb-10">Last updated: July 2026</p>
        </FadeInSection>
        <FadeInSection delay={0.1} className="space-y-6 text-silver leading-relaxed">
          <p>Exotic ("we," "us," or "our") is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">Information We Collect</h2>
          <p>We collect your name, phone number, email address, and delivery address when you place an order. We also collect browsing data for analytics purposes.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">How We Use Your Information</h2>
          <p>Your information is used solely to process and deliver your orders, send order updates, and improve our service. We do not sell your data to third parties.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">Contact</h2>
          <p>For privacy concerns, contact us at <a href="mailto:privacy@exotic.in" className="text-gold hover:underline">privacy@exotic.in</a>.</p>
        </FadeInSection>
      </div>
    </>
  );
}

export function TermsPage() {
  return (
    <>
      <Helmet><title>Terms of Service — Exotic</title></Helmet>
      <div className="pt-24 section-container py-16 max-w-3xl">
        <FadeInSection>
          <h1 className="text-headline mb-2">Terms of Service</h1>
          <p className="text-mid text-sm mb-10">Last updated: July 2026</p>
        </FadeInSection>
        <FadeInSection delay={0.1} className="space-y-6 text-silver leading-relaxed">
          <p>By accessing and using Exotic's website, you agree to these Terms of Service.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">Purchases</h2>
          <p>All prices are in Indian Rupees (INR). We reserve the right to refuse or cancel orders at our discretion.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">Intellectual Property</h2>
          <p>All content on this site — including images, text, and design — is the property of Exotic and protected by copyright law.</p>
          <h2 className="font-serif text-xl font-light text-cream mt-8">Contact</h2>
          <p>Questions? Email us at <a href="mailto:legal@exotic.in" className="text-gold hover:underline">legal@exotic.in</a>.</p>
        </FadeInSection>
      </div>
    </>
  );
}

export function SizeGuidePage() {
  const sizes = [
    { size: 'XS', chest: '32–34', waist: '26–28', hip: '34–36' },
    { size: 'S',  chest: '34–36', waist: '28–30', hip: '36–38' },
    { size: 'M',  chest: '36–38', waist: '30–32', hip: '38–40' },
    { size: 'L',  chest: '38–40', waist: '32–34', hip: '40–42' },
    { size: 'XL', chest: '40–42', waist: '34–36', hip: '42–44' },
    { size: 'XXL',chest: '42–44', waist: '36–38', hip: '44–46' },
  ];

  return (
    <>
      <Helmet><title>Size Guide — Exotic</title></Helmet>
      <div className="pt-24 section-container py-16 max-w-3xl">
        <FadeInSection>
          <h1 className="text-headline mb-4">Size Guide</h1>
          <p className="text-silver mb-10">All measurements are in inches. When between sizes, size up.</p>
        </FadeInSection>
        <FadeInSection delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite">
                  {['Size', 'Chest', 'Waist', 'Hip'].map((h) => (
                    <th key={h} className="text-left py-3 pr-6 text-label text-xs text-gold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizes.map((row) => (
                  <tr key={row.size} className="border-b border-graphite/50 hover:bg-graphite/30 transition-colors">
                    <td className="py-3 pr-6 font-medium text-cream">{row.size}</td>
                    <td className="py-3 pr-6 text-silver">{row.chest}"</td>
                    <td className="py-3 pr-6 text-silver">{row.waist}"</td>
                    <td className="py-3 pr-6 text-silver">{row.hip}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInSection>
      </div>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <Helmet><title>404 — Exotic</title></Helmet>
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-8xl font-light text-graphite mb-4">404</p>
        <h1 className="font-serif text-3xl font-light mb-3">Page Not Found</h1>
        <p className="text-silver mb-8 max-w-xs">This page doesn't exist or has been moved.</p>
        <a href="/" className="btn-primary">Back to Home</a>
      </div>
    </>
  );
}
