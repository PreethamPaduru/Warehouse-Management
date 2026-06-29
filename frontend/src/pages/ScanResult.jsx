import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Boxes, CalendarClock, IdCard, PackageCheck, QrCode } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, formatDateTime } from './dashboardData.js'

function ScanResult() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItem = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/public/items/${id}`)
        const result = await response.json()
        if (!response.ok || !result.success) {
          toast.error(result.message || 'Unable to load QR details')
          return
        }
        setItem(result.item)
      } catch (err) {
        toast.error('Cannot load scan result')
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [id])

  if (loading) {
    return (
      <DashboardLayout title="Scan Result" subtitle="Loading QR details from the warehouse record.">
        <section className="dashboard-card">Loading QR details...</section>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout title="Scan Result" subtitle="Unable to find the requested QR record.">
        <section className="dashboard-card">QR record not found.</section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Scan Result" subtitle="Verified package and QR record details.">
      <section className="scan-card">
        <div className="scan-hero">
          <PackageCheck size={34} />
          <div>
            <p>Warehouse Tracking</p>
            <h1>{item.itemDescription}</h1>
            <span>Verified package and QR record</span>
          </div>
        </div>

        <div className="scan-info-grid">
          <article><Boxes size={20} /><span>Item Code</span><strong>{item.itemCode}</strong></article>
          <article><QrCode size={20} /><span>Batch</span><strong>{item.batchNo}</strong></article>
          <article><CalendarClock size={20} /><span>Created</span><strong>{formatDateTime(item.createdAt)}</strong></article>
          <article><IdCard size={20} /><span>Created By</span><strong>{item.createdBy?.name}</strong></article>
        </div>

        <div className="scan-table mobile-scan-table">
          <div><span>MFG DATE</span><strong>{item.mfgDate}</strong></div>
          <div><span>EXP DATE</span><strong className="green-text">{item.expiryDate}</strong></div>
          <div><span>QUANTITY</span><strong>{item.quantity}</strong></div>
          <div><span>LOCATION</span><strong>{item.storageLocation}</strong></div>
          <div><span>SUPPLIER</span><strong>{item.supplier}</strong></div>
          <div><span>GTIN</span><strong>{item.gtin}</strong></div>
          <div><span>AI BATCH</span><strong>{item.aiBatch}</strong></div>
          <div><span>AI EXP</span><strong>{item.aiExp}</strong></div>
          <div><span>PACKAGE</span><strong>{item.labelType}</strong></div>
          <div><span>TEMP</span><strong>{item.tempStorage}</strong></div>
          <div><span>CREATOR EMAIL</span><strong>{item.createdBy?.email}</strong></div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default ScanResult
