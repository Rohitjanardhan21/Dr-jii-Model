import React, { useState, useRef, useEffect } from 'react'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose, chats, onNewChat, onSelectChat, activeChatId, onDeleteChat, onRenameChat, onToggleSidebar, onExit }) => {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isPreviousChatsOpen, setIsPreviousChatsOpen] = useState(true)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const menuRefs = useRef({})
  const profileMenuRef = useRef(null)
  const inputRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        setOpenMenuId(null)
      }
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, isProfileMenuOpen])

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleMenuClick = (e, chatId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === chatId ? null : chatId)
  }

  const handleEditClick = (e, chat) => {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditValue(chat.title)
    setOpenMenuId(null)
  }

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(chatId)
    }
    setOpenMenuId(null)
  }

  const handleEditSubmit = (e, chatId) => {
    e.stopPropagation()
    if (editValue.trim()) {
      onRenameChat(chatId, editValue.trim())
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleEditCancel = (e) => {
    e.stopPropagation()
    setEditingId(null)
    setEditValue('')
  }

  const handleKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      handleEditSubmit(e, chatId)
    } else if (e.key === 'Escape') {
      handleEditCancel(e)
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-icons">
          <button className="sidebar-icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
              <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
              <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
              <path d="M12 6H21M12 12H21M12 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="sidebar-icon-btn" onClick={onNewChat} aria-label="Edit">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="sidebar-icon-btn" 
            onClick={() => {
              if (isOpen) {
                if (searchInputRef.current) {
                  searchInputRef.current.focus()
                }
              } else {
                onToggleSidebar()
                setTimeout(() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus()
                  }
                }, 300)
              }
            }}
            aria-label="Search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {isOpen && (
          <>
        <div className="sidebar-top">
          <button className="btn-close-sidebar" onClick={onClose} aria-label="Close sidebar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="profile-picture-wrapper" ref={profileMenuRef}>
            <button 
              className="profile-picture-btn" 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-label="Profile menu"
            >
              <div className="profile-picture">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#E0F2FE"/>
                  <circle cx="20" cy="16" r="6" fill="#2563EB"/>
                  <path d="M8 32C8 28 12 26 20 26C28 26 32 28 32 32" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="20" cy="12" r="2" fill="#ffffff"/>
                  <path d="M16 18C16 16.8954 16.8954 16 18 16H22C23.1046 16 24 16.8954 24 18V20C24 21.1046 23.1046 22 22 22H18C16.8954 22 16 21.1046 16 20V18Z" fill="#ffffff"/>
                </svg>
              </div>
            </button>
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-user-info">
                    <div className="profile-dropdown-username">UserName</div>
                    <div className="profile-dropdown-email">user@gmail.com</div>
                  </div>
                  <button className="profile-dropdown-menu-btn" aria-label="More options">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="4" r="1" fill="currentColor"/>
                      <circle cx="8" cy="8" r="1" fill="currentColor"/>
                      <circle cx="8" cy="12" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div className="profile-dropdown-divider"></div>
                <button className="profile-dropdown-exit" onClick={() => {
                  setIsProfileMenuOpen(false)
                  if (onExit) {
                    onExit()
                  }
                }}>
                  Exit
                </button>
                <button 
                  className="profile-dropdown-close" 
                  onClick={() => setIsProfileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-actions">
          <button className="sidebar-action-item" onClick={onNewChat}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2.5H12C12.2761 2.5 12.5 2.72386 12.5 3V14.5C12.5 14.7761 12.2761 15 12 15H3C2.72386 15 2.5 14.7761 2.5 14.5V3C2.5 2.72386 2.72386 2.5 3 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 5.5H11M4.5 8H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M11 11L13.5 8.5L15.5 10.5L13 13L11 11Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.5 8.5L15 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>New Chat</span>
          </button>
          <div className="sidebar-action-item search-wrapper">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search Chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section">
            <button 
              className="sidebar-section-header"
              onClick={() => setIsPreviousChatsOpen(!isPreviousChatsOpen)}
            >
              <h3 className="sidebar-section-title">Previous Chats</h3>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`chevron-icon ${isPreviousChatsOpen ? 'open' : ''}`}
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isPreviousChatsOpen && (
              <div className="chat-list">
                {filteredChats.length === 0 ? (
                  <div className="no-chats">
                    <p>No chats found</p>
                    <p className="no-chats-subtitle">Start a new conversation</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item-wrapper ${activeChatId === chat.id ? 'active' : ''}`}
                  >
                    <button
                      className="chat-item"
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3H14M2 8H14M2 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {editingId === chat.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          className="chat-edit-input"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={(e) => handleEditSubmit(e, chat.id)}
                          onKeyDown={(e) => handleKeyDown(e, chat.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="chat-title">{chat.title}</span>
                      )}
                    </button>
                    {editingId !== chat.id && (
                      <div className="chat-menu-wrapper" ref={el => menuRefs.current[chat.id] = el}>
                        <button
                          className="chat-menu-btn"
                          onClick={(e) => handleMenuClick(e, chat.id)}
                          aria-label="Chat options"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="4" r="1" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1" fill="currentColor"/>
                            <circle cx="8" cy="12" r="1" fill="currentColor"/>
                          </svg>
                        </button>
                        {openMenuId === chat.id && (
                          <div className="chat-menu-dropdown">
                            <button
                              className="chat-menu-item"
                              onClick={(e) => handleEditClick(e, chat)}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.68601 11.9447 1.59124C12.1731 1.49647 12.4173 1.44775 12.6633 1.44775C12.9094 1.44775 13.1536 1.49647 13.382 1.59124C13.6104 1.68601 13.8183 1.8249 13.9933 2.00001C14.1684 2.17512 14.3073 2.38305 14.4021 2.61144C14.4969 2.83983 14.5456 3.08401 14.5456 3.33001C14.5456 3.57601 14.4969 3.82019 14.4021 4.04858C14.3073 4.27697 14.1684 4.4849 13.9933 4.66001L5.05333 13.6L1.33333 14.6667L2.4 10.9467L11.3333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Edit name
                            </button>
                            <button
                              className="chat-menu-item delete"
                              onClick={(e) => handleDeleteClick(e, chat.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 4H14M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </aside>
    </>
  )
}

export default Sidebar

