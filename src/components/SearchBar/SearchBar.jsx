import { MdSearch } from 'react-icons/md'
import './SearchBar.css'

function SearchBar({ value, onChange, placeholder = 'Search transactions...' }) {
  return (
    <div className="search-bar" id="search-bar">
      <MdSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        id="search-input"
      />
    </div>
  )
}

export default SearchBar
