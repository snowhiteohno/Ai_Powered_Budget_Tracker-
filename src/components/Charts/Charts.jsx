import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
  BarChart, Bar
} from 'recharts'
import { formatCurrency } from '../../utils/currencyFormatter'
import './Charts.css'

// Category colors
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

const PIE_COLORS = Object.values(CATEGORY_COLORS)

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip-label">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

// Spending by Category — Donut Chart
export function CategoryPieChart({ data }) {
  // Convert object to array for Recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value
  }))

  if (chartData.length === 0) {
    return <div className="chart-empty">No expense data to display</div>
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CATEGORY_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Monthly Spending Trend — Area/Line Chart
export function SpendingTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data to display</div>
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 73, 76, 0.2)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(59, 73, 76, 0.2)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#00e5ff"
            strokeWidth={2.5}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Income vs Expenses — Bar Chart
export function IncomeVsExpenseChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">No comparison data to display</div>
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 73, 76, 0.2)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(59, 73, 76, 0.2)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>{value}</span>
            )}
          />
          <Bar dataKey="income" name="Income" fill="#4de082" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#ffb3b0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { CATEGORY_COLORS }
