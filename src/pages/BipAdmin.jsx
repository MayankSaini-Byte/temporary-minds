import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RiAddLine, 
  RiShieldUserLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiFileTextLine, 
  RiGithubFill, 
  RiLinkedinBoxFill, 
  RiMailLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiGoogleLine,
  RiNotification4Line,
  RiLockPasswordLine
} from 'react-icons/ri'
import PageTransition from '../components/PageTransition'
import AdminProjectModal from '../components/AdminProjectModal'
import { 
  getProjects, 
  getRequests, 
  deleteProject, 
  updateRequestStatus, 
  updateProject,
  getAppsScriptUrl,
  setAppsScriptUrl
} from '../lib/buildInPublicStore'

export default function BipAdmin() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(false)

  const [projects, setProjects] = useState([])
  const [requests, setRequests] = useState([])
  
  // Modals state
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)

  // Admin Mode Tabs
  const [adminTab, setAdminTab] = useState('projects') // 'projects', 'requests', 'settings'
  const [webhookInput, setWebhookInput] = useState('')
  const [webhookSaved, setWebhookSaved] = useState(false)

  // Notification Toast State
  const [toast, setToast] = useState(null)

  const loadData = () => {
    setProjects(getProjects())
    setRequests(getRequests())
    setWebhookInput(getAppsScriptUrl())
  }

  useEffect(() => {
    if (!isAuthenticated) return

    loadData()

    const handleProjectsUpdated = (e) => setProjects(e.detail)
    const handleRequestsUpdated = (e) => setRequests(e.detail)
    const handleContributorNotified = (e) => {
      setToast(e.detail)
      setTimeout(() => setToast(null), 5000)
    }

    window.addEventListener('bip_projects_updated', handleProjectsUpdated)
    window.addEventListener('bip_requests_updated', handleRequestsUpdated)
    window.addEventListener('bip_contributor_notified', handleContributorNotified)

    return () => {
      window.removeEventListener('bip_projects_updated', handleProjectsUpdated)
      window.removeEventListener('bip_requests_updated', handleRequestsUpdated)
      window.removeEventListener('bip_contributor_notified', handleContributorNotified)
    }
  }, [isAuthenticated])

  const handleAuth = (e) => {
    e.preventDefault()
    if (passcode === import.meta.env.VITE_BIP_ADMIN_PASSCODE) {
      setIsAuthenticated(true)
      setAuthError(false)
    } else {
      setAuthError(true)
    }
  }

  const handleDeleteProject = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProject(id)
      loadData()
    }
  }

  const handleStatusChange = (requestId, newStatus) => {
    updateRequestStatus(requestId, newStatus)
    loadData()
  }

  const handleSaveWebhook = (e) => {
    e.preventDefault()
    setAppsScriptUrl(webhookInput)
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 3000)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'bip-status-active'
      case 'Seeking Contributors': return 'bip-status-seeking'
      case 'In Ideation': return 'bip-status-ideation'
      case 'Completed': return 'bip-status-completed'
      case 'Accepted': return 'bip-status-active'
      case 'Rejected': return 'bip-status-rejected'
      case 'Under Review': return 'bip-status-ideation'
      default: return 'bip-status-default'
    }
  }

  if (!isAuthenticated) {
    return (
      <PageTransition className="page bip-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          className="bip-card" 
          style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <RiShieldUserLine size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <h2>Admin Portal</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Enter the admin passcode to access project management and requests.
          </p>
          <form onSubmit={handleAuth}>
            <div className="bip-input-wrap" style={{ marginBottom: '1rem' }}>
              <RiLockPasswordLine className="bip-input-icon" />
              <input 
                type="password" 
                placeholder="Enter Passcode" 
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  setAuthError(false)
                }}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </div>
            {authError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>Incorrect passcode</div>}
            <button type="submit" className="bip-btn bip-btn-primary bip-btn-full cursor-target">
              Authenticate
            </button>
          </form>
        </motion.div>
      </PageTransition>
    )
  }

  return (
    <>
      <PageTransition className="page bip-page">
        <div className="bip-container">
          <div className="bip-hero" style={{ marginBottom: '2rem' }}>
            <h1 className="bip-hero-title">
              BIP <span className="gradient-text">ADMIN</span>
            </h1>
          </div>

          <div className="bip-admin-dashboard" style={{ marginTop: 0 }}>
            <div className="bip-admin-nav">
              <div className="bip-admin-tabs">
                <button 
                  className={`bip-admin-tab cursor-target ${adminTab === 'projects' ? 'active' : ''}`}
                  onClick={() => setAdminTab('projects')}
                >
                  Manage Projects ({projects.length})
                </button>
                <button 
                  className={`bip-admin-tab cursor-target ${adminTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setAdminTab('requests')}
                >
                  Review Requests ({requests.length})
                  {requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length > 0 && (
                    <span className="bip-counter-badge">
                      {requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length}
                    </span>
                  )}
                </button>
                <button 
                  className={`bip-admin-tab cursor-target ${adminTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setAdminTab('settings')}
                >
                  <RiGoogleLine style={{ verticalAlign: 'middle', marginRight: 4 }} /> Google Sheets Setup
                </button>
              </div>

              {adminTab === 'projects' && (
                <button 
                  className="bip-btn bip-btn-primary cursor-target"
                  onClick={() => {
                    setProjectToEdit(null)
                    setAdminModalOpen(true)
                  }}
                >
                  <RiAddLine size={18} /> Add New Project
                </button>
              )}
            </div>

            {/* Admin Tab 1: Manage Projects */}
            {adminTab === 'projects' && (
              <div className="bip-admin-table-wrap">
                <table className="bip-admin-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Instructions</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(proj => (
                      <tr key={proj.id}>
                        <td>
                          <div className="bip-table-proj-info">
                            {proj.image && <img src={proj.image} alt={proj.title} className="bip-table-thumb" />}
                            <div>
                              <strong>{proj.title}</strong>
                              <p className="bip-table-desc">{proj.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="bip-tags">
                            {proj.category?.map(c => <span key={c} className="bip-tag">{c}</span>)}
                          </div>
                        </td>
                        <td>
                          <select 
                            value={proj.status} 
                            onChange={(e) => {
                              updateProject(proj.id, { status: e.target.value })
                              loadData()
                            }}
                            className="bip-table-select"
                          >
                            <option value="Active">Active</option>
                            <option value="Seeking Contributors">Seeking Contributors</option>
                            <option value="In Ideation">In Ideation</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td>
                          <span className="bip-text-clamp">{proj.contributionInstructions || 'None'}</span>
                        </td>
                        <td>
                          <div className="bip-table-actions">
                            <button 
                              className="bip-icon-btn cursor-target" 
                              title="Edit Project"
                              onClick={() => {
                                setProjectToEdit(proj)
                                setAdminModalOpen(true)
                              }}
                            >
                              <RiPencilLine size={16} />
                            </button>
                            <button 
                              className="bip-icon-btn danger cursor-target" 
                              title="Delete Project"
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                            >
                              <RiDeleteBinLine size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center p-4">No projects created yet. Click "Add New Project" above.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Admin Tab 2: Review Requests */}
            {adminTab === 'requests' && (
              <div className="bip-requests-grid">
                {requests.map(req => (
                  <div key={req.id} className="bip-request-card">
                    <div className="bip-request-header flex-between">
                      <div>
                        <span className="bip-request-project">{req.projectName}</span>
                        <h3 className="bip-request-name">{req.name}</h3>
                      </div>
                      <span className={`bip-status-badge ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="bip-request-meta">
                      <span><RiMailLine /> {req.email}</span>
                      {req.github && (
                        <a href={req.github.startsWith('http') ? req.github : `https://${req.github}`} target="_blank" rel="noopener noreferrer">
                          <RiGithubFill /> GitHub Profile
                        </a>
                      )}
                      {req.linkedin && (
                        <a href={req.linkedin.startsWith('http') ? req.linkedin : `https://${req.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <RiLinkedinBoxFill /> LinkedIn
                        </a>
                      )}
                      <span className="bip-request-time">{new Date(req.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bip-request-body">
                      <div className="bip-req-field">
                        <strong>Reason for Contributing:</strong>
                        <p>{req.reason}</p>
                      </div>
                      <div className="bip-req-field">
                        <strong>Proposed Idea / Enhancements:</strong>
                        <p>{req.proposedIdea}</p>
                      </div>
                      {req.fileName && (
                        <div className="bip-req-field">
                          <strong>Attachment / PDF:</strong>
                          <div className="bip-file-chip">
                            <RiFileTextLine /> {req.fileName}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bip-request-footer flex-between">
                      <span className="bip-small-note">Status Workflow:</span>
                      <div className="bip-status-actions">
                        <button 
                          className={`bip-btn-sm ${req.status === 'Under Review' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(req.id, 'Under Review')}
                        >
                          Under Review
                        </button>
                        <button 
                          className={`bip-btn-sm success ${req.status === 'Accepted' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(req.id, 'Accepted')}
                        >
                          <RiCheckLine /> Accept Request
                        </button>
                        <button 
                          className={`bip-btn-sm danger ${req.status === 'Rejected' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(req.id, 'Rejected')}
                        >
                          <RiCloseLine /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="bip-empty-box">
                    <p>No contribution requests submitted yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Tab 3: Google Sheets Setup */}
            {adminTab === 'settings' && (
              <div className="bip-settings-card">
                <h2>Google Sheets Integration via Google Apps Script</h2>
                <p className="bip-desc">
                  Connect contribution request submissions directly to your custom Google Sheet using Google Apps Script.
                </p>

                <form onSubmit={handleSaveWebhook} className="bip-webhook-form">
                  <label htmlFor="bip-webhook-input">Google Apps Script Web App URL</label>
                  <div className="bip-input-wrap">
                    <input 
                      id="bip-webhook-input"
                      type="url" 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                    />
                    <button type="submit" className="bip-btn bip-btn-primary cursor-target">
                      Save URL
                    </button>
                  </div>
                  {webhookSaved && <span className="bip-success-text"><RiCheckLine /> Apps Script Webhook URL Saved!</span>}
                </form>

                <div className="bip-gas-instructions">
                  <h3>How to Setup Google Apps Script in Google Sheets:</h3>
                  <ol>
                    <li>Open your target Google Sheet.</li>
                    <li>Go to <strong>Extensions &gt; Apps Script</strong> in the menu.</li>
                    <li>Copy and paste the code below into the Apps Script editor:</li>
                  </ol>
                  <pre className="bip-code-block">
{`function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create column headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Project Name", "Name", "Student Email", 
        "GitHub", "LinkedIn", "Reason for Contributing", 
        "Proposed Idea", "Uploaded File / Link", "Status"
      ]);
    }
    
    sheet.appendRow([
      data.timestamp || new Date(),
      data.projectName || "",
      data.name || "",
      data.email || "",
      data.github || "",
      data.linkedin || "",
      data.reason || "",
      data.proposedIdea || "",
      data.fileName || "",
      data.status || "Submitted"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                  </pre>
                  <ol start={4}>
                    <li>Click <strong>Deploy &gt; New deployment</strong>.</li>
                    <li>Select <strong>Web app</strong>. Execute as: <em>Me</em>, Who has access: <em>Anyone</em>.</li>
                    <li>Click <strong>Deploy</strong> and paste the generated Web App URL into the input field above!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {toast && (
          <motion.div 
            className="bip-toast"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <RiNotification4Line size={20} className="bip-toast-icon" />
            <div className="bip-toast-content">
              <strong>Notification Sent to {toast.recipient}</strong>
              <p>{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="bip-toast-close">
              <RiCloseLine size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminProjectModal 
        projectToEdit={projectToEdit}
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false)
          setProjectToEdit(null)
        }}
        onSaved={loadData}
      />
    </>
  )
}
