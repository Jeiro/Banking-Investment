export const APP_NAME = "NexVault"
export const APP_TAGLINE = "Banking built for the modern world"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
]

export const DASHBOARD_NAV = [
  { label: "Overview", href: "/dashboard/overview", icon: "LayoutDashboard" },
  { label: "Transactions", href: "/dashboard/transactions", icon: "ArrowLeftRight" },
  { label: "Deposit", href: "/dashboard/deposit", icon: "ArrowDownCircle" },
  { label: "Withdraw", href: "/dashboard/withdraw", icon: "ArrowUpCircle" },
  { label: "Transfer", href: "/dashboard/transfer", icon: "Send" },
  { label: "Investments", href: "/dashboard/investments", icon: "TrendingUp" },
  { label: "Beneficiaries", href: "/dashboard/beneficiaries", icon: "Users" },
  { label: "KYC", href: "/dashboard/kyc", icon: "ShieldCheck" },
  { label: "Statements", href: "/dashboard/statements", icon: "FileText" },
  { label: "Support", href: "/dashboard/support", icon: "MessageCircle" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
]

export const ADMIN_NAV = [
  { label: "Overview", href: "/admin/overview", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "KYC Review", href: "/admin/kyc", icon: "ShieldCheck" },
  { label: "Transactions", href: "/admin/transactions", icon: "ArrowLeftRight" },
  { label: "Deposits", href: "/admin/deposits", icon: "ArrowDownCircle" },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: "ArrowUpCircle" },
  { label: "Support", href: "/admin/support", icon: "MessageCircle" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "ScrollText" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
]