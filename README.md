# ForteXa Tech - Algo Trading Site

A simple Next.js static site that connects to a markdown file for easy content editing.

## Features

- 🚀 **Next.js Static Site Generation (SSG)**
- ✏️ **Live Markdown Editing** - Click the edit button to modify content
- 💾 **Auto-save** - Changes are saved back to the markdown file
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized for speed

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Edit Content

- Click the floating edit button (✏️) in the bottom right corner
- Edit the markdown content directly in the browser
- Click "Save Changes" to save your edits
- The content is automatically saved to `content.md`

### 4. Build for Production

```bash
npm run build
```

This will create an optimized static build in the `out` folder.

## File Structure

```
fortexa-tech/
├── pages/
│   ├── index.js          # Main page
│   ├── _app.js           # App wrapper
│   └── api/
│       └── save-markdown.js  # API to save markdown
├── content.md            # Editable markdown content
├── package.json          # Dependencies
├── next.config.js        # Next.js configuration
└── README.md            # This file
```

## How to Edit Content

1. **Via Browser**: Click the edit button and modify content directly
2. **Via File**: Edit `content.md` file directly in your code editor
3. **Via API**: Use the `/api/save-markdown` endpoint programmatically

## Deployment

This site can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Upload the `out` folder after `npm run build`
- **GitHub Pages**: Use the static files from `out` folder

## Technologies Used

- **Next.js 14** - React framework with SSG
- **React** - UI library
- **remark** - Markdown processor
- **gray-matter** - Frontmatter parser # Fortexa-algo
