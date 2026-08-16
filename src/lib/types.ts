// Database types

export interface Plan {
  id: string
  name: string
  duration_days: number
  price: number
  description: string
  created_at?: string
}

export interface Trainer {
  id: string
  name: string
  phone: string
  specialization: string
  salary: number
  status: string
  created_at?: string
}

export interface Member {
  id: string
  name: string
  phone: string
  email: string
  address: string
  gender: string
  dob: string | null
  plan_id: string | null
  trainer_id: string | null
  join_date: string
  expiry_date: string | null
  status: string
  created_at?: string
  // joined relations
  plan?: Plan | null
  trainer?: Trainer | null
}

export interface Payment {
  id: string
  member_id: string
  amount: number
  payment_date: string
  method: string
  status: string
  invoice_no: string | null
  notes: string
  created_at?: string
  member?: Member | null
}

export interface Product {
  id: string
  name: string
  category: string
  cost_price: number
  sell_price: number
  stock: number
  created_at?: string
}

export interface Sale {
  id: string
  product_id: string
  qty: number
  total: number
  sale_date: string
  created_at?: string
  product?: Product | null
}

export interface Expense {
  id: string
  category: string
  amount: number
  date: string
  description: string
  created_at?: string
}

export interface Settings {
  id: number
  gym_name: string
  address: string
  phone: string
  email: string
  currency: string
}

export interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalRevenue: number
  totalProfit: number
  monthlyRevenue: { month: string; revenue: number; profit: number }[]
  memberGrowth: { month: string; members: number }[]
  recentPayments: Payment[]
  expiringSoon: Member[]
}
