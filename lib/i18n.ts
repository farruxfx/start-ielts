/**
 * Internationalization (i18n) for StartIELTS
 * Supports: English, Uzbek, Russian
 */

type TranslationKeys = Record<string, { en: string; uz: string; ru: string }>;

const translations: TranslationKeys = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', uz: 'Boshqaruv paneli', ru: 'Главная' },
  'nav.practice': { en: 'Practice', uz: 'Mashq', ru: 'Практика' },
  'nav.mock_exam': { en: 'Mock Exam', uz: 'Sinov imtihoni', ru: 'Пробный экзамен' },
  'nav.analytics': { en: 'Analytics', uz: 'Tahlillar', ru: 'Аналитика' },
  'nav.vocabulary': { en: 'Vocabulary', uz: 'Lug\'at', ru: 'Словарь' },
  'nav.ai_coach': { en: 'AI Coach', uz: 'AI Murabbiy', ru: 'AI Тренер' },
  'nav.reading': { en: 'Reading', uz: 'O\'qish', ru: 'Чтение' },
  'nav.listening': { en: 'Listening', uz: ' Tinglash', ru: 'Аудирование' },
  'nav.writing': { en: 'Writing', uz: 'Yozish', ru: 'Письмо' },
  'nav.speaking': { en: 'Speaking', uz: 'Nutq', ru: 'Говорение' },
  'nav.settings': { en: 'Settings', uz: 'Sozlamalar', ru: 'Настройки' },
  'nav.admin': { en: 'Admin Panel', uz: 'Admin panel', ru: 'Панель админа' },
  'nav.pricing': { en: 'Pricing', uz: 'Narxlar', ru: 'Цены' },
  'nav.sign_out': { en: 'Sign out', uz: 'Chiqish', ru: 'Выйти' },

  // Dashboard
  'dash.welcome': { en: 'Welcome back', uz: 'Xush kelibsiz', ru: 'Добро пожаловать' },
  'dash.progress': { en: 'Here\'s your IELTS preparation progress.', uz: 'IELTS tayyorgarlik jarayoni.', ru: 'Ваш прогресс подготовки к IELTS.' },
  'dash.start_practicing': { en: 'Start practicing', uz: 'Mashqni boshlash', ru: 'Начать практику' },
  'dash.study_plan': { en: 'Your Study Plan', uz: 'Sizning o\'quv rejangiz', ru: 'Ваш план обучения' },
  'dash.daily_goals': { en: 'Daily Goals', uz: 'Kunlik maqsadlar', ru: 'Дневные цели' },
  'dash.achievements': { en: 'Achievements', uz: 'Yutuqlar', ru: 'Достижения' },
  'dash.exam_countdown': { en: 'Exam Countdown', uz: 'Imtihon sanasi', ru: 'До экзамена' },
  'dash.days_left': { en: 'days left', uz: 'kun qoldi', ru: 'дней осталось' },

  // Onboarding
  'onboard.target_band': { en: 'Target Band', uz: 'Maqsadli band', ru: 'Целевой балл' },
  'onboard.focus_skills': { en: 'Focus Skills', uz: 'E\'tibor ko\'nikmalari', ru: 'Фокус навыки' },
  'onboard.exam_date': { en: 'Exam Date', uz: 'Imtihon sanasi', ru: 'Дата экзамена' },
  'onboard.current_level': { en: 'Current Level', uz: 'Joriy daraja', ru: 'Текущий уровень' },
  'onboard.study_time': { en: 'Study Time', uz: 'O\'quv vaqti', ru: 'Время учёбы' },
  'onboard.exam_type': { en: 'Exam Type', uz: 'Imtihon turi', ru: 'Тип экзамена' },

  // Common
  'common.save': { en: 'Save', uz: 'Saqlash', ru: 'Сохранить' },
  'common.cancel': { en: 'Cancel', uz: 'Bekor qilish', ru: 'Отмена' },
  'common.delete': { en: 'Delete', uz: 'O\'chirish', ru: 'Удалить' },
  'common.loading': { en: 'Loading...', uz: 'Yuklanmoqda...', ru: 'Загрузка...' },
  'common.next': { en: 'Next', uz: 'Keyingi', ru: 'Далее' },
  'common.back': { en: 'Back', uz: 'Orqaga', ru: 'Назад' },
  'common.skip': { en: 'Skip', uz: 'O\'tkazish', ru: 'Пропустить' },
  'common.done': { en: 'Done', uz: 'Tayyor', ru: 'Готово' },
  'common.retry': { en: 'Retry', uz: 'Qayta urinish', ru: 'Повторить' },
};

let currentLang = 'en';

export function setLanguage(lang: string): void {
  currentLang = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ieltspro_language', lang);
  }
}

export function getLanguage(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ieltspro_settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.language) return settings.language;
      } catch {}
    }
    const lang = localStorage.getItem('ieltspro_language');
    if (lang) return lang;
  }
  return currentLang;
}

export function t(key: string): string {
  const lang = getLanguage();
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang as keyof typeof entry] || entry.en || key;
}
