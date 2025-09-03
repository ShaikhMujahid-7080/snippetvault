<div align="center">
  <img src="https://raw.githubusercontent.com/microsoft/vscode-icons/main/icons/file_type_snippet.svg" width="120" alt="SnippetVault Logo" />
  
  # ✨ SnippetVault
  
  ### A beautiful, minimal, and highly functional code snippet manager
  
  *Your personal vault for storing, organizing, and quickly copying templates, syntax, commands, and prompts*
  
  [![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Site-blue?style=for-the-badge)](https://ShaikhMujahid-7080.github.io/snippetvault/)
  [![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-green?style=for-the-badge&logo=github)](https://github.com/ShaikhMujahid-7080/snippetvault)
  
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)

</div>

---

## 🎯 Project Overview

SnippetVault is a modern web application designed to replace chaotic snippet storage methods (like saving code in Telegram groups) with a clean, organized, and highly functional solution. Built with React, Vite, and Tailwind CSS, it offers a beautiful glassmorphism design with powerful functionality.

### ✨ Key Features

#### 🏠 **Dashboard & Organization**
- **Category-based organization** - Markdown, LaTeX, CMD, ADB, GPT prompts, and more
- **Beautiful card layout** with hover animations
- **Real-time search** across titles, descriptions, and tags
- **Advanced filtering** by category and favorites

#### 📝 **Snippet Management** 
- **Quick add/edit/delete** snippets with intuitive modal forms
- **One-click copying** with toast notifications
- **Auto-language detection** for syntax highlighting
- **Flexible tagging system** for better organization
- **Favorites system** to star important snippets

#### 🎨 **Modern UI/UX**
- **Glassmorphism design** with soft colors and blur effects
- **Dark/Light theme toggle** with system preference detection
- **Fully responsive** - works perfectly on all devices
- **Smooth animations** and micro-interactions
- **Professional syntax highlighting** with Prism.js

#### 💾 **Data Management**
- **Local storage persistence** - your data stays with you
- **Import/Export functionality** - backup and restore as JSON
- **Drag-and-drop support** (coming soon)
- **Keyboard shortcuts ready** for power users

---

## 🚀 Live Demo

**[🌐 Try SnippetVault Live](https://ShaikhMujahid-7080.github.io/snippetvault/)**

---

## 📱 Screenshots

<div align="center">
  
### Light Theme Dashboard
![Light Theme](https://via.placeholder.com/800x450/f8fafc/1e293b?text=Light+Theme+Dashboard)

### Dark Theme with Glassmorphism
![Dark Theme](https://via.placeholder.com/800x450/0f172a/f1f5f9?text=Dark+Theme+Dashboard)

### Add Snippet Modal
![Add Snippet](https://via.placeholder.com/600x400/3b82f6/ffffff?text=Add+Snippet+Modal)

</div>

---

## 🛠️ Tech Stack

| Technology | Usage | Version |
|------------|-------|---------|
| **React** | Frontend framework | ^18.3.1 |
| **Vite** | Build tool & dev server | ^5.4.1 |
| **Tailwind CSS** | Styling & design system | ^3.4.1 |
| **React Icons** | Beautiful icon library | ^5.3.0 |
| **React Toastify** | Toast notifications | ^10.0.5 |
| **React Syntax Highlighter** | Code syntax highlighting | ^15.5.0 |
| **Prism.js** | Syntax highlighting themes | ^1.29.0 |

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/ShaikhMujahid-7080/snippetvault.git
   cd snippetvault
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start development server**
   ```
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```
npm run build
npm run preview  # Preview the build locally
```

---

## 📁 Project Structure

```
snippetvault/
├── 📁 src/
│   ├── 📁 components/          # React components
│   │   ├── SnippetCard.jsx    # Individual snippet display
│   │   ├── AddSnippetModal.jsx # Add/edit snippet form
│   │   ├── SearchBar.jsx      # Search and filter
│   │   ├── ThemeToggle.jsx    # Dark/light theme switcher
│   │   └── CategoryManager.jsx # Category management
│   ├── 📁 hooks/              # Custom React hooks
│   │   ├── useLocalStorage.js # Local storage management
│   │   └── useTheme.js       # Theme state management
│   ├── 📁 utils/              # Utility functions
│   │   ├── storage.js        # Import/export functionality
│   │   └── codeLanguageDetector.js # Auto language detection
│   ├── 📁 data/               # Sample data
│   │   └── snippets.json     # Initial snippet data
│   ├── App.jsx               # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles & Tailwind
├── 📁 public/                 # Static assets
├── 📁 .github/workflows/      # GitHub Actions for deployment
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

---

## 🎯 Usage Guide

### Adding a New Snippet
1. Click the **"Add Snippet"** button
2. Fill in the title, description, and code
3. Select or create a category
4. Add relevant tags (comma-separated)
5. The language will be auto-detected
6. Click **"Save Snippet"**

### Organizing Snippets
- **Search** using the search bar (searches titles, descriptions, and tags)
- **Filter** by category using the dropdown
- **Star favorites** for quick access
- **Copy snippets** with one click

### Customization
- **Toggle theme** using the theme switcher in the header
- **Import/Export** your snippets as JSON files
- **Categories** can be customized in the code

---

## 🚀 Deployment

This project is configured for easy deployment to GitHub Pages:

### Automatic Deployment
1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your site will be live at `https://ShaikhMujahid-7080.github.io/snippetvault/`

### Manual Deployment
```
npm run deploy
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Ideas for Contributions
- [ ] Drag-and-drop snippet reordering
- [ ] Keyboard shortcuts (Ctrl+C to copy, etc.)
- [ ] Markdown preview for Markdown snippets
- [ ] Export to different formats (HTML, PDF)
- [ ] Snippet sharing via URL
- [ ] Advanced search with regex support
- [ ] Bulk operations (delete multiple, bulk edit)
- [ ] Custom themes and color schemes

---

## 📋 Roadmap

### Version 2.0 (Planned)
- [ ] **Cloud Sync** - Firebase/Supabase integration
- [ ] **Collaboration** - Share snippets with teams
- [ ] **Advanced Editor** - Monaco editor integration
- [ ] **Plugin System** - Extensible architecture
- [ ] **Mobile App** - React Native companion
- [ ] **AI Integration** - Smart snippet suggestions

### Version 1.5 (Next)
- [ ] **Enhanced Search** - Fuzzy search and filters
- [ ] **Snippet Templates** - Pre-made snippet templates
- [ ] **Custom Categories** - User-defined categories
- [ ] **Keyboard Navigation** - Full keyboard support

---
<!-- 
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

--- -->

## 🙏 Acknowledgments

- **React Team** for the amazing React library
- **Vite Team** for the lightning-fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Prism.js** for beautiful syntax highlighting
- **React Icons** for the comprehensive icon library

---

## 📞 Support & Contact

- **GitHub Issues** - [Report bugs or request features](https://github.com/ShaikhMujahid-7080/snippetvault/issues)
- **Discussions** - [Join the community](https://github.com/ShaikhMujahid-7080/snippetvault/discussions)
- **Email** - shaikhmujahid7080@gmail.com

---

<div align="center">

### ⭐ If you found SnippetVault helpful, please star the repository!

**Made with ❤️ by [Shaikh Mujahid](https://github.com/ShaikhMujahid-7080)**

*Replace chaotic snippet storage with organized, beautiful SnippetVault*

</div>
