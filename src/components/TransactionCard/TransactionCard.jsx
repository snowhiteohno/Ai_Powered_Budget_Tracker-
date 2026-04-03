import { motion } from 'framer-motion'
import { MdDelete, MdEdit, MdRepeat } from 'react-icons/md'
import { formatCurrency } from '../../utils/currencyFormatter'
import { format } from 'date-fns'
import './TransactionCard.css'

const CATEGORY_CLASSES = {
  Food: 'badge-food',
  Travel: 'badge-travel',
  Rent: 'badge-rent',
  Shopping: 'badge-shopping',
  Entertainment: 'badge-entertainment',
  Health: 'badge-health',
  Utilities: 'badge-utilities',
  Subscriptions: 'badge-subscriptions',
  Income: 'badge-income'
}

function TransactionCard({ transaction, onEdit, onDelete, index = 0 }) {
  const { title, amount, category, type, date, notes, recurring } = transaction

  const categoryClass = CATEGORY_CLASSES[category] || 'badge-food'
  const isExpense = type === 'expense'

  return (
    <motion.div
      className={`transaction-card ${isExpense ? '' : 'transaction-card--income'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <div className="transaction-card-left">
        <div className="transaction-info">
          <div className="transaction-title-row">
            <h4 className="transaction-title">{title}</h4>
            {recurring && (
              <span className="recurring-badge" title="Recurring">
                <MdRepeat />
              </span>
            )}
          </div>
          <div className="transaction-meta">
            <span className={`badge ${categoryClass}`}>{category}</span>
            <span className="transaction-date">
              {format(new Date(date), 'dd MMM yyyy')}
            </span>
          </div>
          {notes && <p className="transaction-notes">{notes}</p>}
        </div>
      </div>

      <div className="transaction-card-right">
        <span className={`transaction-amount ${isExpense ? 'amount-expense' : 'amount-income'}`}>
          {isExpense ? '−' : '+'}
          <span className="currency-symbol">₹</span>
          {amount.toLocaleString('en-IN')}
        </span>

        <div className="transaction-actions">
          <button
            className="btn-icon"
            onClick={() => onEdit(transaction)}
            title="Edit"
            id={`edit-transaction-${transaction.id}`}
          >
            <MdEdit />
          </button>
          <button
            className="btn-icon btn-icon--danger"
            onClick={() => onDelete(transaction.id)}
            title="Delete"
            id={`delete-transaction-${transaction.id}`}
          >
            <MdDelete />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionCard
