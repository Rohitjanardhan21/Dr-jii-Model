import React from 'react'
import './Header.css'

const Header = ({ sidebarOpen }) => {
  return (
    <header className={`header ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <div className="profile-picture-header">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#E0F2FE"/>
              <circle cx="20" cy="16" r="6" fill="#2563EB"/>
              <path d="M8 32C8 28 12 26 20 26C28 26 32 28 32 32" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="12" r="2" fill="#ffffff"/>
              <path d="M16 18C16 16.8954 16.8954 16 18 16H22C23.1046 16 24 16.8954 24 18V20C24 21.1046 23.1046 22 22 22H18C16.8954 22 16 21.1046 16 20V18Z" fill="#ffffff"/>
            </svg>
          </div>
          <span className="header-logo-text">Dr. Jii</span>
        </div>
        <div className="header-actions">
          <button className="btn-login-register">Login/Register</button>
        </div>
      </div>
    </header>
  )
}

export default Header

