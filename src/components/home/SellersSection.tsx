import React from 'react';
import { Check, Banknote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LazyMotion, m, domAnimation, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ROUTES } from '../../utils/routes';

const SellersSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0 },
  };

  const tapMotion = shouldReduceMotion ? undefined : { scale: 0.98 };

  const wrapperVariants: Variants = shouldReduceMotion
    ? { rest: { scale: 1, y: 0 }, hover: { scale: 1, y: 0 } }
    : { rest: { scale: 1, y: 0 }, hover: { scale: 1.03, y: -1 } };

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
      <section className="group relative py-16 sm:py-20 px-4 bg-white overflow-hidden">
        {/* Светлый динамический фон */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/40 to-sky-50/50" />
          {/* Лёгкие геометрические фигуры */}
          <m.div
            className="absolute -top-8 -left-8 w-40 h-40 border border-amber-300/30 rounded-full"
            animate={shouldReduceMotion ? { opacity: 0.2 } : { rotate: [0, 360], scale: [1, 1.08, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 24, repeat: Infinity, ease: 'linear' }}
          />
          <m.div
            className="absolute top-20 right-24 w-24 h-24 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-xl rotate-6"
            animate={shouldReduceMotion ? { opacity: 0.15 } : { y: [0, -12, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <m.div
            className="absolute bottom-16 left-1/3 w-16 h-16 border-2 border-sky-300/30 rounded-full"
            animate={shouldReduceMotion ? { opacity: 0.15 } : { x: [0, 10, 0] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Лёгкая сетка */}
          <div className="absolute inset-0">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  `radial-gradient(circle at 20% 30%, rgba(251,191,36,0.25) 1px, transparent 1px),
                   radial-gradient(circle at 80% 70%, rgba(2,132,199,0.25) 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
                opacity: 0.2,
              }}
            />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Левая колонка */}
            <div>
              <m.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7 }}
                className="inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                Для продавцов VPN
              </m.div>

              <m.h2
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
              >
                Превратите свои серверы в стабильный доход
              </m.h2>

              <m.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Запускайте VPN-серверы, устанавливайте цены и получайте пассивный доход. Мы обеспечиваем клиентскую базу,
                платежи и техподдержку.
              </m.p>

              <div className="space-y-4 mb-8">
                {[
                  'Автоматические выплаты каждую неделю',
                  'Готовые конфигурации для WireGuard и OpenVPN',
                  'Аналитика и отчёты по продажам',
                ].map((text, idx) => (
                  <m.div
                    key={text}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.25 + idx * 0.08 }}
                    className="flex items-center"
                  >
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-gray-700">{text}</span>
                  </m.div>
                ))}
              </div>

              <m.div
                variants={wrapperVariants}
                initial="rest"
                animate="rest"
                whileHover="hover"
                whileTap={tapMotion}
                className="inline-block"
              >
                <Link
                  to={ROUTES.SELLER_DASHBOARD}
                  aria-label="Перейти в кабинет продавца"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-300 hover:to-orange-300 text-black font-bold text-lg px-8 py-4 rounded-xl shadow-xl transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <m.span
                    variants={shineVariants}
                    className="pointer-events-none absolute top-0 left-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 blur-sm"
                  />
                  Стать продавцом
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </m.div>
            </div>

            {/* Правая колонка */}
            <m.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, delay: 0.25 }}
              className="relative"
            >
              {/* подсветка под карточкой */}
              <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.18)_0%,transparent_60%)] blur-2xl" aria-hidden="true" />

              <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-white p-8 rounded-2xl ring-1 ring-amber-100/60 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.35)]">
                <div className="text-center">
                  <Banknote className="w-14 h-14 mx-auto mb-4 text-amber-600" aria-hidden="true" />
                  <div className="text-2xl font-bold text-gray-900 mb-2">До $5000/месяц</div>
                  <div className="text-gray-600">средний доход продавца</div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">~7%</div>
                    <div className="text-gray-500 text-xs">комиссия</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">24/7</div>
                    <div className="text-gray-500 text-xs">поддержка</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">T+7</div>
                    <div className="text-gray-500 text-xs">выплаты</div>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default SellersSection;
