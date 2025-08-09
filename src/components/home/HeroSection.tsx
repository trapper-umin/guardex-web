import React from 'react';
import { Link } from 'react-router-dom';
import { LazyMotion, m, domAnimation, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, Zap, DollarSign } from 'lucide-react';
import { ROUTES } from '../../utils/routes';

const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const tapMotion = shouldReduceMotion ? undefined : { scale: 0.98 };

  // Cursor-follow glow state (smoothed)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 120, damping: 30 });
  const glowY = useSpring(mouseY, { stiffness: 120, damping: 30 });

  const handleMouseMove: React.MouseEventHandler<HTMLElement> = (event) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  // Button shine variants
  const wrapperVariants: Variants = shouldReduceMotion
    ? { rest: { scale: 1, y: 0 }, hover: { scale: 1, y: 0 } }
    : { rest: { scale: 1, y: 0 }, hover: { scale: 1.05, y: -2 } };

  const shineVariants: Variants = {
    rest: { x: '-220%', opacity: 0 },
    hover: shouldReduceMotion
      ? { x: '-220%', opacity: 0 }
      : {
          x: '220%',
          opacity: 1,
          transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
        },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        role="region"
        aria-labelledby="hero-title"
        className="group relative min-h-screen md:min-h-[90vh] lg:min-h-[88vh] xl:min-h-[85vh] pt-12 pb-12 md:pb-12 lg:pb-12 xl:pb-10 px-4 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
      {/* Dynamic Background */}
      <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          aria-hidden="true"
        >
        {/* Animated geometric shapes */}
        <div className="absolute inset-0" aria-hidden="true">
          <m.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.25 }
                : { rotate: [0, 360], scale: [1, 1.2, 1] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 20, repeat: Infinity, ease: 'linear' }
            }
            className="absolute top-20 left-20 w-32 h-32 border border-purple-500/30 rounded-full"
          />
          <m.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.2 }
                : { rotate: [360, 0], x: [0, 50, 0] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 15, repeat: Infinity, ease: 'easeInOut' }
            }
            className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg rotate-45"
          />
          <m.div
            animate={
              shouldReduceMotion
                ? { opacity: 0.2 }
                : { y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
            }
            className="absolute bottom-32 left-1/4 w-16 h-16 border-2 border-cyan-400/40 rounded-full"
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, purple 1px, transparent 1px),
                               radial-gradient(circle at 75% 75%, cyan 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              opacity: 0.1
            }} />
          </div>
        </div>
      </div>

      {/* Cursor-follow glow overlay */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <m.div
          style={{ left: glowX, top: glowY }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300 mix-blend-screen"
        >
          <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18)_0%,rgba(168,85,247,0.16)_30%,transparent_65%)] blur-3xl" />
        </m.div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center text-white flex flex-col min-h-screen md:min-h-0 justify-center md:justify-start md:pt-16 lg:pt-24 xl:pt-32">
        {/* Main Title */}
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
                     <h1 id="hero-title" className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 leading-none">
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
               guardex
             </span>
           </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-300" aria-describedby="hero-subtitle">
             VPN маркетплейс нового поколения
            </p>
        </m.div>

        {/* Value Proposition */}
                 <m.p
           variants={fadeUp}
           initial="hidden"
           animate="visible"
           transition={{ duration: 0.8, delay: 0.2 }}
           className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 max-w-3xl mx-auto text-gray-300 leading-relaxed"
           id="hero-subtitle"
         >
          <span className="text-yellow-400 font-bold">Продавайте</span> свои VPN серверы или 
          <span className="text-cyan-400 font-bold"> покупайте</span> доступ к премиум сети
        </m.p>

        {/* CTA Buttons */}
                 <m.div
           variants={fadeUp}
           initial="hidden"
           animate="visible"
           transition={{ duration: 0.8, delay: 0.45 }}
           className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16"
         >
          <m.div
            variants={wrapperVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap={tapMotion}
          >
                         <Link
               to={ROUTES.SELLER_DASHBOARD}
               aria-label="Перейти в кабинет продавца"
               className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg sm:text-xl px-6 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-4 justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
             >
               {/* Shine sweep */}
               <m.span
                 variants={shineVariants}
                 className="pointer-events-none absolute top-0 left-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 blur-sm"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-300 opacity-0 group-hover:opacity-20 transition-opacity" />
               <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
               Начать продавать
               <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
             </Link>
          </m.div>
          
          <m.div
            variants={wrapperVariants}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap={tapMotion}
          >
                         <Link
               to={ROUTES.MARKETPLACE}
               aria-label="Открыть маркетплейс VPN"
               className="group relative bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-lg sm:text-xl px-6 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2 sm:gap-4 justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
             >
               {/* Shine sweep */}
               <m.span
                 variants={shineVariants}
                 className="pointer-events-none absolute top-0 left-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 blur-sm"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
               <Zap className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
               Купить VPN
               <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
             </Link>
          </m.div>
        </m.div>

        {/* Compact Stats */}
                 <m.div
           variants={fadeUp}
           initial="hidden"
           animate="visible"
           transition={{ duration: 0.8, delay: 0.7 }}
           className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center"
         >
           <dl className="flex flex-wrap justify-center gap-4 sm:gap-8">
             <div className="flex flex-col">
               <dd className="text-2xl sm:text-3xl font-bold text-cyan-400">2500+</dd>
               <dt className="text-gray-400 text-xs sm:text-sm">серверов</dt>
             </div>
             <div className="w-px h-8 sm:h-12 bg-gray-600 self-center" aria-hidden="true" />
             <div className="flex flex-col">
               <dd className="text-2xl sm:text-3xl font-bold text-purple-400">80+</dd>
               <dt className="text-gray-400 text-xs sm:text-sm">стран</dt>
             </div>
             <div className="w-px h-8 sm:h-12 bg-gray-600 self-center" aria-hidden="true" />
             <div className="flex flex-col">
               <dd className="text-2xl sm:text-3xl font-bold text-yellow-400">24/7</dd>
               <dt className="text-gray-400 text-xs sm:text-sm">поддержка</dt>
             </div>
           </dl>
         </m.div>
      </div>
    </section>
    </LazyMotion>
  );
};

export default HeroSection;
