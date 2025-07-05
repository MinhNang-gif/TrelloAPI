import { env } from '~/config/environment'

// Danh sach cac domains duoc phep truy cap vao tai nguyen server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'  // Kh can localhost nua vi o file config/cor.js da luon cho phep moi truong dev
  'https://react-trello-iota.vercel.app'
]
export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEV


export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}


export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
