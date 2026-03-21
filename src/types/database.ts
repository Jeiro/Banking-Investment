export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole = 'user' | 'admin' | 'super_admin'
export type UserStatus = 'active' | 'suspended' | 'pending' | 'closed'
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type AccountType = 'checking' | 'savings' | 'investment'
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'investment' | 'return' | 'fee' | 'refund'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'transaction' | 'kyc' | 'security'
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  date_of_birth: string | null
  avatar_url: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  employment_status: string | null
  annual_income: string | null
  account_type: string
  role: UserRole
  status: UserStatus
  kyc_status: KycStatus
  two_factor_enabled: boolean
  referral_code: string | null
  referred_by: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  account_number: string
  account_type: AccountType
  account_name: string
  balance: number
  available_balance: number
  currency: string
  is_primary: boolean
  is_frozen: boolean
  interest_rate: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string | null
  type: TransactionType
  status: TransactionStatus
  amount: number
  fee: number
  currency: string
  description: string | null
  reference_id: string
  metadata: Json
  to_account_id: string | null
  to_user_id: string | null
  processed_by: string | null
  processed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Deposit {
  id: string
  user_id: string
  account_id: string | null
  transaction_id: string | null
  amount: number
  currency: string
  method: string
  status: string
  reference: string
  proof_url: string | null
  notes: string | null
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Withdrawal {
  id: string
  user_id: string
  account_id: string | null
  transaction_id: string | null
  amount: number
  fee: number
  net_amount: number
  currency: string
  method: string
  status: string
  reference: string
  bank_name: string | null
  bank_account_number: string | null
  bank_routing_number: string | null
  bank_account_name: string | null
  notes: string | null
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Beneficiary {
  id: string
  user_id: string
  nickname: string
  full_name: string
  bank_name: string | null
  account_number: string
  routing_number: string | null
  email: string | null
  phone: string | null
  is_internal: boolean
  internal_user_id: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface InvestmentPlan {
  id: string
  name: string
  description: string | null
  min_amount: number
  max_amount: number | null
  duration_days: number
  return_rate: number
  risk_level: RiskLevel | null
  is_active: boolean
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  account_id: string | null
  plan_id: string | null
  amount: number
  expected_return: number | null
  actual_return: number
  status: string
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface KycDocument {
  id: string
  user_id: string
  document_type: string
  document_url: string
  status: string
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  action_url: string | null
  metadata: Json
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  ticket_number: string
  subject: string
  category: string | null
  priority: string
  status: TicketStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  attachments: Json
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_value: Json | null
  new_value: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}