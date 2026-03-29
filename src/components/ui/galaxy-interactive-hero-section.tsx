"use client";

import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import Image from 'next/image';
const Spline = lazy(() => import('@splinetool/react-spline'));

function HeroSplineBackground() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      pointerEvents: 'auto',
      overflow: 'hidden',
    }}>
      <Suspense fallback={<div className="w-full h-full bg-[#080C14]"></div>}>
        <Spline
          style={{
            width: '100%',
            height: '100vh',
            pointerEvents: 'auto',
          }}
          // The splinetool URL from the prompt
          scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
        />
      </Suspense>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(8, 12, 20, 0.9), transparent 30%, transparent 70%, rgba(8, 12, 20, 0.9)),
            linear-gradient(to bottom, transparent 30%, rgba(8, 12, 20, 1))
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function ScreenshotSection({ screenshotRef }: { screenshotRef: React.RefObject<HTMLDivElement> }) {
  return (
    <section className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 mt-11 md:mt-12">
      <div 
        ref={screenshotRef} 
        className="bg-[#050810] rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,229,255,0.15)] border border-[#00E5FF]/30 w-full md:w-[80%] lg:w-[70%] mx-auto"
      >
        <div className="border-b border-[#1A2D45] bg-[#0A0F1A] h-10 flex items-center px-4">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
            </div>
            <div className="mx-auto font-mono text-xs text-[#6B8CAE]">spline-preview.png</div>
        </div>
        <div className="p-2">
          <Image
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
            alt="App Screenshot"
            className="w-full h-auto block rounded-lg mx-auto border border-[#1A2D45]"
            width={2070}
            height={1380}
            priority
          />
        </div>
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <div className="text-left text-[#E8F4FD] pt-16 sm:pt-24 md:pt-32 px-4 max-w-3xl font-sans">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-wide" style={{ fontFamily: '"Space Mono", monospace' }}>
        Elevate your <br className="sm:hidden" />creative workflow<br className="sm:hidden" /> to an art form.
      </h1>
      <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-[#6B8CAE] max-w-xl pr-4">
        Manage all of your media and assets — video, photos, design files, docs, PDFs, and more — on a single secure surface to create and deliver high-quality content faster.
      </p>
      <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
        <button 
          className="bg-[#00E5FF] hover:bg-[#33EBFF] text-[#080C14] font-semibold py-3 px-8 rounded-md transition duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)]"
        >
          Start Free Trial
        </button>
        <button 
          className="pointer-events-auto bg-transparent border-[1.5px] border-[#00E5FF]/30 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 font-semibold py-3 px-8 rounded-md transition duration-300 flex items-center justify-center w-full sm:w-auto"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Watch the Video
        </button>
      </div>
    </div>
  );
}

function Navbar() {
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMouseEnterNavItem = (item: string) => setHoveredNavItem(item);
  const handleMouseLeaveNavItem = () => setHoveredNavItem(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkClass = (itemName: string, extraClasses = '') => {
    const isCurrentItemHovered = hoveredNavItem === itemName;
    const isAnotherItemHovered = hoveredNavItem !== null && !isCurrentItemHovered;

    const colorClass = isCurrentItemHovered
      ? 'text-[#00E5FF]'
      : isAnotherItemHovered
        ? 'text-[#6B8CAE]'
        : 'text-[#E8F4FD]';

    return `text-sm font-medium transition duration-150 ${colorClass} ${extraClasses}`;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 border-b border-[#1A2D45]/50" style={{ backgroundColor: 'rgba(8, 12, 20, 0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="text-[#00E5FF] flex items-center gap-2 font-mono font-bold tracking-widest text-lg">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM12.4306 9.70695C12.742 9.33317 13.2633 9.30058 13.6052 9.62118L19.1798 14.8165C19.4894 15.1054 19.4894 15.5841 19.1798 15.873L13.6052 21.0683C13.2633 21.3889 12.742 21.3563 12.4306 19.9991V9.70695Z" fill="currentColor" />
            </svg>
            AEGIS
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('features')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('features', 'flex items-center')}>
                Features
                <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
              <div className="absolute left-0 mt-2 w-48 bg-[#0D1520] rounded-md shadow-lg py-2 border border-[#1A2D45] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Feature 1</a>
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Feature 2</a>
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Feature 3</a>
              </div>
            </div>

            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('enterprise')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('enterprise', 'flex items-center')}>
                Enterprise
                 <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
              <div className="absolute left-0 mt-2 w-48 bg-[#0D1520] rounded-md shadow-lg py-2 border border-[#1A2D45] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Solution A</a>
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Solution B</a>
              </div>
            </div>

            <div className="relative group" onMouseEnter={() => handleMouseEnterNavItem('resources')} onMouseLeave={handleMouseLeaveNavItem}>
              <a href="#" className={navLinkClass('resources', 'flex items-center')}>
                Resources
                 <svg className="ml-1 w-3 h-3 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </a>
               <div className="absolute left-0 mt-2 w-48 bg-[#0D1520] rounded-md shadow-lg py-2 border border-[#1A2D45] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Blog</a>
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Docs</a>
                <a href="#" className="block px-4 py-2 text-sm text-[#6B8CAE] hover:text-[#00E5FF] hover:bg-[#1A2D45]/30 transition duration-150">Support</a>
              </div>
            </div>

            <a href="#" className={navLinkClass('pricing')} onMouseEnter={() => handleMouseEnterNavItem('pricing')} onMouseLeave={handleMouseLeaveNavItem}>
                Pricing
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <a href="#" className="hidden md:block text-[#6B8CAE] hover:text-[#E8F4FD] text-sm font-medium">Contact Sales</a>
          <a href="#" className="hidden sm:block text-[#6B8CAE] hover:text-[#E8F4FD] text-sm font-medium">Sign In</a>
          <a href="#" className="bg-[#00E5FF] hover:bg-[#33EBFF] text-[#080C14] font-semibold py-2 px-5 rounded-md text-sm md:text-base border-none shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all">Start Free Trial</a>
          <button className="lg:hidden text-[#E8F4FD] p-2" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export const HeroSection = () => {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (screenshotRef.current && heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          if (screenshotRef.current) {
            screenshotRef.current.style.transform = `translateY(-${scrollPosition * 0.5}px)`;
          }

          const maxScroll = 400;
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = opacity.toString();
          }
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative font-sans text-white bg-[#080C14]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
      `}} />
      <Navbar />

      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <HeroSplineBackground />
        </div>

        <div ref={heroContentRef} style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
          display: 'flex', justifyContent: 'flex-start', alignItems: 'center', zIndex: 10, pointerEvents: 'none'
        }}>
          <div className="container mx-auto">
            <HeroContent />
          </div>
        </div>
      </div>

      <div className="bg-[#080C14] relative z-10" style={{ marginTop: '-10vh' }}>
        <ScreenshotSection screenshotRef={screenshotRef} />
        <div className="container mx-auto px-4 py-16 text-[#E8F4FD]">
            <h2 className="text-4xl font-bold text-center mb-8 font-mono">Other Content Below</h2>
             <p className="text-center max-w-xl mx-auto text-[#6B8CAE]">This is where additional sections of your landing page would go.</p>
        </div>
      </div>
    </div>
  );
};
