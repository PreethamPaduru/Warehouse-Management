import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, employeeFields, getAuthHeaders } from './dashboardData.js'

const profileFields = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Enter your full name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email' },
  { key: 'position', label: 'Position', type: 'text', placeholder: 'Enter your position' },
  ...employeeFields.map((field) => ({ ...field, type: 'text' }))
]

const emptyProfile = profileFields.reduce((values, field) => {
  values[field.key] = ''
  return values
}, {})

function Settings() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/profile`, { headers: getAuthHeaders() })
        const data = await response.json()
        if (data.profile) {
          setProfile((prev) => ({ ...prev, ...data.profile }))
        }
      } catch (err) {
        toast.error('Failed to load profile')
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/warehouse/profile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile)
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        toast.error(data.message || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.ok) {
        localStorage.removeItem('token')
        localStorage.removeItem('loggedInUser')
        localStorage.removeItem('loggedInEmail')
        toast.success('Account deleted successfully')
        navigate('/login')
      } else {
        toast.error('Failed to delete account')
      }
    } catch (err) {
      toast.error('Error deleting account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Settings" subtitle="">
      <section className="settings-container">
        <div className="settings-card">
          <h3>Employee Details</h3>
          <p className="settings-subtitle">Update your employee information</p>

          <div className="form-grid">
            {profileFields.map((field) => (
              <div className="form-group" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <input
                  id={field.key}
                  type={field.type}
                  name={field.key}
                  value={profile[field.key] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <button 
            className="save-btn" 
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : <><Save size={17} /> Save Changes</>}
          </button>
        </div>

        <div className="settings-card danger-zone">
          <h3>Danger Zone</h3>
          
          <div className="danger-item">
            <div>
              <h4>Delete Account</h4>
              <p>Permanently delete your account and all associated data</p>
            </div>
            <button 
              className="delete-btn" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </section>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="modal-cancel" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-delete" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default Settings
