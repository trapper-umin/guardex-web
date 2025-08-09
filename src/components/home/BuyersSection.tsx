import React from 'react';
import { Globe, Zap, Gem, Shield, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LazyMotion, m, domAnimation, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ROUTES } from '../../utils/routes';

const BuyersSection: React.FC = () => {
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
      : { x: '220%', opacity: 1, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="group relative py-16 sm:py-20 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/70 to-blue-100/80" />
          <m.div
            className="absolute -top-8 -left-8 w-40 h-40 border border-blue-300/30 rounded-full"
            animate={shouldReduceMotion ? { opacity: 0.2 } : { rotate: [0, 360], scale: [1, 1.06, 1] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 24, repeat: Infinity, ease: 'linear' }}
          />
          <m.div
            className="absolute top-16 right-24 w-24 h-24 bg-gradient-to-r from-blue-200/40 to-blue-300/40 rounded-xl rotate-6"
            animate={shouldReduceMotion ? { opacity: 0.15 } : { y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <m.div
            className="absolute bottom-16 left-1/3 w-16 h-16 border-2 border-blue-300/30 rounded-full"
            animate={shouldReduceMotion ? { opacity: 0.15 } : { x: [0, 10, 0] }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  `radial-gradient(circle at 20% 30%, rgba(37,99,235,0.23) 1px, transparent 1px),
                   radial-gradient(circle at 80% 70%, rgba(59,130,246,0.23) 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
                opacity: 0.22,
              }}
            />
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <m.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl ring-1 ring-blue-100/60 order-2 lg:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Globe className="w-6 h-6 text-gray-900 mb-2" aria-hidden="true" />
                  <div className="text-sm font-medium text-gray-900">50+ стран</div>
                  <div className="text-xs text-gray-600">Глобальное покрытие</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Zap className="w-6 h-6 text-gray-900 mb-2" aria-hidden="true" />
                  <div className="text-sm font-medium text-gray-900">До 1 Гбит/с</div>
                  <div className="text-xs text-gray-600">Максимальная скорость</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Gem className="w-6 h-6 text-gray-900 mb-2" aria-hidden="true" />
                  <div className="text-sm font-medium text-gray-900">От $2/месяц</div>
                  <div className="text-xs text-gray-600">Лучшие цены</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <Shield className="w-6 h-6 text-gray-900 mb-2" aria-hidden="true" />
                  <div className="text-sm font-medium text-gray-900">100% анонимность</div>
                  <div className="text-xs text-gray-600">Без логов</div>
                </div>
              </div>
            </m.div>

            <div className="order-1 lg:order-2">
              <m.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7 }}
                className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                Для покупателей VPN
              </m.div>

              <m.h2
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
              >
                Найдите идеальный VPN для ваших задач
              </m.h2>

              <m.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Сравнивайте сотни VPN-серверов по стране, скорости, цене и отзывам.
                Подключайтесь к лучшим предложениям за секунды.
              </m.p>

              <div className="space-y-4 mb-8">
                {[
                  'Мгновенная активация после оплаты',
                  'Тестирование скорости перед покупкой',
                  'Гарантия возврата средств 30 дней',
                ].map((text, idx) => (
                  <m.div
                    key={text}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, delay: 0.25 + idx * 0.08 }}
                    className="flex items-center"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
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
                  to={ROUTES.MARKETPLACE}
                  aria-label="Открыть маркетплейс VPN"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-xl transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <m.span
                    variants={shineVariants}
                    className="pointer-events-none absolute top-0 left-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-200 opacity-0 group-hover:opacity-20 transition-opacity" />
                  Купить VPN
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </m.div>
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
};

export default BuyersSection;
