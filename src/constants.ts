import type { Route } from 'next'

export const SITE_NAME = 'NLP Platform'
export const SITE_DESCRIPTION =
  'NLP Platform | speech to text, text to speech, sentiment analysis, entity extraction, and more.'
export const SITE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://nlp.netgeist.ai'

export const SITE_DOMAIN = new URL(SITE_URL).hostname
export const PASSWORD_RESET_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const MAX_SESSIONS_PER_USER = 5
export const MAX_TEAMS_CREATED_PER_USER = 3
export const MAX_TEAMS_JOINED_PER_USER = 10
export const SESSION_COOKIE_NAME = 'session'
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = 'google-oauth-state'
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME =
  'google-oauth-code-verifier'

export const TTS_CHARS_PER_MINUTE = 1000
export const TTS_CREDITS_PER_CHAR = 0.5
export const MAX_TEXT_LENGTH = 5000

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    credits: 10000,
    price: 1000,
    info: {
      title: 'Starter Pack',
      description: 'Best for new users.',
      features: [
        'Access to models featuring Speech to Text and Text to speech capabilities.',
        'Best for new users.',
      ],
    },
  },
  {
    id: 'pro',
    credits: 25000,
    price: 2000,
    info: {
      title: 'Pro Pack',
      description: 'Best for users who need more credits.',
      features: [
        'Access to models featuring Speech to Text and Text to speech capabilities.',
        'Best for users who need more credits.',
      ],
    },
  },
  {
    id: 'enterprise',
    credits: 100000,
    price: 5000,
    info: {
      title: 'Enterprise Pack',
      description: 'Best for users who need a lot of credits.',
      features: [
        'Access to models featuring Speech to Text and Text to speech capabilities.',
        'Best for users who need a lot of credits.',
      ],
    },
  },
] as const

export const STT_CREDITS_PER_SECOND = 8.3

export const CREDITS_EXPIRATION_YEARS = 2

export const FREE_MONTHLY_CREDITS = CREDIT_PACKAGES[0].credits * 0.1
export const MAX_TRANSACTIONS_PER_PAGE = 10
export const REDIRECT_AFTER_SIGN_IN = '/dashboard' as Route

export const INVOICE_NUMBER_PREFIX = 'NLP'

export const TTS_VOICES = [
  { value: 'female_1', label: 'Lina', avatar: '👩' },
  { value: 'female_2', label: 'Rasa', avatar: '👩' },
  { value: 'female_3', label: 'Sandra', avatar: '👩' },
  { value: 'male_1', label: 'Tomas', avatar: '👨' },
  { value: 'male_2', label: 'Andrius', avatar: '👨' },
  { value: 'male_3', label: 'Jonas', avatar: '👨' },
  { value: 'vip_1', label: 'Greta', avatar: '👩', disabled: true },
]

export const TTS_LANGUAGES = [
  { value: 'lt', label: 'Lithuanian', avatar: '🇱🇹' },
]

export const TTS_EMOTIONS = [
  { value: 'neutral', label: 'Neutral', avatar: '😐' },
  { value: 'happy', label: 'Happy', avatar: '😊' },
  { value: 'sad', label: 'Sad', avatar: '😢' },
  { value: 'angry', label: 'Angry', avatar: '😠' },
  { value: 'fearful', label: 'Fearful', avatar: '😨' },
  { value: 'disappointed', label: 'Disappointed', avatar: '😞' },
]

export const TTS_CHARS_LIMIT = 5000

export const STT_LANGUAGES = [
  { value: 'lt', label: 'Lithuanian', avatar: '🇱🇹' },
]
