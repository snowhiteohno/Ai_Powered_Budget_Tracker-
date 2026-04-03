import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

// Create context
const FinanceContext = createContext()

// Seed data for new users
const SEED_TRANSACTIONS = [
  { title: 'Monthly Salary', amount: 85000, category: 'Income', type: 'income', date: '2026-03-01', notes: 'March 2026 salary credited', recurring: true },
  { title: 'Freelance Project', amount: 25000, category: 'Income', type: 'income', date: '2026-03-05', notes: 'Website redesign project', recurring: false },
  { title: 'Grocery Shopping', amount: 3500, category: 'Food', type: 'expense', date: '2026-03-02', notes: 'Weekly groceries from BigBasket', recurring: false },
  { title: 'Netflix Subscription', amount: 649, category: 'Subscriptions', type: 'expense', date: '2026-03-01', notes: 'Monthly streaming subscription', recurring: true },
  { title: 'Uber Rides', amount: 1200, category: 'Travel', type: 'expense', date: '2026-03-03', notes: 'Travel to office and back', recurring: false },
  { title: 'Apartment Rent', amount: 18000, category: 'Rent', type: 'expense', date: '2026-03-01', notes: 'Monthly rent for March', recurring: true },
  { title: 'Zara Shopping', amount: 4500, category: 'Shopping', type: 'expense', date: '2026-03-08', notes: 'New clothes for spring', recurring: false },
  { title: 'Movie Night', amount: 800, category: 'Entertainment', type: 'expense', date: '2026-03-10', notes: 'PVR movie tickets and popcorn', recurring: false },
  { title: 'Gym Membership', amount: 2000, category: 'Health', type: 'expense', date: '2026-03-01', notes: 'Monthly gym membership fee', recurring: true },
  { title: 'Electricity Bill', amount: 2200, category: 'Utilities', type: 'expense', date: '2026-03-05', notes: 'March electricity bill', recurring: true },
  { title: 'Spotify Premium', amount: 119, category: 'Subscriptions', type: 'expense', date: '2026-03-01', notes: 'Monthly music subscription', recurring: true },
  { title: 'Dining Out', amount: 1800, category: 'Food', type: 'expense', date: '2026-03-12', notes: 'Dinner with friends', recurring: false },
  { title: 'Doctor Consultation', amount: 1500, category: 'Health', type: 'expense', date: '2026-03-15', notes: 'Routine health checkup', recurring: false },
  { title: 'Train Ticket', amount: 850, category: 'Travel', type: 'expense', date: '2026-03-18', notes: 'Weekend trip to hometown', recurring: false },
  { title: 'Internet Bill', amount: 999, category: 'Utilities', type: 'expense', date: '2026-03-10', notes: 'Monthly broadband bill', recurring: true }
]

const DEFAULT_BUDGET = 50000

export function FinanceProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState(DEFAULT_BUDGET)
  const [loading, setLoading] = useState(true)

  // Get Firestore references for the current user
  const getUserTransactionsRef = useCallback(() => {
    if (!user) return null
    return collection(db, 'users', user.uid, 'transactions')
  }, [user])

  const getUserBudgetRef = useCallback(() => {
    if (!user) return null
    return doc(db, 'users', user.uid, 'settings', 'budget')
  }, [user])

  // Listen to Firestore transactions in real-time
  useEffect(() => {
    if (!user) {
      setTransactions([])
      setBudget(DEFAULT_BUDGET)
      setLoading(false)
      return
    }

    setLoading(true)
    const transactionsRef = getUserTransactionsRef()
    if (!transactionsRef) return

    // Real-time listener for transactions
    const q = query(transactionsRef, orderBy('date', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      setTransactions(txns)
      setLoading(false)
    }, (error) => {
      console.error('Firestore transactions error:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, getUserTransactionsRef])

  // Listen to Firestore budget in real-time
  useEffect(() => {
    if (!user) return

    const budgetRef = getUserBudgetRef()
    if (!budgetRef) return

    const unsubscribe = onSnapshot(budgetRef, (docSnap) => {
      if (docSnap.exists()) {
        setBudget(docSnap.data().monthlyBudget || DEFAULT_BUDGET)
      } else {
        setBudget(DEFAULT_BUDGET)
      }
    })

    return () => unsubscribe()
  }, [user, getUserBudgetRef])

  // Seed data for new users (first time setup)
  async function seedDataForNewUser() {
    if (!user) return
    const transactionsRef = getUserTransactionsRef()
    if (!transactionsRef) return

    try {
      // Add seed transactions
      for (const txn of SEED_TRANSACTIONS) {
        await addDoc(transactionsRef, txn)
      }
      // Set default budget
      const budgetRef = getUserBudgetRef()
      await setDoc(budgetRef, { monthlyBudget: DEFAULT_BUDGET })
    } catch (error) {
      console.error('Error seeding data:', error)
    }
  }

  // Check if user has data, if not seed it
  useEffect(() => {
    if (!user || loading) return

    // If no transactions exist after loading, seed data
    if (transactions.length === 0) {
      const transactionsRef = getUserTransactionsRef()
      if (transactionsRef) {
        // Small delay to ensure Firestore has been checked
        const timer = setTimeout(() => {
          if (transactions.length === 0) {
            seedDataForNewUser()
          }
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [user, loading, transactions.length])

  // CRUD Operations — Firestore backed

  async function addTransaction(newTransaction) {
    if (!user) return null
    const transactionsRef = getUserTransactionsRef()
    if (!transactionsRef) return null

    try {
      const docRef = await addDoc(transactionsRef, {
        ...newTransaction,
        createdAt: new Date().toISOString()
      })
      return { id: docRef.id, ...newTransaction }
    } catch (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  }

  async function updateTransaction(id, updatedData) {
    if (!user) return
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id)
      await updateDoc(docRef, updatedData)
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  async function deleteTransaction(id) {
    if (!user) return
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  async function updateBudget(newBudget) {
    if (!user) return
    try {
      const budgetRef = getUserBudgetRef()
      await setDoc(budgetRef, { monthlyBudget: newBudget })
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }

  const value = {
    transactions,
    budget,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBudget
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinanceContext() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinanceContext must be used within a FinanceProvider')
  }
  return context
}

export default FinanceContext
