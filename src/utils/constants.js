import { env } from '~/config/environment'

// Danh sach cac domains duoc phep truy cap vao tai nguyen server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'  // Kh can localhost nua vi o file config/cor.js da luon cho phep moi truong dev
  'https://trello-web-psi-six.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEV

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12
