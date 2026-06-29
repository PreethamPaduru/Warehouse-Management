import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Printer, Search } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, formatQrText, getAuthHeaders } from './dashboardData.js'

function LabelPrinting() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedId = new URLSearchParams(location.search).get('item')
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
        toast.error('Unable to load labels')
      }
    }

    loadItems()
  }, [navigate])

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => [item.itemDescription, item.batchNo, item.itemCode]
      .some((value) => value?.toLowerCase().includes(search.toLowerCase())))

    if (!selectedId) {
      return filtered
    }

    return filtered.filter((item) => item._id === selectedId)
  }, [items, search, selectedId])

  return (
    <DashboardLayout title="Label Printing" subtitle="Print professional QR labels for cartons, packages, and stock bins.">
      <section className="dashboard-card no-print">
        <div className="section-heading">
          <div className="search-box">
            <Search size={18} />
            <input value={search} placeholder="Search label records" onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="primary-button compact-button" type="button" onClick={() => window.print()}>
            <Printer size={17} /> Print Labels
          </button>
        </div>
      </section>
      <section className="print-label-grid">
        {visibleItems.map((item) => (
          <article className="print-label medicine-label" key={item._id}>
            <div className="print-label-main">
              <div className="label-qr">
                <QRCodeCanvas value={formatQrText(item)} size={220} includeMargin={false} />
              </div>
              <div className="medicine-label-details">
                <div><span>GTIN:</span> {item.gtin || item.itemCode}</div>
                <div><span>LOT:</span> {item.batchNo || item.aiBatch}</div>
                <div><span>EXP DT:</span> {item.expiryDate || item.aiExp}</div>
                <div><span>SR:</span> {item.itemCode || item.quantity}</div>
              </div>
            </div>
          </article>
        ))}
        {!visibleItems.length && <article className="dashboard-card empty-text">No labels available.</article>}
      </section>
    </DashboardLayout>
  )
}

export default LabelPrinting
