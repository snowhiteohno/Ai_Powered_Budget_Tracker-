import './Filters.css'

const CATEGORIES = [
  'All', 'Food', 'Travel', 'Rent', 'Shopping',
  'Entertainment', 'Health', 'Utilities', 'Subscriptions'
]

const TYPES = ['All', 'income', 'expense']

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' }
]

function Filters({
  categoryFilter,
  onCategoryChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}) {
  return (
    <div className="filters-container" id="filters-container">
      {/* Category Chips */}
      <div className="filter-section">
        <span className="filter-label">Category</span>
        <div className="filter-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
              id={`filter-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Type, Sort, Date Row */}
      <div className="filter-controls">
        {/* Type Filter */}
        <div className="filter-group">
          <label className="form-label" htmlFor="type-filter">Type</label>
          <select
            className="form-select"
            value={typeFilter}
            onChange={e => onTypeChange(e.target.value)}
            id="type-filter"
          >
            {TYPES.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label className="form-label" htmlFor="sort-by">Sort By</label>
          <div className="sort-controls">
            <select
              className="form-select"
              value={sortBy}
              onChange={e => onSortChange(e.target.value)}
              id="sort-by"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              className="btn-icon sort-order-btn"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              id="sort-order-toggle"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label className="form-label">Date Range</label>
          <div className="date-range">
            <input
              type="date"
              className="form-input date-input"
              value={dateFrom}
              onChange={e => onDateFromChange(e.target.value)}
              id="date-from"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              className="form-input date-input"
              value={dateTo}
              onChange={e => onDateToChange(e.target.value)}
              id="date-to"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filters
