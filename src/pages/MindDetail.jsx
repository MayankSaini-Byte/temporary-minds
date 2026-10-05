import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MindViewer from '../components/MindViewer'
import MindMinimap from '../components/MindMinimap'
import PageTransition from '../components/PageTransition'
import { client } from '../lib/sanity'
import { FiArrowLeft } from 'react-icons/fi'

export default function MindDetail() {
  const { slug } = useParams()
  const [mind, setMind] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMind() {
      try {
        // Explicitly project safe public fields and exclude drafts to avoid leaking metadata or unreleased content
        const query = `*[_type == "mind" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
          _id,
          title,
          slug,
          publishedAt,
          mainImage,
          body,
          notebookUrl,
          "authorName": author->name,
          "categories": categories[]->title
        }`
        const fetchedMind = await client.fetch(query, { slug })
        setMind(fetchedMind || null)
      } catch (err) {
        console.error("Failed to fetch mind from Sanity:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMind()
  }, [slug])

  return (
    <PageTransition className="page mind-detail-page">
      <div className="mind-detail-container">
        <motion.div 
          className="back-link-wrapper"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/minds" className="back-link minimal-back cursor-target" title="Back to Archive">
            <FiArrowLeft size={24} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="pdf-loading">
            <div className="spinner" />
            <p>Loading Issue...</p>
          </div>
        ) : mind ? (
          <>
            <MindMinimap body={mind.body} />
            <MindViewer mind={mind} fullWidth />
          </>
        ) : (
          <div className="mind-viewer empty-state">
            <h3>Issue Not Found</h3>
            <p>The requested edition could not be found.</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
