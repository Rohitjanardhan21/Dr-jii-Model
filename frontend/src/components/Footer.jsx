import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text">
        By messaging Dr. Jiii, an AI chatbot, you agree to our{' '}
        <a href="#" className="footer-link">Terms</a> and have read our{' '}
        <a href="#" className="footer-link">Privacy Policy</a>. See{' '}
        <a href="#" className="footer-link">Cookie Preferences</a>.
      </p>
    </footer>
  )
}

export default Footer

