import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, QrCode, Save } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, detailFields, emptyObject, formatQrText, getAuthHeaders } from './dashboardData.js'

function CreateItem() {
  const navigate = useNavigate()
  const [details, setDetails] = useState(emptyObject(detailFields))
  const [profileReady, setProfileReady] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [createdItem, setCreatedItem] = useState(null)
  const [generatedItem, setGeneratedItem] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    const checkProfile = async () => {
      const response = await fetch(`${API_URL}/warehouse/profile`, { headers: getAuthHeaders() })
      const result = await response.json()
      setProfileReady(Boolean(result.profile))
    }

    checkProfile()
  }, [navigate])

  const validateItemDetails = () => {
    if (!profileReady) {
      toast.error('Please save employee details first')
      navigate('/employee')
      return false
    }

    const missingField = detailFields.find((field) => !details[field.key].trim())
    if (missingField) {
      toast.error(`Please enter ${missingField.label.replace(':', '')}`)
      return false
    }

    return true
  }

  const previewDetails = () => {
    if (!validateItemDetails()) {
      return
    }

    setPreviewItem({
      ...details,
      createdBy: {
        name: localStorage.getItem('loggedInUser') || 'Current User'
      }
    })
    toast.success('Preview ready')
  }

  const createQrCode = async () => {
    if (!validateItemDetails()) {
      return null
    }

    try {
      const response = await fetch(`${API_URL}/warehouse/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...details, scanBaseUrl: window.location.origin })
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        toast.error(result.message || 'Unable to save item')
        return
      }
      setCreatedItem(result.item)
      setPreviewItem(null)
      setGeneratedItem(null)
      toast.success('QR record created')
      return result.item
    } catch (err) {
      toast.error('Cannot connect to backend')
      return null
    }
  }

  const generateQr = async () => {
    const item = createdItem || await createQrCode()

    if (!item) {
      return
    }

    setGeneratedItem(item)
    setDetails(emptyObject(detailFields))
    setCreatedItem(null)
    setPreviewItem(null)
    toast.success('QR generated')
  }

  return (
    <DashboardLayout title="Create Item / Generate QR" subtitle="Enter package details and save a QR record to the shared warehouse database.">
      <section className="dashboard-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Item Entry</p>
            <h2>Package Details</h2>
          </div>
        </div>
        <section className="details-panel dashboard-details">
          {detailFields.map((field) => (
            <div className="detail-row" key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                type={['mfgDate', 'expiryDate'].includes(field.key) ? 'date' : 'text'}
                value={details[field.key]}
                placeholder={field.placeholder}
                onChange={(e) => setDetails({ ...details, [field.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="create-item-actions">
            <button className="secondary-button compact-button" type="button" onClick={previewDetails}>
              <Eye size={17} /> Preview
            </button>
            <button className="secondary-button compact-button" type="button" onClick={createQrCode}>
              <Save size={17} /> Create QR Code
            </button>
            <button className="primary-button compact-button" type="button" onClick={generateQr}>
              <QrCode size={17} /> Generate QR Code
            </button>
          </div>
        </section>
      </section>

      {previewItem && (
        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>{previewItem.itemDescription}</h2>
            </div>
          </div>
          <dl className="item-preview-list">
            {detailFields.map((field) => (
              <React.Fragment key={field.key}>
                <dt>{field.label.replace(':', '')}</dt>
                <dd>{previewItem[field.key]}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      )}

      {createdItem && !generatedItem && (
        <section className="dashboard-card">
          <div className="scan-preview">
            <p className="eyebrow">Created</p>
            <h2>{createdItem.itemDescription}</h2>
            <p className="empty-text">QR record is saved. Click Generate QR Code to display the QR.</p>
          </div>
        </section>
      )}

      {generatedItem && (
        <section className="dashboard-card">
          <div className="qr-card no-shadow">
            <div className="label-qr">
              <QRCodeCanvas value={formatQrText(generatedItem)} size={180} includeMargin />
            </div>
            <div className="scan-preview">
              <h2>{generatedItem.itemDescription}</h2>
              <p className="empty-text">Scanning this QR shows the item details in text format.</p>
              <Link className="hero-link" to={`/scan/${generatedItem._id}`}>View Scan Page</Link>
            </div>
          </div>
        </section>
      )}
    </DashboardLayout>
  )
}

export default CreateItem
