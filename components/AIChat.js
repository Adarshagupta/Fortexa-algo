import { useState, useRef, useEffect } from 'react'
import styles from './AIChat.module.css'

const API_KEY = 'AIzaSyBCryakoqEloM2doWvsBhtZRplqf2Vz4Vk'

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help you understand the ForteXa Tech algo trading system. Ask me anything about our strategies, risk management, or technical implementation!'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const systemPrompt = `You are an AI assistant for ForteXa Tech's High-Frequency Trading System. You have expert knowledge about:

1. SPOT TRADING STRATEGIES:
   - Mean Reversion Strategy (RSI, Bollinger Bands, Z-score, 65-70% win rate)
   - Momentum Strategy (MACD, Moving averages, 60-65% win rate)
   - Take Profit Strategy (0.1% targets, 95%+ win rate)

2. AI-POWERED STRATEGIES:
   - AI Ensemble Strategy (LSTM, Random Forest, Gradient Boosting, 65%+ accuracy)
   - Demo Signal Generator (Portfolio initialization)

3. OPTIONS TRADING STRATEGIES:
   - Options Momentum Breakout (High risk, 0.3 delta minimum)
   - Options Mean Reversion (IV analysis, 21 day max DTE)
   - Volatility Trading (Straddles, non-directional)
   - Delta Neutral Scalping (Gamma scalping, 80%+ win rate)
   - Earnings Plays (High IV detection >100%)

4. TECHNICAL SPECIFICATIONS:
   - Portfolio: $100M demo capital
   - Position sizing: $1,000 max per trade
   - Risk: 0.005% max per trade
   - Speed: 100ms to 30s depending on strategy
   - 8 different dashboard systems
   - Real-time Binance API integration

5. RISK MANAGEMENT:
   - Multi-layered protection system
   - Stop losses: 0.1% for spot trades
   - Greeks limits: Delta <5.0, Gamma <2.0
   - Maximum 15 simultaneous positions
   - Consecutive loss limits

Answer questions clearly and technically, focusing on the specific details of our system. Keep responses concise but informative.`

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Dynamic import to avoid SSR issues
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I\'m ready to help users understand the ForteXa Tech algo trading system with technical accuracy and detail.' }]
          }
        ]
      })

      const result = await chat.sendMessage(inputMessage)
      const response = await result.response
      const text = response.text()

      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={styles.aiChatContainer}>
      {!isOpen && (
        <button 
          className={styles.chatToggleBtn}
          onClick={() => setIsOpen(true)}
          title="Ask AI about algo trading"
        >
          🤖 Ask AI
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatTitle}>
              <span>🤖 ForteXa AI Assistant</span>
              <span className={styles.chatSubtitle}>Algo Trading Expert</span>
            </div>
            <button 
              className={styles.chatCloseBtn}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistantMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputContainer}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about trading strategies, risk management, or technical details..."
              className={styles.chatInput}
              rows="2"
              disabled={isLoading}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={styles.sendBtn}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      )}


    </div>
  )
}

export default AIChat 