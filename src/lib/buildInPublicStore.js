// Service layer for Build in Public - projects, requests, and Google Sheets integration

const PROJECTS_STORAGE_KEY = 'binaryminds_bip_projects_v1'
const REQUESTS_STORAGE_KEY = 'binaryminds_bip_requests_v1'
const APPS_SCRIPT_URL_KEY = 'binaryminds_bip_apps_script_url'

// Default seed projects
const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Binary Minds Open AI Agent Framework',
    description: 'This is an open-source framework for building multi-agent AI coding assistants tailored for student developer communities. If you want to contribute, click the button below.',
    status: 'Seeking Contributors',
    category: ['AI / ML', 'Python', 'Agents'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/MayankSaini-Byte/binaryminds' }
    ],
    contributionInstructions: 'Looking for Python developers with experience in LLMs, prompt engineering, and React frontend contributors for visual agent debuggers.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    title: 'Kaziranga House Student Portal & Project Hub',
    description: 'An interactive central platform for Kaziranga IITM BS students to track house events, submit technical blogs, showcase projects, and network. If you want to contribute, click the button below.',
    status: 'Active',
    category: ['React', 'Vite', 'UI/UX'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    links: [
      { label: 'Live Site', url: 'https://kaziranga.iitmbs.org/' }
    ],
    contributionInstructions: 'Seeking frontend engineers skilled in React, Framer Motion, and CSS design system enhancements.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    title: 'Algorithmic Trading & Market Data Visualizer',
    description: 'An open-source financial dashboard and backtesting engine designed for students exploring quantitative finance, Python data analysis, and live market APIs. If you want to contribute, click the button below.',
    status: 'In Ideation',
    category: ['Data Science', 'Python', 'React'],
    image: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
    links: [],
    contributionInstructions: 'Looking for data science enthusiasts, Pandas/NumPy developers, and Chart.js / D3.js chart builders.',
    createdAt: new Date().toISOString()
  }
]

// Default seed requests for admin demo
const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    projectId: 'proj-1',
    projectName: 'Binary Minds Open AI Agent Framework',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.iitmbs.ac.in',
    github: 'https://github.com/aarav-sharma',
    linkedin: 'https://linkedin.com/in/aarav-sharma',
    reason: 'I am deeply interested in autonomous agents and LLM tool calling.',
    proposedIdea: 'I would like to implement structured JSON streaming output and local caching for subagent runs.',
    fileName: 'aarav_resume_proposal.pdf',
    fileData: null,
    status: 'Under Review',
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  }
]

export function getProjects() {
  try {
    const data = localStorage.getItem(PROJECTS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS))
      return INITIAL_PROJECTS
    }
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err)
    return INITIAL_PROJECTS
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
    window.dispatchEvent(new CustomEvent('bip_projects_updated', { detail: projects }))
  } catch (err) {
    console.error('Failed to save projects:', err)
  }
}

export function addProject(project) {
  const projects = getProjects()
  const newProject = {
    ...project,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  const updated = [newProject, ...projects]
  saveProjects(updated)
  return newProject
}

export function updateProject(id, updatedFields) {
  const projects = getProjects()
  const updated = projects.map(p => p.id === id ? { ...p, ...updatedFields } : p)
  saveProjects(updated)
  return updated.find(p => p.id === id)
}

export function deleteProject(id) {
  const projects = getProjects()
  const updated = projects.filter(p => p.id !== id)
  saveProjects(updated)
  return updated
}

export function getRequests() {
  try {
    const data = localStorage.getItem(REQUESTS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS))
      return INITIAL_REQUESTS
    }
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed to load requests from localStorage:', err)
    return INITIAL_REQUESTS
  }
}

export function saveRequests(requests) {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests))
    window.dispatchEvent(new CustomEvent('bip_requests_updated', { detail: requests }))
  } catch (err) {
    console.error('Failed to save requests:', err)
  }
}

export function getAppsScriptUrl() {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || import.meta.env.VITE_APPS_SCRIPT_URL || ''
}

export function setAppsScriptUrl(url) {
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim())
}

// Send request data to Google Apps Script Web App
export async function submitContributionRequest(formData) {
  const timestamp = new Date().toISOString()
  const newRequest = {
    id: `req-${Date.now()}`,
    projectId: formData.projectId,
    projectName: formData.projectName,
    name: formData.name,
    email: formData.email,
    github: formData.github,
    linkedin: formData.linkedin,
    reason: formData.reason,
    proposedIdea: formData.proposedIdea,
    fileName: formData.fileName || '',
    fileData: formData.fileData || '',
    status: 'Submitted',
    submittedAt: timestamp
  }

  // 1. Save locally
  const requests = getRequests()
  const updatedRequests = [newRequest, ...requests]
  saveRequests(updatedRequests)

  // 2. Submit to Google Apps Script if URL configured
  const webhookUrl = getAppsScriptUrl()
  if (webhookUrl) {
    try {
      const payload = {
        timestamp,
        projectName: formData.projectName,
        name: formData.name,
        email: formData.email,
        github: formData.github,
        linkedin: formData.linkedin,
        reason: formData.reason,
        proposedIdea: formData.proposedIdea,
        fileName: formData.fileName || '',
        status: 'Submitted'
      }

      // Apps Script web apps usually handle POST with JSON
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Avoid CORS preflight issues with Apps Script
        },
        body: JSON.stringify(payload),
        mode: 'no-cors' // Google Apps Script redirects require no-cors or JSONP handling
      })
    } catch (err) {
      console.warn('Google Apps Script submission error (saved locally):', err)
      // Note: we still consider the submission successful locally
    }
  }

  return newRequest
}

// Modular Notification Dispatcher
export function notifyContributor(request, status) {
  const notificationMsg = `[NOTIFICATION DISPATCHED] To: ${request.name} (${request.email})\nMessage: Your contribution request for "${request.projectName}" status has been updated to: ${status.toUpperCase()}!`
  console.log(notificationMsg)
  
  // Dispatch a browser custom event for toast / in-app notification
  window.dispatchEvent(new CustomEvent('bip_contributor_notified', {
    detail: {
      recipient: request.email,
      name: request.name,
      project: request.projectName,
      status: status,
      message: `Hi ${request.name}, your request to contribute to "${request.projectName}" has been ${status}!`
    }
  }))
}

export function updateRequestStatus(id, newStatus) {
  const requests = getRequests()
  let targetRequest = null
  const updated = requests.map(r => {
    if (r.id === id) {
      targetRequest = { ...r, status: newStatus }
      return targetRequest
    }
    return r
  })

  saveRequests(updated)

  if (targetRequest) {
    notifyContributor(targetRequest, newStatus)
  }

  return updated
}
