import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RiRocketLine, 
  RiSearchLine, 
  RiExternalLinkLine, 
  RiCheckLine, 
  RiCloseLine, 
  RiNotification4Line,
  RiLightbulbLine
} from 'react-icons/ri'
import PageTransition from '../components/PageTransition'
import ContributionModal from '../components/ContributionModal'
import { getProjects } from '../lib/buildInPublicStore'

export default function BuildInPublic() {
  const [projects, setProjects] = useState([])
  const [contributeProject, setContributeProject] = useState(null)
  const [toast, setToast] = useState(null)

  const loadData = () => {
    setProjects(getProjects())
  }

  useEffect(() => {
    loadData()

    const handleProjectsUpdated = (e) => setProjects(e.detail)
    const handleContributorNotified = (e) => {
      setToast(e.detail)
      setTimeout(() => setToast(null), 5000)
    }

    window.addEventListener('bip_projects_updated', handleProjectsUpdated)
    window.addEventListener('bip_contributor_notified', handleContributorNotified)

    return () => {
      window.removeEventListener('bip_projects_updated', handleProjectsUpdated)
      window.removeEventListener('bip_contributor_notified', handleContributorNotified)
    }
  }, [])

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

  return (
    <>
      <PageTransition className="page bip-page">
        <div className="bip-container">
          <div className="bip-hero">
            <div className="bip-hero-top flex-between" style={{ justifyContent: 'center' }}>
              <div className="bip-pill-label">
                <RiLightbulbLine /> Student Open Collaboration Ecosystem
              </div>
            </div>

            <h1 className="bip-hero-title">
              BUILD IN <span className="gradient-text">PUBLIC</span>
            </h1>
            
            <p className="bip-hero-desc">
              Discover active projects, pitch innovative ideas, and collaborate with Binary Minds builders across campus. Contribute code, design, or research to real-world software.
            </p>
          </div>

          <div className="bip-projects-grid">
            {projects.map(proj => (
              <motion.div 
                key={proj.id}
                className="bip-card interactive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {proj.image ? (
                  <div className="bip-card-img-wrap">
                    <img src={proj.image} alt={proj.title} loading="lazy" />
                    <div className="bip-card-img-overlay" />
                    <span className={`bip-status-badge ${getStatusBadgeClass(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>
                ) : (
                  <div className="bip-card-no-img">
                    <span className={`bip-status-badge ${getStatusBadgeClass(proj.status)}`}>
                      {proj.status}
                    </span>
                  </div>
                )}

                <div className="bip-card-content">
                  <div className="bip-tags">
                    {proj.category?.map(cat => (
                      <span key={cat} className="bip-tag">{cat}</span>
                    ))}
                  </div>

                  <h3 className="bip-card-title">{proj.title}</h3>

                  <p className="bip-card-desc">{proj.description}</p>

                  {proj.links && proj.links.length > 0 && (
                    <div className="bip-card-links">
                      {proj.links.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bip-link cursor-target"
                        >
                          <RiExternalLinkLine size={14} /> {link.label}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="bip-card-action">
                    <button 
                      className="bip-btn bip-btn-primary bip-btn-full cursor-target"
                      onClick={() => setContributeProject(proj)}
                    >
                      <RiRocketLine size={18} /> Contribute to Project
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {projects.length === 0 && (
              <div className="bip-empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0' }}>
                <div className="bip-empty-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--muted)' }}><RiSearchLine size={36} /></div>
                <h3>No projects found</h3>
                <p style={{ color: 'var(--muted)' }}>Check back later for new projects and collaboration opportunities.</p>
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

      <ContributionModal 
        project={contributeProject}
        isOpen={Boolean(contributeProject)}
        onClose={() => setContributeProject(null)}
      />
    </>
  )
}
