import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useTransactions } from '../../hooks/useTransactions'
import { useDebounce } from '../../hooks/useDebounce'
import SearchBar from '../../components/SearchBar/SearchBar'
import Filters from '../../components/Filters/Filters'
import TransactionCard from '../../components/TransactionCard/TransactionCard'
import './Transactions.css'

function Transactions() {
  const navigate = useNavigate()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Debounce search
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Get filtered transactions
  const { transactions, deleteTransaction } = useTransactions({
    searchQuery: debouncedSearch,
    categoryFilter,
    typeFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo
  })

  // Handle edit — navigate to add transaction page with state
  const handleEdit = useCallback((transaction) => {
    navigate('/transactions/new', { state: { editTransaction: transaction } })
  }, [navigate])

  // Handle delete
  const handleDelete = useCallback((id) => {
    deleteTransaction(id)
    toast.success('Transaction deleted successfully')
  }, [deleteTransaction])

  return (
    <div className="page-container" id="transactions-page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Transactions
      </motion.h1>

      {/* Search + Filters */}
      <motion.div
        className="transactions-toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title or notes..."
        />

        <Filters
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </motion.div>

      {/* Transaction Count */}
      <div className="transactions-count">
        <span>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Transaction List */}
      <div className="transactions-list">
        <AnimatePresence>
          {transactions.length > 0 ? (
            transactions.map((t, i) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={i}
              />
            ))
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="empty-state-icon">📋</span>
              <h3 className="empty-state-title">No transactions found</h3>
              <p className="empty-state-text">
                {searchQuery || categoryFilter !== 'All' || typeFilter !== 'All'
                  ? 'Try adjusting your filters or search query.'
                  : 'Start by adding your first transaction!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        className="fab"
        onClick={() => navigate('/transactions/new')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        id="add-transaction-fab"
        title="Add Transaction"
      >
        <MdAdd />
      </motion.button>
    </div>
  )
}

export default Transactions
