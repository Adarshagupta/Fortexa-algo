import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
// import AIChat from '../components/AIChat' // Disabled for static export

const MermaidRenderer = ({ content }) => {
  const ref = useRef(null)

  useEffect(() => {
    const renderMermaid = async () => {
      if (ref.current && content) {
        try {
          const mermaid = (await import('mermaid')).default
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              primaryColor: '#ffffff',
              primaryTextColor: '#000000',
              primaryBorderColor: '#000000',
              lineColor: '#000000',
              sectionBkColor: '#ffffff',
              altSectionBkColor: '#f0f0f0',
              gridColor: '#000000',
              secondaryColor: '#ffffff',
              tertiaryColor: '#ffffff',
              fontFamily: 'Times New Roman, serif',
              fontSize: '10pt'
            }
          })
          
          const { svg } = await mermaid.render(`mermaid-${Date.now()}`, content)
          ref.current.innerHTML = svg
        } catch (error) {
          console.error('Error rendering Mermaid:', error)
          ref.current.innerHTML = `<pre style="border: 1px solid #ccc; padding: 10px; background: #f9f9f9;">${content}</pre>`
        }
      }
    }

    renderMermaid()
  }, [content])

  return (
    <div 
      ref={ref} 
      className="mermaid-container"
      style={{
        textAlign: 'center',
        margin: '20px 0',
        padding: '15px',
        border: '2px solid #000000',
        background: '#ffffff'
      }}
    />
  )
}

const ContentWithMermaid = ({ htmlContent, mermaidBlocks }) => {
  // Split content by mermaid placeholders and render diagrams inline
  const renderContentWithMermaid = () => {
    if (!mermaidBlocks.length) {
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    }

    // Split HTML content by mermaid placeholders
    let parts = [htmlContent]
    mermaidBlocks.forEach(block => {
      const placeholder = `MERMAID_PLACEHOLDER_${block.id}`
      const newParts = []
      parts.forEach(part => {
        if (typeof part === 'string' && part.includes(placeholder)) {
          const splitParts = part.split(placeholder)
          newParts.push(splitParts[0])
          newParts.push(block) // Insert mermaid block
          newParts.push(splitParts[1])
        } else {
          newParts.push(part)
        }
      })
      parts = newParts
    })

    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        )
      } else {
        // This is a mermaid block
        return (
          <MermaidRenderer 
            key={part.id}
            content={part.content}
          />
        )
      }
    })
  }

  return <div>{renderContentWithMermaid()}</div>
}

