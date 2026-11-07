import {
  useState,
  useMemo,
  type ReactNode,
  type ChangeEvent,
} from 'react'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from 'lucide-react'
import { TableSearch } from './TableSearch'
import { TablePagination } from './TablePagination'
import { ExpandableTableRow } from './ExpandableTableRow'
import './dataDisplay.css'

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  render?: (row: T, index: number) => ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor?: (row: T, index: number) => string | number

  // Sorting
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string, direction: 'asc' | 'desc') => void

  // Selection
  selectable?: boolean
  selectedKeys?: Set<string | number> | (string | number)[]
  onSelectionChange?: (selectedKeys: (string | number)[]) => void

  // Expandable rows
  expandable?: boolean
  renderExpandedRow?: (row: T, index: number) => ReactNode
  expandedKeys?: Set<string | number> | (string | number)[]
  onExpandChange?: (expandedKeys: (string | number)[]) => void

  // Search
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string

  // Pagination
  pagination?: boolean
  currentPage?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]

  // Row actions
  rowActions?: (row: T, index: number) => ReactNode
  actionsHeader?: ReactNode
  actionsWidth?: string

  // States
  loading?: boolean
  loadingMessage?: ReactNode
  emptyTitle?: ReactNode
  emptyMessage?: ReactNode
  emptyIcon?: ReactNode

  // Layout & Style
  className?: string
  tableClassName?: string
  stickyHeader?: boolean
  compact?: boolean
  onRowClick?: (row: T, index: number) => void
  headerRightContent?: ReactNode
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (_row, index) => index,

  // Sorting
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,

  // Selection
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange,

  // Expandable
  expandable = false,
  renderExpandedRow,
  expandedKeys: controlledExpandedKeys,
  onExpandChange,

  // Search
  searchable = false,
  searchValue: controlledSearchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',

  // Pagination
  pagination = false,
  currentPage: controlledCurrentPage,
  pageSize: controlledPageSize,
  totalItems: controlledTotalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],

  // Actions
  rowActions,
  actionsHeader = 'Actions',
  actionsWidth,

  // States
  loading = false,
  loadingMessage = 'Loading records...',
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items to display matching the criteria.',
  emptyIcon,

  // Layout
  className = '',
  tableClassName = '',
  stickyHeader = false,
  compact = false,
  onRowClick,
  headerRightContent,
}: DataTableProps<T>) {
  // Internal sort state for uncontrolled usage
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>()
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc')
  const sortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey
  const sortDirection = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDir

  // Internal search state for uncontrolled usage
  const [internalSearch, setInternalSearch] = useState('')
  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearch

  // Internal selection state for uncontrolled usage
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(new Set())
  const selectedKeySet = useMemo(() => {
    if (controlledSelectedKeys) {
      return controlledSelectedKeys instanceof Set
        ? controlledSelectedKeys
        : new Set(controlledSelectedKeys)
    }
    return internalSelectedKeys
  }, [controlledSelectedKeys, internalSelectedKeys])

  // Internal expanded state for uncontrolled usage
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string | number>>(new Set())
  const expandedKeySet = useMemo(() => {
    if (controlledExpandedKeys) {
      return controlledExpandedKeys instanceof Set
        ? controlledExpandedKeys
        : new Set(controlledExpandedKeys)
    }
    return internalExpandedKeys
  }, [controlledExpandedKeys, internalExpandedKeys])

  // Internal pagination state for uncontrolled usage
  const [internalPage, setInternalPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(10)
  const currentPage = controlledCurrentPage !== undefined ? controlledCurrentPage : internalPage
  const pageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize

  // Client-side filtering when search is not handled externally
  const filteredData = useMemo(() => {
    if (onSearchChange || !searchable || !searchValue.trim()) {
      return data
    }
    const q = searchValue.toLowerCase().trim()
    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      )
    )
  }, [data, onSearchChange, searchable, searchValue])

  // Client-side sorting when onSort is not handled externally
  const sortedData = useMemo(() => {
    if (onSort || !sortKey) {
      return filteredData
    }
    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey]
      const bVal = (b as Record<string, unknown>)[sortKey]
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, onSort, sortKey, sortDirection])

  // Pagination calculation
  const totalItems = controlledTotalItems !== undefined ? controlledTotalItems : sortedData.length
  const totalPages = Math.ceil(totalItems / pageSize) || 1

  const paginatedData = useMemo(() => {
    if (!pagination || onPageChange) {
      return sortedData
    }
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [pagination, onPageChange, sortedData, currentPage, pageSize])

  // Sort click handler
  const handleSortClick = (key: string) => {
    const nextDir = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    if (onSort) {
      onSort(key, nextDir)
    } else {
      setInternalSortKey(key)
      setInternalSortDir(nextDir)
    }
  }

  // Row selection handler
  const handleSelectRow = (key: string | number) => {
    const next = new Set(selectedKeySet)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    if (onSelectionChange) {
      onSelectionChange(Array.from(next))
    } else {
      setInternalSelectedKeys(next)
    }
  }

  // Select all handler
  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selectedKeySet)
    const currentKeys = paginatedData.map((row, idx) => keyExtractor(row, idx))

    if (e.target.checked) {
      currentKeys.forEach((k) => next.add(k))
    } else {
      currentKeys.forEach((k) => next.delete(k))
    }

    if (onSelectionChange) {
      onSelectionChange(Array.from(next))
    } else {
      setInternalSelectedKeys(next)
    }
  }

  // Row expand handler
  const handleToggleExpand = (key: string | number) => {
    const next = new Set(expandedKeySet)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    if (onExpandChange) {
      onExpandChange(Array.from(next))
    } else {
      setInternalExpandedKeys(next)
    }
  }

  const allPageKeysSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, idx) => selectedKeySet.has(keyExtractor(row, idx)))

  const somePageKeysSelected =
    paginatedData.some((row, idx) => selectedKeySet.has(keyExtractor(row, idx))) &&
    !allPageKeysSelected

  const totalCols =
    columns.length +
    (selectable ? 1 : 0) +
    (expandable ? 1 : 0) +
    (rowActions ? 1 : 0)

  return (
    <div className={`app-table-wrapper ${className}`}>
      {(searchable || headerRightContent) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            flexWrap: 'wrap',
          }}
        >
          {searchable ? (
            <TableSearch
              value={searchValue}
              onChange={(val) => {
                if (onSearchChange) onSearchChange(val)
                else setInternalSearch(val)
              }}
              placeholder={searchPlaceholder}
            />
          ) : (
            <div />
          )}

          {headerRightContent && <div>{headerRightContent}</div>}
        </div>
      )}

      <div className="app-table-scroll">
        <table
          className={`app-data-table ${stickyHeader ? 'app-data-table--sticky' : ''} ${compact ? 'app-data-table--compact' : ''} ${tableClassName}`}
        >
          <thead>
            <tr>
              {selectable && (
                <th className="app-data-table__checkbox-cell">
                  <input
                    type="checkbox"
                    className="app-data-table__checkbox"
                    checked={allPageKeysSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageKeysSelected
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows on page"
                  />
                </th>
              )}

              {expandable && <th className="app-data-table__expand-cell" />}

              {columns.map((col) => {
                const isSorted = sortKey === col.key
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width, textAlign: col.align || 'left' }}
                    className={`${col.sortable ? 'app-th--sortable' : ''} ${col.className || ''}`}
                    onClick={() => col.sortable && handleSortClick(col.key)}
                  >
                    <div className="app-th-content">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span
                          className={`app-th-sort-icon ${isSorted ? 'app-th-sort-icon--active' : ''}`}
                        >
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}

              {rowActions && (
                <th
                  style={{
                    width: actionsWidth,
                    textAlign: 'right',
                    paddingRight: '1.25rem',
                  }}
                >
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={totalCols}>
                  <div className="app-table-loading">
                    <div className="app-table-spinner" />
                    <span>{loadingMessage}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={totalCols}>
                  <div className="app-table-empty">
                    <div className="app-table-empty__icon">
                      {emptyIcon || <FolderOpen size={44} strokeWidth={1.5} />}
                    </div>
                    <h4 className="app-table-empty__title">{emptyTitle}</h4>
                    <p className="app-table-empty__message">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey = keyExtractor(row, index)
                const isSelected = selectedKeySet.has(rowKey)
                const isExpanded = expandedKeySet.has(rowKey)

                if (expandable && renderExpandedRow) {
                  return (
                    <ExpandableTableRow
                      key={rowKey}
                      isExpanded={isExpanded}
                      onToggle={() => handleToggleExpand(rowKey)}
                      colSpan={totalCols - 1}
                      expandedContent={renderExpandedRow(row, index)}
                      className={isSelected ? 'app-row--selected' : ''}
                    >
                      {selectable && (
                        <td
                          className="app-data-table__checkbox-cell"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="app-data-table__checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowKey)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </td>
                      )}

                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{ textAlign: col.align || 'left' }}
                          className={col.className}
                          onClick={() => onRowClick?.(row, index)}
                        >
                          {col.render
                            ? col.render(row, index)
                            : String((row as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      ))}

                      {rowActions && (
                        <td
                          style={{ textAlign: 'right', paddingRight: '1.25rem' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {rowActions(row, index)}
                        </td>
                      )}
                    </ExpandableTableRow>
                  )
                }

                return (
                  <tr
                    key={rowKey}
                    className={isSelected ? 'app-row--selected' : ''}
                    style={{ cursor: onRowClick ? 'pointer' : undefined }}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable && (
                      <td
                        className="app-data-table__checkbox-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="app-data-table__checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowKey)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || 'left' }}
                        className={col.className}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}

                    {rowActions && (
                      <td
                        style={{ textAlign: 'right', paddingRight: '1.25rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rowActions(row, index)}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(p) => {
            if (onPageChange) onPageChange(p)
            else setInternalPage(p)
          }}
          onPageSizeChange={(s) => {
            if (onPageSizeChange) onPageSizeChange(s)
            else {
              setInternalPageSize(s)
              setInternalPage(1)
            }
          }}
          disabled={loading}
        />
      )}
    </div>
  )
}
