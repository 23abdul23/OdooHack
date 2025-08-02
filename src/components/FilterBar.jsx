"use client"
import "../styles/FilterBar.css"

const FilterBar = ({ filters, categories, onFilterChange, userRole }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    onFilterChange({
      ...filters,
      [name]: value,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      status: "",
      category: "",
      priority: "",
      search: "",
      myTickets: userRole === "user" ? "true" : "false",
    })
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <input
          type="text"
          name="search"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select name="status" value={filters.status} onChange={handleInputChange} className="filter-select">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="filter-group">
        <select name="category" value={filters.category} onChange={handleInputChange} className="filter-select">
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select name="priority" value={filters.priority} onChange={handleInputChange} className="filter-select">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {userRole !== "user" && (
        <div className="filter-group">
          <select name="myTickets" value={filters.myTickets} onChange={handleInputChange} className="filter-select">
            <option value="false">All Tickets</option>
            <option value="true">My Tickets Only</option>
          </select>
        </div>
      )}

      <button onClick={clearFilters} className="clear-filters-btn">
        Clear Filters
      </button>
    </div>
  )
}

export default FilterBar
