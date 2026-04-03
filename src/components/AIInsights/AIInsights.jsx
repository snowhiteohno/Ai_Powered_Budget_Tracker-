import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAutoAwesome, MdRefresh, MdSend } from 'react-icons/md'
import { generateFinancialInsights, askFinancialAdvisor, isGeminiAvailable } from '../../services/gemini'
import { useFinanceContext } from '../../context/FinanceContext'
import './AIInsights.css'

function AIInsights() {
  const { transactions, budget } = useFinanceContext()

  const [insights, setInsights] = useState('')
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('insights')

  const geminiReady = isGeminiAvailable()

  // Generate insights
  async function handleGenerateInsights() {
    setIsLoadingInsights(true)
    try {
      const result = await generateFinancialInsights(transactions, budget)
      setInsights(result)
    } catch (error) {
      setInsights('Failed to generate insights. Please try again.')
    }
    setIsLoadingInsights(false)
  }

  // Send chat message
  async function handleSendChat(e) {
    e.preventDefault()
    if (!chatQuestion.trim()) return

    const question = chatQuestion.trim()
    setChatQuestion('')
    setChatHistory(prev => [...prev, { role: 'user', text: question }])
    setIsChatLoading(true)

    try {
      const response = await askFinancialAdvisor(question, transactions, budget)
      setChatHistory(prev => [...prev, { role: 'ai', text: response }])
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Try again.' }])
    }
    setIsChatLoading(false)
  }

  return (
    <motion.div
      className="glass-card ai-insights-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <MdAutoAwesome className="ai-icon" />
          <h3 className="ai-title">Gemini AI Financial Advisor</h3>
        </div>
        <div className="ai-tabs">
          <button
            className={`ai-tab ${activeTab === 'insights' ? 'ai-tab--active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={`ai-tab ${activeTab === 'chat' ? 'ai-tab--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Ask AI
          </button>
        </div>
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="ai-insights-content">
          {!geminiReady && (
            <div className="ai-config-notice">
              <p>⚠️ Add your Gemini API key to the <code>.env</code> file to enable AI insights.</p>
              <code>VITE_GEMINI_API_KEY=your_key_here</code>
            </div>
          )}

          {!insights && geminiReady && (
            <div className="ai-empty">
              <MdAutoAwesome className="ai-empty-icon" />
              <p>Get AI-powered insights about your spending patterns and financial health.</p>
              <button
                className="btn btn-primary"
                onClick={handleGenerateInsights}
                disabled={isLoadingInsights}
                id="generate-insights-btn"
              >
                {isLoadingInsights ? 'Analyzing...' : 'Generate Insights'}
              </button>
            </div>
          )}

          {insights && (
            <div className="ai-insights-result">
              <div className="ai-insights-text">{insights}</div>
              <button
                className="btn btn-ghost ai-refresh-btn"
                onClick={handleGenerateInsights}
                disabled={isLoadingInsights}
              >
                <MdRefresh className={isLoadingInsights ? 'spinning' : ''} />
                {isLoadingInsights ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}

          {isLoadingInsights && !insights && (
            <div className="ai-loading">
              <div className="ai-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <p>Gemini is analyzing your finances...</p>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="ai-chat-content">
          {!geminiReady && (
            <div className="ai-config-notice">
              <p>⚠️ Add your Gemini API key to the <code>.env</code> file to enable AI chat.</p>
            </div>
          )}

          <div className="ai-chat-messages">
            {chatHistory.length === 0 && (
              <div className="ai-chat-empty">
                <p>Ask anything about your finances!</p>
                <div className="ai-chat-suggestions">
                  {['How can I save more?', 'Am I overspending on food?', 'Give me a budget plan'].map(q => (
                    <button
                      key={q}
                      className="ai-suggestion-chip"
                      onClick={() => { setChatQuestion(q); }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-chat-msg ai-chat-msg--${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === 'ai' && <MdAutoAwesome className="ai-msg-icon" />}
                  <div className="ai-msg-text">{msg.text}</div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isChatLoading && (
              <div className="ai-chat-msg ai-chat-msg--ai">
                <MdAutoAwesome className="ai-msg-icon" />
                <div className="ai-loading-dots"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="ai-chat-input-bar">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask about your finances..."
              value={chatQuestion}
              onChange={e => setChatQuestion(e.target.value)}
              disabled={!geminiReady || isChatLoading}
              id="ai-chat-input"
            />
            <button
              type="submit"
              className="ai-chat-send"
              disabled={!geminiReady || isChatLoading || !chatQuestion.trim()}
              id="ai-chat-send-btn"
            >
              <MdSend />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  )
}

export default AIInsights