export default function Home({ content, data }) {
  const [isEditing, setIsEditing] = useState(false)
  const [markdownContent, setMarkdownContent] = useState(content)
  const [renderedContent, setRenderedContent] = useState('')
  const [mermaidBlocks, setMermaidBlocks] = useState([])

  useEffect(() => {
    renderMarkdown(markdownContent)
  }, [markdownContent])

  const renderMarkdown = async (markdown) => {
    // First extract mermaid blocks
    const { cleanMarkdown, extractedMermaid } = extractMermaidBlocks(markdown)
    setMermaidBlocks(extractedMermaid)
    
    // Then process the markdown normally
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html)
      .process(cleanMarkdown)
    
    setRenderedContent(processedContent.toString())
  }

  const extractMermaidBlocks = (markdown) => {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    const extractedMermaid = []
    let match
    let cleanMarkdown = markdown
    
    while ((match = mermaidRegex.exec(markdown)) !== null) {
      const mermaidContent = match[1].trim()
      const mermaidId = `mermaid-${extractedMermaid.length}`
      
      extractedMermaid.push({
        id: mermaidId,
        content: mermaidContent
      })
      
      // Replace with a placeholder
      cleanMarkdown = cleanMarkdown.replace(match[0], `MERMAID_PLACEHOLDER_${mermaidId}`)
    }

    return { cleanMarkdown, extractedMermaid }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-markdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: markdownContent }),
      })
      
      if (response.ok) {
        alert('Content saved successfully!')
        setIsEditing(false)
      } else {
        alert('Failed to save content')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving content')
    }
  }

  return (
    <>
      <Head>
        <title>ForteXa Tech - Algo Trading</title>
        <meta name="description" content="High-Frequency Trading System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <h1>ForteXa Tech</h1>
              <p className="tagline">High-Frequency Trading System</p>
            </div>
            <div className="features">
              <div className="feature">
                <span className="icon">⚡</span>
                <span>Blazing fast</span>
              </div>
              <div className="feature">
                <span className="icon">🔄</span>
                <span>Always available</span>
              </div>
              <div className="feature">
                <span className="icon">🏆</span>
                <span>Lighthouse 100</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="intro">
            <p>
              Patent in progress. View the source on{' '}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              .
            </p>
          </div>

          <div className="content-section">
            {!isEditing ? (
              <div className="markdown-content">
                <ContentWithMermaid 
                  htmlContent={renderedContent} 
                  mermaidBlocks={mermaidBlocks}
                />
              </div>
            ) : (
              <div className="editor-section">
                <textarea
                  className="markdown-editor"
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="Edit your markdown content here..."
                />
                <div className="editor-actions">
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Floating Edit Button - Disabled for static export */}
        {/*
        <div className="floating-actions">
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? "View Mode" : "Edit Mode"}
          >
            {isEditing ? '👁️' : '✏️'}
          </button>
        </div>
        */}

        {/* <AIChat /> */} {/* Disabled for static export */}
      </div>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 60px;
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.5;
          color: #000000;
          background: #ffffff;
          font-size: 12pt;
        }

        .header {
          text-align: center;
          border-bottom: 2px solid #000000;
          padding-bottom: 24px;
          margin-bottom: 36px;
        }

        .header-content .logo h1 {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 12px;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tagline {
          font-size: 11pt;
          color: #000000;
          margin-bottom: 20px;
          font-weight: normal;
          font-style: italic;
        }

        .features {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          font-size: 10pt;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #000000;
          font-weight: normal;
        }

        .icon {
          font-size: 10pt;
        }

        .intro {
          margin-bottom: 24px;
          padding: 12px;
          background: #f9f9f9;
          border: 1px solid #cccccc;
          font-size: 10pt;
          color: #333333;
          text-align: justify;
        }

        .intro a {
          color: #000080;
          text-decoration: underline;
        }

        .intro a:hover {
          text-decoration: none;
        }

        .content-section {
          background: #ffffff;
          border: 1px solid #cccccc;
          padding: 20px;
          margin-bottom: 20px;
        }

        .markdown-content {
          max-width: none;
        }

        .markdown-content :global(h1) {
          color: #000000;
          text-align: center;
          margin: 20px 0 16px;
          font-size: 16pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .markdown-content :global(h2) {
          color: #000000;
          margin: 18px 0 12px;
          font-size: 14pt;
          font-weight: bold;
        }

        .markdown-content :global(h3) {
          color: #000000;
          margin: 14px 0 8px;
          font-size: 12pt;
          font-weight: bold;
        }

        .markdown-content :global(ul) {
          margin: 12px 0;
          padding-left: 24px;
        }

        .markdown-content :global(li) {
          margin: 4px 0;
          font-size: 11pt;
          line-height: 1.4;
        }

        .markdown-content :global(strong) {
          color: #000000;
          font-weight: bold;
        }

        .markdown-content :global(hr) {
          border: none;
          height: 1px;
          background: #000000;
          margin: 20px 0;
        }

        .markdown-content :global(p) {
          margin: 12px 0;
          color: #000000;
          text-align: justify;
          font-size: 11pt;
          line-height: 1.4;
        }

        .markdown-content :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 16px auto;
          font-size: 9pt;
          background: white;
          border: 2px solid #000000;
        }

        .markdown-content :global(thead) {
          background: #ffffff;
        }

        .markdown-content :global(th) {
          padding: 6px 8px;
          text-align: center;
          font-weight: bold;
          border: 1px solid #000000;
          color: #000000;
          font-size: 9pt;
        }

        .markdown-content :global(td) {
          padding: 4px 6px;
          border: 1px solid #000000;
          vertical-align: top;
          text-align: left;
          font-size: 9pt;
        }

        .markdown-content :global(tr:nth-child(even)) {
          background: #ffffff;
        }

        .markdown-content :global(tr:hover) {
          background: #f5f5f5;
        }

        .markdown-content :global(table code) {
          background: rgba(0,0,0,0.05);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.85rem;
        }

        .markdown-content :global(blockquote) {
          border-left: 4px solid #667eea;
          padding-left: 20px;
          margin: 20px 0;
          background: #f8f9fa;
          padding: 15px 20px;
          border-radius: 4px;
        }

        .markdown-content :global(code) {
          background: #f0f0f0;
          padding: 1px 3px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 9pt;
          border: 1px solid #cccccc;
        }

        .markdown-content :global(pre) {
          background: #f9f9f9;
          padding: 12px;
          overflow-x: auto;
          margin: 12px 0;
          border: 1px solid #cccccc;
          font-family: 'Courier New', Courier, monospace;
        }

        .markdown-content :global(pre code) {
          background: none;
          padding: 0;
          font-size: 9pt;
          border: none;
        }

        .editor-section {
          width: 100%;
        }

        .markdown-editor {
          width: 100%;
          min-height: 600px;
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
        }

        .markdown-editor:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0,112,243,0.1);
        }

        .editor-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #0070f3;
          color: white;
        }

        .btn-primary:hover {
          background: #0051cc;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
          transform: translateY(-1px);
        }

        .floating-actions {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
        }

        .edit-btn {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          border: 1px solid #e1e4e8;
          background: #f6f8fa;
          color: #586069;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

                  .edit-btn:hover {
            background: #e1e4e8;
            border-color: #d0d7de;
          }

          .chart-container {
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #000000;
            background: #ffffff;
            page-break-inside: avoid;
          }

          .chart-container canvas {
            max-width: 100% !important;
            height: auto !important;
          }

        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }
          
          .header-content .logo h1 {
            font-size: 2rem;
          }
          
          .features {
            gap: 20px;
          }
          
          .content-section {
            padding: 20px;
          }
          
          .floating-actions {
            bottom: 20px;
            right: 20px;
          }
          
          .edit-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
        }
      `}</style>
    </>
  )
}

export async function getStaticProps() {
  const fullPath = path.join(process.cwd(), 'content.md')
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    props: {
      content,
      data,
    },
  }
} 