import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuSquarePen, LuCloudUpload, LuZap, LuTrendingUp, LuRocket } from 'react-icons/lu'
import { useI18n } from '../context/I18nContext'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/PageWrapper'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
}

export default function Home() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()

  const features = [
    { icon: LuSquarePen, title: t('home.feature1.title'), desc: t('home.feature1.desc') },
    { icon: LuCloudUpload, title: t('home.feature2.title'), desc: t('home.feature2.desc') },
    { icon: LuZap, title: t('home.feature3.title'), desc: t('home.feature3.desc') },
    { icon: LuTrendingUp, title: t('home.feature4.title'), desc: t('home.feature4.desc') },
  ]

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="bg-aurora relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm dark:border-brand-500/30 dark:bg-slate-900/60 dark:text-brand-300"
            >
              <LuZap className="h-4 w-4" /> {t('app.tagline')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="mt-6 bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent dark:from-white dark:to-slate-400 sm:text-6xl"
            >
              {t('home.heroTitle')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300"
            >
              {t('home.heroSub')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.35 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                to={isAuthenticated ? '/practice' : '/register'}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-500/30 transition-transform hover:scale-105"
              >
                <LuRocket className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6" />
                {t('home.ctaStart')}
              </Link>
              <Link
                to={isAuthenticated ? '/create' : '/login'}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-7 py-3.5 text-base font-semibold text-slate-700 backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t('home.ctaCreate')}
              </Link>
            </motion.div>
          </div>

          {/* Decorative floating cards */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-float absolute left-[8%] top-[20%] h-24 w-24 rounded-3xl bg-brand-400/20 blur-2xl" />
            <div className="animate-float absolute right-[10%] top-[30%] h-32 w-32 rounded-full bg-accent-500/20 blur-3xl" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-accent-500/15 text-brand-600 dark:text-brand-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}
