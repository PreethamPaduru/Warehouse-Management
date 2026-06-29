import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Printer, Search, Trash2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, formatQrText, getAuthHeaders } from './dashboardData.js'

function WarehouseManagement() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/items`, { headers: getAuthHeaders() })
        const result = await response.json()
        if (!response.ok || !result.success) {
          toast.error(result.message || 'Unable to load warehouse records')
          return
        }
        setItems(result.items || [])
      } catch (err) {
        toast.error('Cannot connect to backend')
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [navigate])

  const creators = useMemo(() => [...new Set(items.map((item) => item.createdBy?.name).filter(Boolean))], [items])

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase()
    return items.filter((item) => {
      const matchesSearch = [
        item.itemDescription,
        item.itemCode,
        item.batchNo,
        item.storageLocation,
        item.createdBy?.name
      ].some((value) => value?.toLowerCase().includes(query))
      const matchesCreator = creatorFilter === 'all' || item.createdBy?.name === creatorFilter
      return matchesSearch && matchesCreator
    })
  }, [items, search, creatorFilter])

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/warehouse/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        toast.error(result.message || 'Unable to delete QR record')
        return
      }
      setItems(items.filter((item) => item._id !== id))
      toast.success('QR record deleted')
    } catch (err) {
      toast.error('Cannot connect to backend')
    }
  }

  return (
    <DashboardLayout title="Warehouse Management" subtitle="Shared item and QR records created by every employee.">
      <section className="dashboard-card">
        <div className="warehouse-toolbar">
           <div className="search-box">
            <Search size={19} />
            <input
              value={search}
              placeholder="Search item, code, batch, location, or creator"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select value={creatorFilter} onChange={(e) => setCreatorFilter(e.target.value)}>
            <option value="all">All creators</option>
            {creators.map((creator) => <option value={creator} key={creator}>{creator}</option>)}
          </select>
        </div>
      </section>

      <section className="warehouse-grid">
        {loading && <article className="dashboard-card">Loading warehouse records...</article>}
        {!loading && filteredItems.map((item) => (
          <article className="warehouse-card" key={item._id}>
            <QRCodeCanvas value={formatQrText(item)} size={96} includeMargin />
            <div className="warehouse-card-body">
              <div>
                <strong>{item.itemDescription}</strong>
                <span>{item.itemCode}</span>
              </div>
              <dl>
                <dt>Batch</dt><dd>{item.batchNo}</dd>
                <dt>Qty</dt><dd>{item.quantity}</dd>
                <dt>Location</dt><dd>{item.storageLocation}</dd>
                <dt>Created By</dt><dd>{item.createdBy?.name}</dd>
              </dl>
              <div className="record-actions">
                <Link to={`/scan/${item._id}`}><Eye size={16} /> View</Link>
                <Link to={`/labels?item=${item._id}`}><Printer size={16} /> Print</Link>
                <button type="button" onClick={() => deleteItem(item._id)}><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!loading && !filteredItems.length && (
          <article className="dashboard-card empty-text">No matching warehouse records found.</article>
        )}
      </section>
    </DashboardLayout>
  )
}

export default WarehouseManagement
