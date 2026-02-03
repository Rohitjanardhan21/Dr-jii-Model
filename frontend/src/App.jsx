import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Footer from './components/Footer'
import './App.css'

function App() {
  // Sidebar open by default on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 769)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)

  // Handle window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      // Only auto-close on mobile, don't force open on desktop
      // This allows users to manually close sidebar on desktop
      if (window.innerWidth < 769) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chats')
    if (savedChats) {
      try {
        setChats(JSON.parse(savedChats))
      } catch (e) {
        console.error('Error loading chats:', e)
      }
    }
  }, [])

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats))
    }
  }, [chats])

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString()
    }
    setChats([newChat, ...chats])
    setActiveChatId(newChat.id)
    // Keep sidebar open when creating new chat
  }

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId)
    setSidebarOpen(false)
  }

  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId)
    setChats(updatedChats)
    if (activeChatId === chatId) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
    // Update localStorage
    if (updatedChats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(updatedChats))
    } else {
      localStorage.removeItem('chats')
    }
  }

  const handleRenameChat = (chatId, newTitle) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    )
    setChats(updatedChats)
    localStorage.setItem('chats', JSON.stringify(updatedChats))
  }

  const handleExit = () => {
    // Handle logout/exit functionality
    // You can add logout logic here, such as clearing tokens, redirecting, etc.
    console.log('User logged out')
    // Example: window.location.href = '/login'
  }

  return (
    <div className="app">
      <Header sidebarOpen={sidebarOpen} />
      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
          onToggleSidebar={handleToggleSidebar}
          chats={chats}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onExit={handleExit}
        />
        <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <MainContent activeChatId={activeChatId} />
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default App

