import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine, RiAddLine, RiSaveLine, RiImageAddLine } from 'react-icons/ri'
import { addProject, updateProject } from '../lib/buildInPublicStore'

export default function AdminProjectModal({ projectToEdit, isOpen, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Seeking Contributors',
    category: '',
    image: '',
    contributionInstructions: '',
    links: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        title: projectToEdit.title || '',
        description: projectToEdit.description || '',
        status: projectToEdit.status || 'Seeking Contributors',
        category: Array.isArray(projectToEdit.category) ? projectToEdit.category.join(', ') : '',
        image: projectToEdit.image || '',
        contributionInstructions: projectToEdit.contributionInstructions || '',
        links: Array.isArray(projectToEdit.links) 
          ? projectToEdit.links.map(l => `${l.label} | ${l.url}`).join('\n') 
          : ''
      })
    } else {
      setFormData({
        title: '',
        description: 'This is the description of the project. If you want to contribute, click the button below.',
        status: 'Seeking Contributors',
        category: 'React, Python, AI',
        image: '',
        contributionInstructions: 'Looking for frontend & backend developers to collaborate.',
        links: ''
      })
    }
  }, [projectToEdit, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return setError('Please enter a project title')
    if (!formData.description.trim()) return setError('Please enter a project description')

    // Parse categories
    const categoryArray = formData.category
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)

    // Parse links (Line format: Label | URL)
    const linksArray = formData.links
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|')
        return {
          label: parts[0] ? parts[0].trim() : 'Link',
          url: parts[1] ? parts[1].trim() : parts[0].trim()
        }
      })

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      category: categoryArray.length > 0 ? categoryArray : ['General'],
      image: formData.image.trim(),
      contributionInstructions: formData.contributionInstructions.trim(),
      links: linksArray
    }

    if (projectToEdit) {
      updateProject(projectToEdit.id, payload)
    } else {
      addProject(payload)
    }

    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="bip-modal-overlay" onClick={onClose}>
        <motion.div 
          className="bip-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bip-modal-header">
            <div>
              <span className="bip-badge bip-badge-primary">Admin Control</span>
              <h2 className="bip-modal-title">{projectToEdit ? 'Edit Project' : 'Add New Project'}</h2>
            </div>
            <button className="bip-modal-close cursor-target" onClick={onClose}>
              <RiCloseLine size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bip-modal-body">
            {error && <div className="bip-alert bip-alert-error">{error}</div>}

            <div className="bip-form-group">
              <label htmlFor="adm-title">Project Title *</label>
              <input 
                id="adm-title"
                type="text" 
                name="title" 
                placeholder="e.g. AI-Powered Research Synthesizer" 
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bip-form-grid">
              <div className="bip-form-group">
                <label htmlFor="adm-status">Project Status *</label>
                <select 
                  id="adm-status"
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="bip-select"
                >
                  <option value="Active">Active</option>
                  <option value="Seeking Contributors">Seeking Contributors</option>
                  <option value="In Ideation">In Ideation</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="bip-form-group">
                <label htmlFor="adm-category">Categories / Tags (comma separated)</label>
                <input 
                  id="adm-category"
                  type="text" 
                  name="category" 
                  placeholder="AI / ML, React, Python" 
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bip-form-group">
              <label htmlFor="adm-desc">Project Description *</label>
              <textarea 
                id="adm-desc"
                name="description"
                rows={3}
                placeholder="This is the description of the project. If you want to contribute, click the button below."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bip-form-group">
              <label htmlFor="adm-instructions">Contribution Instructions</label>
              <textarea 
                id="adm-instructions"
                name="contributionInstructions"
                rows={2}
                placeholder="Specify target tech stack, roles needed, or guidelines for interested students..."
                value={formData.contributionInstructions}
                onChange={handleChange}
              />
            </div>

            <div className="bip-form-group">
              <label htmlFor="adm-image">Optional Cover Image URL</label>
              <div className="bip-input-wrap">
                <RiImageAddLine className="bip-input-icon" />
                <input 
                  id="adm-image"
                  type="url" 
                  name="image" 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bip-form-group">
              <label htmlFor="adm-links">Optional Links / Resources (Format: Label | URL, one per line)</label>
              <textarea 
                id="adm-links"
                name="links"
                rows={2}
                placeholder={"GitHub Repo | https://github.com/...\nLive Demo | https://demo.com"}
                value={formData.links}
                onChange={handleChange}
              />
            </div>

            <div className="bip-modal-actions">
              <button type="button" className="bip-btn bip-btn-ghost cursor-target" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="bip-btn bip-btn-primary cursor-target">
                {projectToEdit ? <><RiSaveLine size={16} /> Save Changes</> : <><RiAddLine size={16} /> Add Project</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
