import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from './DashboardLayout.jsx'
import { API_URL, employeeFields, emptyObject, getAuthHeaders } from './dashboardData.js'

function EmployeeDetails() {
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(emptyObject(employeeFields))
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/warehouse/profile`, { headers: getAuthHeaders() })
        const result = await response.json()
        if (result.profile) {
          setProfile(result.profile)
          setEmployee({
            employeeId: result.profile.employeeId || '',
            department: result.profile.department || '',
            designation: result.profile.designation || '',
            phone: result.profile.phone || '',
            location: result.profile.location || ''
          })
        }
      } catch (err) {
        toast.error('Unable to load employee details')
      }
    }

    loadProfile()
  }, [navigate])

  const saveProfile = async () => {
    const missingField = employeeFields.find((field) => !employee[field.key].trim())
    if (missingField) {
      toast.error(`Please enter ${missingField.label}`)
      return
    }

    try {
      const response = await fetch(`${API_URL}/warehouse/profile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(employee)
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        toast.error(result.message || 'Unable to save employee details')
        return
      }
      setProfile(result.profile)
      toast.success('Employee details saved')
    } catch (err) {
      toast.error('Cannot connect to backend')
    }
  }

  return (
    <DashboardLayout
      title="Employee Details"
      subtitle={profile ? 'Your employee information from the database.' : 'No employee details found. Fill and save them to continue.'}
    >
      {profile ? (
        <section className="employee-display-section">
          <h3>Current Employee Information</h3>
          <div className="employee-display-grid">
            <div className="display-field">
              <span>Name</span>
              <strong>{profile.name || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Email</span>
              <strong>{profile.email || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Department</span>
              <strong>{profile.department || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Position</span>
              <strong>{profile.position || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Employee ID</span>
              <strong>{profile.employeeId || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Phone</span>
              <strong>{profile.phone || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Location</span>
              <strong>{profile.location || 'N/A'}</strong>
            </div>
            <div className="display-field">
              <span>Designation</span>
              <strong>{profile.designation || 'N/A'}</strong>
            </div>
          </div>
        </section>
      ) : (
        <section className="dashboard-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile Missing</p>
              <h2>Create Employee Profile</h2>
            </div>
          </div>
          <div className="form-grid">
            {employeeFields.map((field) => (
              <div className="form-group" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <input
                  id={field.key}
                  value={employee[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => setEmployee({ ...employee, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button className="primary-button" onClick={saveProfile}>
            <Save size={17} /> Save Details
          </button>
        </section>
      )}
    </DashboardLayout>
  )
}

export default EmployeeDetails
