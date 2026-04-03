import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useFinanceContext } from '../../context/FinanceContext'
import { format } from 'date-fns'
import './AddTransaction.css'

// Validation schema using yup
const transactionSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be positive'),
  category: yup.string().required('Category is required'),
  type: yup.string().required('Transaction type is required').oneOf(['income', 'expense']),
  date: yup.string().required('Date is required'),
  notes: yup.string(),
  recurring: yup.boolean()
})

const CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Shopping',
  'Entertainment', 'Health', 'Utilities', 'Subscriptions'
]

function AddTransaction() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addTransaction, updateTransaction } = useFinanceContext()

  // Check if we're editing an existing transaction
  const editTransaction = location.state?.editTransaction || null
  const isEditing = !!editTransaction

  // Set up react-hook-form with yup validation
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'Food',
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      recurring: false
    }
  })

  // If editing, populate the form
  useEffect(() => {
    if (editTransaction) {
      reset({
        title: editTransaction.title,
        amount: editTransaction.amount,
        category: editTransaction.category,
        type: editTransaction.type,
        date: editTransaction.date,
        notes: editTransaction.notes || '',
        recurring: editTransaction.recurring || false
      })
    }
  }, [editTransaction, reset])

  const selectedType = watch('type')

  // Handle form submission
  function onSubmit(data) {
    if (isEditing) {
      updateTransaction(editTransaction.id, data)
      toast.success('Transaction updated successfully!')
    } else {
      addTransaction(data)
      toast.success('Transaction added successfully!')
    }
    navigate('/transactions')
  }

  return (
    <div className="page-container" id="add-transaction-page">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      </motion.h1>

      <motion.div
        className="glass-card form-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="transaction-form" id="transaction-form">
          {/* Transaction Type Toggle */}
          <div className="type-toggle">
            <label
              className={`type-option ${selectedType === 'expense' ? 'type-option--active type-option--expense' : ''}`}
            >
              <input
                type="radio"
                value="expense"
                {...register('type')}
                className="type-radio"
              />
              Expense
            </label>
            <label
              className={`type-option ${selectedType === 'income' ? 'type-option--active type-option--income' : ''}`}
            >
              <input
                type="radio"
                value="income"
                {...register('type')}
                className="type-radio"
              />
              Income
            </label>
          </div>
          {errors.type && <span className="form-error">{errors.type.message}</span>}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title *</label>
            <input
              className={`form-input ${errors.title ? 'form-input--error' : ''}`}
              type="text"
              placeholder="e.g., Grocery Shopping"
              {...register('title')}
              id="title"
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount *</label>
            <div className="amount-input-wrapper">
              <span className="amount-prefix">₹</span>
              <input
                className={`form-input amount-input ${errors.amount ? 'form-input--error' : ''}`}
                type="number"
                placeholder="0"
                step="any"
                {...register('amount')}
                id="amount"
              />
            </div>
            {errors.amount && <span className="form-error">{errors.amount.message}</span>}
          </div>

          {/* Two-column: Category + Date */}
          <div className="form-row">
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category *</label>
              <select
                className={`form-select ${errors.category ? 'form-input--error' : ''}`}
                {...register('category')}
                id="category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category.message}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date *</label>
              <input
                className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                type="date"
                {...register('date')}
                id="date"
              />
              {errors.date && <span className="form-error">{errors.date.message}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Add any additional details..."
              {...register('notes')}
              id="notes"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="form-group form-group--row">
            <label className="form-label" htmlFor="recurring">Recurring Transaction</label>
            <Controller
              name="recurring"
              control={control}
              render={({ field }) => (
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    id="recurring"
                  />
                  <span className="toggle-slider"></span>
                </label>
              )}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/transactions')}
              id="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              id="submit-btn"
            >
              {isEditing ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddTransaction
