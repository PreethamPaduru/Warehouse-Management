import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Boxes, ClipboardList, Printer, QrCode, Warehouse, Eye } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout, { DashboardSearchContext } from './DashboardLayout.jsx'
import { API_URL, getAuthHeaders } from './dashboardData.js'

function Home() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [items, setItems] = useState([])

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const parseDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const { searchTerm } = useContext(DashboardSearchContext)
  const userName = localStorage.getItem('loggedInUser') || ''
  const createdByCurrentUser = (item) => {
    const email = item.createdBy?.email?.toLowerCase()
    const name = item.createdBy?.name
    return (
      (profile?.email && email === profile.email.toLowerCase()) ||
      (name && name === userName)
    )
  }

  const filteredItems = items.filter((item) => {
    const term = searchTerm?.trim().toLowerCase()
    if (!term) return true

    return [
      item.itemDescription,
      item.itemCode,
      item.batchNo,
      item.supplier,
      item.storageLocation
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term))
  })

  const totalLabelsGenerated = filteredItems.length
  const qrCodesToday = filteredItems.filter((item) => {
    const createdAt = parseDate(item.createdAt)
    return createdAt && createdAt >= todayStart && createdAt < todayEnd
  }).length
  const expiringItems = filteredItems.filter((item) => {
    const expiry = parseDate(item.expiryDate)
    if (!expiry) return false
    const delta = (expiry.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
    return delta >= 0 && delta <= 30
  })
  const itemsNearExpiry = expiringItems.length
  const uniqueMedicinesCreated = new Set(
    filteredItems
      .filter(createdByCurrentUser)
      .map((item) => (item.itemCode || item.itemDescription || '').trim().toLowerCase())
      .filter(Boolean)
  ).size
  const totalStockQuality = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0)
  const latestItems = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    const load = async () => {
      try {
        const [profileResponse, itemsResponse] = await Promise.all([
          fetch(`${API_URL}/warehouse/profile`, { headers: getAuthHeaders() }),
          fetch(`${API_URL}/warehouse/items`, { headers: getAuthHeaders() })
        ])
        const profileResult = await profileResponse.json()
        const itemsResult = await itemsResponse.json()
        setProfile(profileResult.profile)
        setItems(itemsResult.items || [])
      } catch (err) {
        toast.error('Unable to load dashboard')
      }
    }

    load()
  }, [navigate])

  const formatCreatedAt = (value) => {
    const date = parseDate(value)
    if (!date) return 'Unknown'

    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((day - todayStart) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === -1) return 'Yesterday'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const metrics = [
    { label: 'Total Medicines', value: uniqueMedicinesCreated, icon: QrCode },
    { label: 'Total Stocks Quality', value: totalStockQuality, icon: Warehouse },
    { label: 'Total Labels Generated', value: totalLabelsGenerated, icon: Printer },
    { label: 'QR Codes Generated Today', value: qrCodesToday, icon: QrCode },
    { label: 'Items Near Expiry', value: itemsNearExpiry, icon: Boxes }
  ]

  const formatExpiryDate = (value) => {
    const date = parseDate(value)
    if (!date) return 'Unknown'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatExpiryDaysLeft = (value) => {
    const expiry = parseDate(value)
    if (!expiry) return 'Unknown'

    const delta = Math.ceil((expiry.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))
    if (delta === 0) return 'Today'
    if (delta === 1) return 'Tomorrow'
    return `${delta} days`
  }

  return (
    <DashboardLayout
      title="DASHBOARD"
      subtitle=""
    >
      <section className="stats-grid">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <article className="stat-card" key={m.label}>
              <Icon size={24} />
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </article>
          )
        })}
      </section>

      <section className="dashboard-card">
        <div className="section-heading">
          <h2>Items Near Expiry</h2>
          <span>{expiringItems.length} items expiring in 30 days</span>
        </div>
        <div className="latest-items-table-wrapper">
          <table className="latest-items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Batch</th>
                <th>Expiry Date</th>
                <th>Days Left</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expiringItems.length ? expiringItems.slice(0, 8).map((item) => (
                <tr key={item._id}>
                  <td>{item.itemDescription || 'Untitled Item'}</td>
                  <td>{item.batchNo || '—'}</td>
                  <td>{formatExpiryDate(item.expiryDate)}</td>
                  <td>{formatExpiryDaysLeft(item.expiryDate)}</td>
                  <td>
                    <Link className="hero-link" to={`/scan/${item._id}`}>
                      <Eye size={14} /> View
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="empty-text">No items expiring soon.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="section-heading">
          <h2>Latest Generated Items</h2>
          <span>{latestItems.length} most recent records</span>
        </div>
        <div className="latest-items-table-wrapper">
          <table className="latest-items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Created By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.itemDescription || 'Untitled Item'}</td>
                  <td>{item.batchNo || '—'}</td>
                  <td>{item.quantity || '0'}</td>
                  <td>{item.createdBy?.name || 'Unknown'}</td>
                  <td>{formatCreatedAt(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Home
