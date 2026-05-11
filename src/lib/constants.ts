export const EXPENSE_CATEGORIES = {
  FOOD: 'Alimentación',
  TRANSPORT: 'Transporte',
  HOUSING: 'Vivienda',
  HEALTH: 'Salud',
  ENTERTAINMENT: 'Entretenimiento',
  EDUCATION: 'Educación',
  CLOTHING: 'Ropa',
  SAVINGS: 'Ahorro',
  DEBT: 'Deudas',
  OTHER: 'Otros',
} as const

export const EXPENSE_TYPES = {
  NECESSARY: 'Necesario',
  UNNECESSARY: 'Innecesario',
  RISK: 'Riesgo financiero',
} as const

export const EXPENSE_TYPE_COLORS = {
  NECESSARY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  UNNECESSARY: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  RISK: 'text-red-400 bg-red-500/10 border-red-500/20',
} as const
