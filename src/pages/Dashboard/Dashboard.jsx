import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdTrendingUp, MdTrendingDown, MdAccountBalance, MdCategory, MdArrowForward } from 'react-icons/md'
import { useTransactions } from '../../hooks/useTransactions'
import { useBudget } from '../../hooks/useBudget'
import { useFinanceContext } from '../../context/FinanceContext'
import { formatCurrency } from '../../utils/currencyFormatter'
import { CategoryPieChart, SpendingTrendChart } from '../../components/Charts/Charts'
import BudgetCard from '../../components/BudgetCard/BudgetCard'
import TransactionCard from '../../components/TransactionCard/TransactionCard'
import AIInsights from '../../components/AIInsights/AIInsights'
import { format, subMonths } from 'date-fns'
import './Dashboard.css'

function Dashboard() {
  const { loading } = useFinanceContext()
  const { allTransactions, analytics } = useTransactions()
  const budgetData = useBudget()

  const { totalIncome, totalExpenses, netBalance, topCategory, categoryBreakdown } = analytics

  // Generate monthly trend data for the last 6 months
  const trendData = useMemo(() => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthNum = monthDate.getMonth()
      const yearNum = monthDate.getFullYear()
      const monthLabel = format(monthDate, 'MMM')

      const monthExpenses = allTransactions
        .filter(t => {
          if (t.type !== 'expense') return false
          const d = new Date(t.date)
          return d.getMonth() === monthNum && d.getFullYear() === yearNum
        })
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({ month: monthLabel, expenses: monthExpenses })
    }
    return months
  }, [allTransactions])

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...allTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [allTransactions])

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  }

  // Loading check AFTER all hooks
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner" /></div>
      </div>
    )
  }


  return (
    <div className="page-container" id="dashboard-page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>

      {/* Summary Cards */}
      <div className="grid-4 dashboard-summary">
        <motion.div
          className="glass-card glass-card--green summary-card"
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="summary-card-icon summary-card-icon--green">
            <MdTrendingUp />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">Total Income</span>
            <span className="summary-card-value amount-income">{formatCurrency(totalIncome)}</span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card glass-card--red summary-card"
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="summary-card-icon summary-card-icon--red">
            <MdTrendingDown />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">Total Expenses</span>
            <span className="summary-card-value amount-expense">{formatCurrency(totalExpenses)}</span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card summary-card"
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="summary-card-icon summary-card-icon--blue">
            <MdAccountBalance />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">Net Balance</span>
            <span className={`summary-card-value ${netBalance >= 0 ? 'amount-income' : 'amount-expense'}`}>
              {formatCurrency(netBalance)}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card summary-card"
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="summary-card-icon summary-card-icon--purple">
            <MdCategory />
          </div>
          <div className="summary-card-content">
            <span className="summary-card-label">Top Category</span>
            <span className="summary-card-value summary-card-value--small">{topCategory}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content: Charts + Sidebar */}
      <div className="grid-2-1 dashboard-content">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Spending Trend */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="section-title">Spending Trends</h3>
            <SpendingTrendChart data={trendData} />
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-header">
              <h3 className="section-title">Recent Transactions</h3>
              <Link to="/transactions" className="see-all-link">
                See All <MdArrowForward />
              </Link>
            </div>
            <div className="recent-transactions-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t, i) => (
                  <TransactionCard
                    key={t.id}
                    transaction={t}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    index={i}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p className="empty-state-text">No transactions yet. Start tracking!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Category Breakdown */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="section-title">Spending by Category</h3>
            <CategoryPieChart data={categoryBreakdown} />
          </motion.div>

          {/* Budget Progress */}
          <BudgetCard
            totalSpent={budgetData.totalSpent}
            monthlyBudget={budgetData.monthlyBudget}
            remaining={budgetData.remaining}
            percentageUsed={budgetData.percentageUsed}
            status={budgetData.status}
          />
        </div>
      </div>

      {/* AI Insights Section */}
      <AIInsights />
    </div>
  )
}

export default Dashboard
