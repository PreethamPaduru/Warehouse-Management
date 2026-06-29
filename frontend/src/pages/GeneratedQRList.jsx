import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Printer, Search } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, formatDateTime, formatQrText, getAuthHeaders } from './dashboardData.js'

function GeneratedQRList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    const loadItems = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/items`, { headers: getAuthHeaders() })
        const result = await response.json()
        setItems(result.items || [])
      } catch (err) {
        toast.error('Unable to load QR records')
      }
    }

    loadItems()
  }, [navigate])

  const filtered = items.filter((item) => [item.itemDescription, item.batchNo, item.createdBy?.name]
    .some((value) => value?.toLowerCase().includes(search.toLowerCase())))

  return (
    <DashboardLayout title="Generated QR List" subtitle="Browse every generated QR record and open scan pages or printable labels.">
      <section className="dashboard-card">
        <div className="search-box">
          <Search size={18} />
          <input value={search} placeholder="Search QR records" onChange={(e) => setSearch(e.target.value)} />
        </div>
      </section>
      <section className="warehouse-grid">
        {filtered.map((item) => (
          <article className="warehouse-card" key={item._id}>
            <div className="label-qr">
              <QRCodeCanvas value={formatQrText(item)} size={96} includeMargin />
            </div>
            <div className="warehouse-card-body">
              <div><strong>{item.itemDescription}</strong><span>{formatDateTime(item.createdAt)}</span></div>
              <dl>
                <dt>Batch</dt><dd>{item.batchNo}</dd>
                <dt>Creator</dt><dd>{item.createdBy?.name}</dd>
              </dl>
              <div className="record-actions">
                <Link to={`/scan/${item._id}`}><Eye size={16} /> View</Link>
                <Link to={`/labels?item=${item._id}`}><Printer size={16} /> Label</Link>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && <article className="dashboard-card empty-text">No QR records found.</article>}
      </section>
    </DashboardLayout>
  )
}

export default GeneratedQRList
