import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import './MainContent.css'

const MainContent = ({ activeChatId }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages for active chat
  useEffect(() => {
    if (activeChatId) {
      const savedMessages = localStorage.getItem(`chat_${activeChatId}`)
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages))
        } catch (e) {
          console.error('Error loading messages:', e)
          setMessages([])
        }
      } else {
        setMessages([])
      }
    } else {
      // Show welcome message when no chat is active
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I\'m Dr. Jii, your AI-powered medical assistant. I can help you with:\n\n• Search for patient medical reports\n• Answer questions about your database\n• View all medical reports\n• Medical knowledge queries\n\nAsk me anything! For example: "How many reports do we have?" or "What is the medical report of John Doe?"',
        timestamp: new Date().toISOString()
      }])
    }
  }, [activeChatId])

  // Save messages when they change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(messages))
    }
  }, [messages, activeChatId])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Send query to backend
      const response = await api.sendChatQuery(inputValue.trim())
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response || 'I received your message but couldn\'t generate a response.',
        timestamp: new Date().toISOString(),
        reports: response.reports || [],
        tasks: response.tasks || [],
        action: response.action
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Error: ${error.message}\n\nPlease check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  const renderReportCards = (reports) => {
    if (!reports || reports.length === 0) return null

    return (
      <div className="report-cards">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <strong>{report.report_type}</strong>
              <span className="report-date">{report.report_date}</span>
            </div>
            <div className="report-patient">Patient: {report.patient_name}</div>
            {report.extracted_text && (
              <div className="report-preview">
                {report.extracted_text.substring(0, 150)}...
              </div>
            )}
            <div className="report-actions">
              <a 
                href={api.getReportFileUrl(report.id)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="report-link"
              >
                📄 View PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <main className="main-content">
      <div className="content-container">
        {messages.length === 0 || (messages.length === 1 && messages[0].id === 'welcome') ? (
          <h1 className="main-greeting">Hi! How can I help you today in Healthcare?</h1>
        ) : (
          <div className="chat-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}-message`}>
                <div className="message-avatar">
                  {message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  {message.reports && renderReportCards(message.reports)}
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="input-wrapper">
        <div className="input-container">
          <button className="input-icon plus-icon" aria-label="Add">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input 
            type="text" 
            className="main-input" 
            placeholder="Ask anything related to healthcare..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="input-icon send-icon" 
            aria-label="Send"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33333 10L16.6667 10M10 3.33333L16.6667 10L10 16.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}

export default MainContent

