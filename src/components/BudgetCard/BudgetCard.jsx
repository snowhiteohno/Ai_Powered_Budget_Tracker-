import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/currencyFormatter'
import './BudgetCard.css'

function BudgetCard({ totalSpent, monthlyBudget, remaining, percentageUsed, status }) {
  // Determine progress bar class based on status
  let progressClass = 'progress-fill'
  if (status === 'warning') {
    progressClass += ' progress-fill--warning'
  } else if (status === 'over-budget') {
    progressClass += ' progress-fill--danger'
  }

  // Status label and color
  const statusConfig = {
    'on-track': { label: 'On Track', color: 'var(--secondary)' },
    'warning': { label: 'Warning', color: '#fbbf24' },
    'over-budget': { label: 'Over Budget', color: 'var(--tertiary-fixed-dim)' }
  }

  const currentStatus = statusConfig[status] || statusConfig['on-track']

  return (
    <motion.div
      className="budget-card glass-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="budget-card-header">
        <h3 className="budget-card-title">Monthly Budget</h3>
        <span
          className="budget-status-badge"
          style={{ color: currentStatus.color, borderColor: currentStatus.color }}
        >
          {currentStatus.label}
        </span>
      </div>

      <div className="budget-amounts">
        <div className="budget-spent">
          <span className="budget-amount-label">Spent</span>
          <span className="budget-amount-value amount-expense">
            {formatCurrency(totalSpent)}
          </span>
        </div>
        <div className="budget-of">
          <span className="budget-amount-label">Budget</span>
          <span className="budget-amount-value">
            {formatCurrency(monthlyBudget)}
          </span>
        </div>
      </div>

      <div className="budget-progress">
        <div className="progress-track">
          <motion.div
            className={progressClass}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <span className="budget-percentage" style={{ color: currentStatus.color }}>
          {percentageUsed}%
        </span>
      </div>

      <div className="budget-remaining">
        <span className="budget-remaining-label">Remaining</span>
        <span className={`budget-remaining-value ${remaining < 0 ? 'amount-expense' : 'amount-income'}`}>
          {formatCurrency(Math.abs(remaining))}
          {remaining < 0 && ' over'}
        </span>
      </div>
    </motion.div>
  )
}

export default BudgetCard
