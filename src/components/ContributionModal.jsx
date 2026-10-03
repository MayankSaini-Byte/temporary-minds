import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RiCloseLine, 
  RiGithubFill, 
  RiLinkedinBoxFill, 
  RiMailLine, 
  RiUserLine, 
  RiLightbulbLine, 
  RiFileUploadLine, 
  RiCheckLine,
  RiErrorWarningLine,
  RiSendPlaneFill
} from 'react-icons/ri'
import { submitContributionRequest } from '../lib/buildInPublicStore'

export default function ContributionModal({ project, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github: '',
    linkedin: '',
    reason: '',
    proposedIdea: ''
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) { // 5MB limit check
        setError('File size must be under 5MB')
        return
      }
      setFile(selected)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Form validation
    if (!formData.name.trim()) return setError('Please enter your full name')
    if (!formData.email.trim() || !formData.email.includes('@')) return setError('Please enter a valid student email')
    if (!formData.github.trim()) return setError('Please enter your GitHub profile or ID')
    if (!formData.linkedin.trim()) return setError('Please enter your LinkedIn profile or ID')
    if (!formData.reason.trim()) return setError('Please describe why you want to contribute')
    if (!formData.proposedIdea.trim()) return setError('Please share your idea for improving or contributing to the project')

    setLoading(true)
    setError('')

    try {
      let fileData = null
      let fileName = ''
      if (file) {
        fileName = file.name
        // Simple base64 reader if file uploaded
        fileData = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(file)
        })
      }

      await submitContributionRequest({
        projectId: project.id,
        projectName: project.title,
        name: formData.name.trim(),
        email: formData.email.trim(),
        github: formData.github.trim(),
        linkedin: formData.linkedin.trim(),
        reason: formData.reason.trim(),
        proposedIdea: formData.proposedIdea.trim(),
        fileName,
        fileData
      })

      setLoading(false)
      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setLoading(false)
      setError('Failed to submit contribution request. Please try again or check network connection.')
    }
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setFormData({
      name: '',
      email: '',
      github: '',
      linkedin: '',
      reason: '',
      proposedIdea: ''
    })
    setFile(null)
    setError('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="bip-modal-overlay" onClick={handleResetAndClose}>
          <motion.div 
            className="bip-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="bip-modal-header">
              <div>
                <span className="bip-badge bip-badge-primary">Contribution Request</span>
                <h2 className="bip-modal-title">{project.title}</h2>
              </div>
              <button className="bip-modal-close cursor-target" onClick={handleResetAndClose} aria-label="Close modal">
                <RiCloseLine size={24} />
              </button>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="bip-modal-body">
                {error && (
                  <div className="bip-alert bip-alert-error">
                    <RiErrorWarningLine size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Instructions Callout */}
                {project.contributionInstructions && (
                  <div className="bip-instructions-box">
                    <span className="bip-instructions-title">Contribution Guidelines:</span>
                    <p>{project.contributionInstructions}</p>
                  </div>
                )}

                {/* Grid 2 Columns for Personal Info */}
                <div className="bip-form-grid">
                  <div className="bip-form-group">
                    <label htmlFor="bip-name">Full Name <span className="req">*</span></label>
                    <div className="bip-input-wrap">
                      <RiUserLine className="bip-input-icon" />
                      <input 
                        id="bip-name"
                        type="text" 
                        name="name" 
                        placeholder="e.g. Aarav Sharma" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="bip-form-group">
                    <label htmlFor="bip-email">Student Email <span className="req">*</span></label>
                    <div className="bip-input-wrap">
                      <RiMailLine className="bip-input-icon" />
                      <input 
                        id="bip-email"
                        type="email" 
                        name="email" 
                        placeholder="student@iitmbs.ac.in" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bip-form-grid">
                  <div className="bip-form-group">
                    <label htmlFor="bip-github">GitHub ID / Profile <span className="req">*</span></label>
                    <div className="bip-input-wrap">
                      <RiGithubFill className="bip-input-icon" />
                      <input 
                        id="bip-github"
                        type="text" 
                        name="github" 
                        placeholder="github.com/username or @username" 
                        value={formData.github}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="bip-form-group">
                    <label htmlFor="bip-linkedin">LinkedIn ID / Profile <span className="req">*</span></label>
                    <div className="bip-input-wrap">
                      <RiLinkedinBoxFill className="bip-input-icon" />
                      <input 
                        id="bip-linkedin"
                        type="text" 
                        name="linkedin" 
                        placeholder="linkedin.com/in/username" 
                        value={formData.linkedin}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Why want to contribute */}
                <div className="bip-form-group">
                  <label htmlFor="bip-reason">Why do you want to contribute? <span className="req">*</span></label>
                  <textarea 
                    id="bip-reason"
                    name="reason"
                    rows={3}
                    placeholder="Share your motivation, past experience, or what draws you to this project..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Proposed idea */}
                <div className="bip-form-group">
                  <label htmlFor="bip-idea">Your idea for improving or contributing to the project <span className="req">*</span></label>
                  <div className="bip-input-wrap textarea-wrap">
                    <textarea 
                      id="bip-idea"
                      name="proposedIdea"
                      rows={3}
                      placeholder="Describe specific features, bug fixes, architecture improvements, or ideas you would like to build..."
                      value={formData.proposedIdea}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Optional PDF File Upload */}
                <div className="bip-form-group">
                  <label htmlFor="bip-file">Optional Attachment (PDF / Proposal / Resume)</label>
                  <div className="bip-file-uploader">
                    <input 
                      id="bip-file"
                      type="file" 
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleFileChange}
                      className="bip-file-input"
                    />
                    <div className="bip-file-label">
                      <RiFileUploadLine size={20} />
                      <span>{file ? file.name : 'Choose a file or drop it here (PDF/Doc up to 5MB)'}</span>
                    </div>
                    {file && (
                      <button 
                        type="button" 
                        className="bip-file-clear"
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="bip-modal-actions">
                  <button 
                    type="button" 
                    className="bip-btn bip-btn-ghost cursor-target" 
                    onClick={handleResetAndClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bip-btn bip-btn-primary cursor-target"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="bip-spinner-text">
                        <span className="bip-spinner" /> Submitting Request...
                      </span>
                    ) : (
                      <>
                        <RiSendPlaneFill size={16} /> Submit Contribution Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bip-success-state">
                <div className="bip-success-icon">
                  <RiCheckLine size={40} />
                </div>
                <h3>Contribution Request Submitted!</h3>
                <p>
                  Thank you, <strong>{formData.name}</strong>! Your application to contribute to <strong>{project.title}</strong> has been logged into our community sheet.
                </p>
                <div className="bip-success-details">
                  <span>Data appended to Google Sheet</span>
                  <span>Status: <strong>Under Review</strong></span>
                </div>
                <button 
                  className="bip-btn bip-btn-primary cursor-target" 
                  onClick={handleResetAndClose}
                  style={{ marginTop: '1.5rem', width: '100%' }}
                >
                  Close & Explore More Projects
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
