import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../components/common/Layout'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'

const ContactFacilitiesPage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'low',
    category: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your Smart Campus Assistant. How can I help you today with facility matters?' }
  ])
  const [userInput, setUserInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isBotTyping])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      const ticketId = 'FC-' + Math.floor(Math.random() * 9000 + 1000)
      setSubmittedId(ticketId)
      toast.success('Your inquiry has been submitted!')
      setIsSubmitting(false)
    }, 1500)
  }

  const handleReset = () => {
    setSubmittedId(null)
    setFormData({ subject: '', description: '', priority: 'low', category: 'general' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    const input = userInput.trim()
    if (!input) return

    const newMessages = [...chatMessages, { role: 'user', text: input }]
    setChatMessages(newMessages)
    setUserInput('')
    setIsBotTyping(true)

    // Simulate AI response logic
    setTimeout(() => {
      let response = "I've noted that concern. To get that fixed for you, should I go ahead and dispatch a technician request?"
      const lowerInput = input.toLowerCase()

      if (lowerInput.match(/^(hi|hello|hey|greetings|hiya)/)) {
        response = "Hello! I'm the Facilities AI. I can help with maintenance, equipment issues, or campus navigation. What can I do for you?"
      } else if (lowerInput.includes('how are you')) {
        response = "I'm scaleable and ready to assist! Facilities status is currently at 94% efficiency. How are you doing today?"
      } else if (lowerInput.includes('who are you')) {
        response = "I am the Smart Campus Facilities Assistant, specifically designed to triage maintenance and resource issues across our campus."
      } else if (lowerInput.match(/^(ok|okay|yes|sure|go ahead|proceed|yep|yeah)/)) {
        response = "Understood. I've flagged this for the internal operations team. You can provide more details in the form on the left if you'd like to reach a specific supervisor."
      } else if (lowerInput.match(/^(no|not now|cancel|stop|nope)/)) {
        response = "No problem. I'll stay here if you change your mind. Anything else I can help with?"
      } else if (lowerInput.match(/screen|monitor|display|signal|blue|black|pixel/)) {
        response = "Display issues in Labs are usually caused by loose HDMI cabling or GPU resets. I've notified the IT Lab Assistant on duty to check your station. Which block are you in?"
      } else if (lowerInput.match(/power|electricity|outlet|plug|light|bulb/)) {
        response = "Electrical concerns are high priority. Our electricians are currently in Block B. If you're experiencing a blackout at your station, please switch to a neighboring unit for now."
      } else if (lowerInput.match(/ac|cooling|hot|cold|temperature|smell|odor|noise/)) {
        response = "Environmental comfort is key! 🌬️ I've logged the HVAC team to check the airflow sensors in your current zone. It usually takes about 15-20 minutes for a system adjustment to take effect."
      } else if (lowerInput.match(/key|access|lock|card|id|door/)) {
        response = "Digital access issues are handled by the Identity Team. I've sent a refresh signal to your student ID. Try scanning again in 2 minutes!"
      } else if (lowerInput.match(/clean|spill|mess|trash|bin/)) {
        response = "Janitorial services have been alerted. Thank you for helping keep the campus clean! 🧹"
      } else if (lowerInput.match(/thanks|thank you|thx/)) {
        response = "My pleasure! Helping you keeps the campus running smoothly. Anything else?"
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: response }])
      setIsBotTyping(false)
    }, 1500)
  }

  return (
    <Layout>
      <div className="w-[100vw] relative left-1/2 -ml-[50vw] min-h-[calc(100vh-64px)] -mt-8 bg-slate-50 flex flex-col lg:flex-row overflow-x-hidden animate-fade-in">

        {/* Sidebar - Flush Left and starts exactly at top edge */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <FacilitiesSidebar />
          </div>
        </div>

        {/* Main Content Area - Fills right side */}
        <div className="flex-1 min-w-0 flex flex-col space-y-8 px-4 sm:px-6 lg:px-10 py-8">

          {/* Breadcrumbs & Header */}
          <section>
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-5">
              <Link to="/resources" className="hover:text-primary-600 transition-colors">Facilities</Link>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-600 font-semibold uppercase tracking-wider">Help & Support</span>
            </nav>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-8 shadow-2xl border border-white/5 group">
              {/* Decorative Glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 rounded-full blur-[120px] -ml-20 -mb-20 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" />

              <div className="relative flex flex-col md:flex-row md:items-center gap-7">
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white shadow-2xl shadow-primary-600/30 shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                  <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-white tracking-tight mb-2">Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Center</span></h1>
                  <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                    Experiencing a facility issue? Use our AI-powered triage or dispatch a formal request to our technical team instantly for rapid resolution.
                  </p>
                </div>
                <div className="md:ml-auto flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">NOC ONLINE</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Avg. Response: <span className="text-primary-400 font-bold">12 min</span></p>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-10">
            {/* Form Section */}
            <div className="xl:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden h-full">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-500" />

                {submittedId ? (
                  <div className="p-12 flex flex-col items-center text-center animate-fade-in">
                    <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 rounded-full bg-primary-100 animate-ping opacity-50" />
                      <div className="relative w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center border-4 border-white shadow-xl">
                        <svg className="w-12 h-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Request Dispatched</h2>
                    <p className="text-slate-500 font-medium mb-10 max-w-xs leading-relaxed">
                      Technical staff have been alerted to your inquiry. Reference your ID below.
                    </p>

                    <div className="w-full max-w-sm bg-slate-50 rounded-2xl border border-slate-100 p-8 mb-10 text-left">
                      <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</span>
                        <span className="font-mono font-black text-primary-700 bg-primary-50 border border-primary-200/50 px-4 py-1.5 rounded-xl text-sm">#{submittedId}</span>
                      </div>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Review Status</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">NOC supervisor review in progress.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Target Resolution</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Expected dispatch within standard operational window.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                      <button onClick={handleReset} className="flex-1 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-black py-3.5 rounded-2xl transition-all text-sm">
                        New Inquiry
                      </button>
                      <Link to="/dashboard" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 text-sm">
                        Confirm
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 md:p-10">
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-7 bg-primary-500 rounded-full" />
                        Infrastructure Support
                      </h2>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">v1.2 Triage</span>
                    </div>

                    <form onSubmit={handleSubmitForm} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Classification</label>
                          <div className="relative">
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all appearance-none cursor-pointer"
                            >
                              <option value="general">General Inquiry</option>
                              <option value="maintenance">Maintenance Request</option>
                              <option value="it">Specialist IT Tech</option>
                              <option value="access">Access & Security</option>
                            </select>
                            <svg className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Urgency matrix</label>
                          <div className="relative">
                            <select
                              name="priority"
                              value={formData.priority}
                              onChange={handleInputChange}
                              className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-600/5 transition-all appearance-none cursor-pointer ${formData.priority === 'high' ? 'text-accent-600 border-accent-200' : 'text-slate-700'
                                }`}
                            >
                              <option value="low">Standard Priority</option>
                              <option value="medium">Action Required (24h)</option>
                              <option value="high">Urgent Response Needed</option>
                            </select>
                            <svg className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Subject Header</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="Briefly state the incident..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Incident Detail</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          placeholder="Describe the problem, location, and symptoms..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-600/5 focus:border-primary-600 transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        {isSubmitting ? (
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Dispatch Support Ticket
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant Section */}
            <div className="xl:col-span-5 flex flex-col gap-8">
              {/* Chat Module */}
              <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-2xl flex flex-col h-[580px] border border-white/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute bottom-40 left-0 w-24 h-24 bg-accent-500 rounded-full mix-blend-screen filter blur-2xl opacity-10 pointer-events-none" />

                <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-0.5">Automated triage</p>
                      <h3 className="text-sm font-black text-white tracking-tight">Smart-AI Assistant</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-6 px-6 py-8 scroll-smooth scrollbar-thin scrollbar-thumb-slate-800">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center shrink-0 mr-3 mt-1 text-primary-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-tr-none font-bold shadow-lg shadow-primary-600/20'
                          : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700/40 font-medium'
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-600/30 flex items-center justify-center shrink-0 mr-3 mt-1 text-primary-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="bg-slate-800 border border-slate-700/40 rounded-2xl rounded-tl-none px-5 py-4">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:-0.3s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <footer className="p-6 bg-slate-900 border-t border-white/5 shadow-[0_-15px_30px_rgba(0,0,0,0.3)]">
                  <form onSubmit={handleSendMessage}>
                    <div className="relative group">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="I have a problem with..."
                        className="w-full bg-slate-800 border border-slate-700/50 rounded-2xl px-6 py-4.5 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-600/40 transition-all pr-14"
                      />
                      <button
                        type="submit"
                        className="absolute right-2.5 top-2.5 bottom-2.5 w-11 bg-primary-600 hover:bg-primary-500 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </footer>
              </div>

              {/* Status Tracking */}
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure Pulse</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">REAL-TIME</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="group">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-black text-slate-700">Grid Operations</span>
                      <span className="font-bold text-slate-400">74% Load</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-primary-600 w-[74%] rounded-full shadow-[0_0_10px_rgba(5,150,105,0.2)]" />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-black text-slate-700">Tech Dispatch Units</span>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                        <span className="font-black text-accent-600 uppercase tracking-tighter">PEAK LOAD</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div className="h-full bg-accent-500 w-[92%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Depth</p>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">04 Cases</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response ETA</p>
                      <p className="text-xl font-black text-primary-600 tracking-tighter">12 MINS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContactFacilitiesPage
