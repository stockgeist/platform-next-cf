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
