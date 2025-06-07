import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' })
    }

    const filePath = path.join(process.cwd(), 'content.md')
    fs.writeFileSync(filePath, content, 'utf8')
    
    res.status(200).json({ message: 'Content saved successfully' })
  } catch (error) {
    console.error('Error saving file:', error)
    res.status(500).json({ message: 'Failed to save content' })
  }
} 