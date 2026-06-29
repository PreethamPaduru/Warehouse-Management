import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Boxes, ClipboardList, IdCard, LayoutDashboard, Printer, QrCode, Warehouse, Search, Bell, Settings, LogOut } from 'lucide-react'
import { API_URL, getAuthHeaders } from './dashboardData.js'

export const DashboardSearchContext = React.createContext({
  searchTerm: '',
  setSearchTerm: () => {}
})

function DashboardLayout({ children, title, subtitle }) {
  const navigate = useNavigate()
  const userName = localStorage.getItem('loggedInUser') || 'User'
  const userEmail = localStorage.getItem('loggedInEmail') || 'preethampaduru@gmail.com'
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const notificationRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/warehouse/notifications`, { headers: getAuthHeaders() })
      const result = await response.json()

      if (result.success) {
        setNotifications(result.notifications || [])
        setUnreadCount(result.unreadCount || 0)
      }
    } catch (err) {
      console.error('Unable to load notifications', err)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 30000)

    return () => window.clearInterval(intervalId)
  }, [loadNotifications])

  useEffect(() => {
    if (!notificationsOpen) {
      return undefined
    }

    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)

    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [notificationsOpen])

  const formatNotificationTime = (dateValue) => {
    if (!dateValue) {
      return ''
    }

    const date = new Date(dateValue)
    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)

    if (diffMinutes < 1) {
      return 'Just now'
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`
    }

    if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} hr ago`
    }

    return date.toLocaleDateString()
  }

  const openNotifications = async () => {
    const nextOpen = !notificationsOpen
    setNotificationsOpen(nextOpen)

    if (!nextOpen) {
      return
    }

    await loadNotifications()

    try {
      await fetch(`${API_URL}/warehouse/notifications/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      setUnreadCount(0)
    } catch (err) {
      console.error('Unable to mark notifications read', err)
    }
  }

  const clearNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/warehouse/notifications`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Unable to clear notifications', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('loggedInEmail')
    navigate('/login')
  }

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-search">
            <Search size={16} />
            <input
              placeholder="Search items, batches, or suppliers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="topbar-right">
          <div className="top-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              <button className="icon-btn notification-button" type="button" onClick={openNotifications} aria-label="Open notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <section className="notification-panel">
                  <header>
                    <strong>Notifications</strong>
                    <div>
                      <span>{notifications.length} recent</span>
                      <button className="notification-clear" type="button" onClick={clearNotifications} disabled={!notifications.length}>Clear</button>
                    </div>
                  </header>
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <article className={`notification-item ${notification.type?.toLowerCase()}`} key={notification._id}>
                        <div>
                          <strong>{notification.title}</strong>
                          <span>{formatNotificationTime(notification.createdAt)}</span>
                        </div>
                        <p>{notification.message}</p>
                        {notification.item?.batchNo && <small>Batch: {notification.item.batchNo}</small>}
                      </article>
                    ))}
                    {!notifications.length && <p className="notification-empty">No notifications yet.</p>}
                  </div>
                </section>
              )}
            </div>
            <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </header>
      <div className="dashboard-shell">
        <aside className="sidebar"> 
          <Link className="brand-mark" to="/home">
            <Warehouse size={34} />
            <span>Eugia Pharma</span>
          </Link>
          <nav>
            <NavLink to="/home"><LayoutDashboard size={18} /> Dashboard</NavLink>
            <NavLink to="/employee"><IdCard size={18} /> Employee Details</NavLink>
            <NavLink to="/create-item"><ClipboardList size={18} /> Create Item</NavLink>
            <NavLink to="/warehouse"><Boxes size={18} /> Warehouse Management</NavLink>
            <NavLink to="/generated-qrs"><QrCode size={18} /> Generated QR List</NavLink>
            <NavLink to="/labels"><Printer size={18} /> Label Printing</NavLink>
            <NavLink to="/settings"><Settings size={18} /> Settings</NavLink>
          </nav>
          <div className="sidebar-profile">
            <div className="sidebar-avatar" aria-hidden="true">{userInitials}</div>
            <div className="sidebar-profile-text">
              <strong title={userName}>{userName}</strong>
              <span title={userEmail}>{userEmail}</span>
            </div>
            <button className="sidebar-profile-action" type="button" onClick={handleLogout} aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        <DashboardSearchContext.Provider value={{ searchTerm, setSearchTerm }}>
          <section className="dashboard-content">
            <header className="dashboard-hero">
              <div>
                <p className="eyebrow">Welcome, {userName}</p>
                <h1>{title}</h1>
                <span>{subtitle}</span>
              </div>
            </header>
            {children}
          </section>
        </DashboardSearchContext.Provider>
      </div>
    </main>
  )
}

export default DashboardLayout
