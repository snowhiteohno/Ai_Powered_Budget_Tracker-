import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdEdit, MdSave, MdTrendingDown, MdCalendarToday, MdSpeed } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useBudget } from '../../hooks/useBudget'
import { formatCurrency } from '../../utils/currencyFormatter'
import './Budget.css'

const CATEGORY_COLORS = {
  Food: '#ff9800',
  Travel: '#2196f3',
  Rent: '#ce93d8',
  Shopping: '#f48fb1',
  Entertainment: '#00e5ff',
  Health: '#81c784',
  Utilities: '#fff176',
  Subscriptions: '#ff8a65'
}

function Budget() {
  const {
    monthlyBudget,
    totalSpent,
    remaining,
    percentageUsed,
    status,
    dailyAverage,
    projectedMonthly,
    categorySpending,
    updateBudget
  } = useBudget()

  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(monthlyBudget)

  function handleSaveBudget() {
    const newBudget = parseInt(budgetInput, 10)
    if (isNaN(newBudget) || newBudget <= 0) {
      toast.error('Please enter a valid budget amount')
      return
    }
    updateBudget(newBudget)
    setIsEditingBudget(false)
    toast.success('Budget updated successfully!')
  }

  // Gauge angle (max 270 degrees for visual)
  const gaugeAngle = Math.min(percentageUsed, 100) * 2.7

  // Status configuration
  const statusConfig = {
    'on-track': { label: 'On Track', color: '#4de082', bg: 'rgba(77, 224, 130, 0.1)' },
    'warning': { label: 'Warning', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    'over-budget': { label: 'Over Budget', color: '#ffb3b0', bg: 'rgba(255, 179, 176, 0.1)' }
  }

  const currentStatus = statusConfig[status] || statusConfig['on-track']

  return (
    <div className="page-container" id="budget-page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Budget Tracker
      </motion.h1>

      {/* Budget Input Card */}
      <motion.div
        className="glass-card budget-input-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="budget-input-header">
          <h3>Monthly Budget</h3>
          {isEditingBudget ? (
            <button className="btn btn-primary btn-sm" onClick={handleSaveBudget} id="save-budget-btn">
              <MdSave /> Save
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => setIsEditingBudget(true)} id="edit-budget-btn">
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {isEditingBudget ? (
          <div className="budget-edit-field">
            <span className="budget-edit-prefix">₹</span>
            <input
              type="number"
              className="form-input budget-edit-input"
              value={budgetInput}
              onChange={e => setBudgetInput(e.target.value)}
              autoFocus
              id="budget-input"
            />
          </div>
        ) : (
          <div className="budget-display-value">
            <span className="currency-symbol">₹</span>
            {monthlyBudget.toLocaleString('en-IN')}
          </div>
        )}
      </motion.div>

      {/* Progress Gauge + Summary Row */}
      <div className="grid-3 budget-overview">
        {/* Circular Gauge */}
        <motion.div
          className="glass-card gauge-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="gauge-container">
            <svg viewBox="0 0 200 200" className="gauge-svg">
              {/* Background track */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="var(--surface-container-highest)"
                strokeWidth="12"
                strokeDasharray={`${85 * 2 * Math.PI * 0.75}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(135 100 100)"
              />
              {/* Progress arc */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke={currentStatus.color}
                strokeWidth="12"
                strokeDasharray={`${85 * 2 * Math.PI * 0.75}`}
                strokeDashoffset={85 * 2 * Math.PI * 0.75 * (1 - Math.min(percentageUsed, 100) / 100)}
                strokeLinecap="round"
                transform="rotate(135 100 100)"
                style={{
                  transition: 'stroke-dashoffset 1s ease',
                  filter: `drop-shadow(0 0 8px ${currentStatus.color}50)`
                }}
              />
            </svg>
            <div className="gauge-center">
              <span className="gauge-percentage" style={{ color: currentStatus.color }}>
                {percentageUsed}%
              </span>
              <span className="gauge-label">used</span>
            </div>
          </div>
          <div
            className="gauge-status"
            style={{ background: currentStatus.bg, color: currentStatus.color }}
          >
            {currentStatus.label}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          className="glass-card summary-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="stat-icon stat-icon--red">
            <MdTrendingDown />
          </div>
          <span className="stat-label">Total Spent</span>
          <span className="stat-value amount-expense">{formatCurrency(totalSpent)}</span>
          <div className="stat-sub">
            <span className={`stat-remaining ${remaining < 0 ? 'amount-expense' : 'amount-income'}`}>
              {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'remaining' : 'over'}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card summary-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon stat-icon--blue">
            <MdCalendarToday />
          </div>
          <span className="stat-label">Daily Average</span>
          <span className="stat-value">{formatCurrency(dailyAverage)}</span>
          <div className="stat-sub">
            <MdSpeed className="stat-sub-icon" />
            <span className="stat-projected">
              Projected: {formatCurrency(projectedMonthly)}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <motion.div
        className="glass-card category-breakdown-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h3 className="section-title">Category Breakdown</h3>
        <div className="category-list">
          {Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const catPercentage = monthlyBudget > 0 ? Math.round((amount / monthlyBudget) * 100) : 0
              const color = CATEGORY_COLORS[category] || '#888'

              return (
                <div key={category} className="category-row">
                  <div className="category-row-header">
                    <div className="category-row-left">
                      <span
                        className="category-dot"
                        style={{ background: color }}
                      />
                      <span className="category-name">{category}</span>
                    </div>
                    <div className="category-row-right">
                      <span className="category-amount">{formatCurrency(amount)}</span>
                      <span className="category-percent">{catPercentage}%</span>
                    </div>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}40`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(catPercentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}

          {Object.keys(categorySpending).length === 0 && (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <p className="empty-state-text">No expenses this month yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Budget
