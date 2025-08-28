# Laytime Intelligence Platform

**Advanced maritime document processing system for Statement of Facts (SoF) and operational documents.**


## 🚢 Overview

Laytime Intelligence is a cutting-edge AI-powered platform designed specifically for maritime professionals to streamline document processing, extract critical operational data, and manage laytime calculations with unprecedented accuracy and efficiency.

### ✨ Key Features

- **🔄 Multi-Format Processing**: Seamlessly handle PDF, Word, CSV, and Excel documents
- **🤖 AI-Powered Extraction**: Intelligent pattern recognition for maritime events and data
- **⚡ Real-Time Processing**: Instant document analysis with live progress tracking
- **📊 Smart Data Management**: Edit, organize, and validate extracted maritime events
- **📤 Flexible Export Options**: Export data in JSON and CSV formats for integration
- **🔐 Secure Authentication**: Professional user management with profile customization
- **💬 AI Assistant**: Always-available chatbot for instant help and guidance
- **🎨 Professional Interface**: Clean, responsive design optimized for maritime workflows

## 🛠 Technology Stack

### Frontend Architecture
- **React 18** - Modern component-based user interface
- **Vite** - Lightning-fast development and build tooling
- **TailwindCSS** - Professional styling and responsive design
- **React Router** - Seamless client-side navigation

### Backend Infrastructure
- **FastAPI** - High-performance Python API framework
- **PyPDF2/PyMuPDF** - Advanced PDF text extraction capabilities
- **python-docx** - Comprehensive Word document processing
- **Python 3.11+** - Robust core processing engine

### Security & Storage
- **Local Storage** - Secure client-side data management
- **Profile Management** - Comprehensive user account system
- **Data Validation** - Robust input sanitization and validation

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** - JavaScript runtime environment
- **Python 3.11+** - Python interpreter
- **npm or yarn** - Package manager

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd laytime-intelligence
   ```

2. **Setup Frontend Environment**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend Environment**
   ```bash
   cd services/extractor
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   # Create frontend/.env.local
   VITE_EXTRACTOR_URL=http://localhost:8001
   ```

### Launch Application

1. **Start Backend Service**
   ```bash
   cd services/extractor
   python main_fixed.py
   ```

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Platform**
   - **Frontend**: http://localhost:5173
   - **API**: http://localhost:8001

### Quick Launch Commands
```bash
# Terminal 1 - Backend Service
cd services/extractor && python main_fixed.py

# Terminal 2 - Frontend Application
cd frontend && npm run dev
```

## 📋 Platform Usage

### Document Processing Workflow

1. **📁 Document Upload**
   - Drag and drop maritime documents (PDF, Word, CSV, Excel)
   - Multi-file support with real-time validation
   - Automatic format detection and processing

2. **🔍 Data Extraction**
   - AI-powered event detection and classification
   - Vessel information and port details extraction
   - Automatic time pattern recognition and parsing

3. **✏️ Review & Edit**
   - Interactive event table with inline editing
   - Real-time data validation and error highlighting
   - Add, modify, or delete extracted events

4. **💾 Save & Export**
   - Automatic saving to local storage
   - Export options: JSON, CSV formats
   - Integration-ready data structures

### User Management Features

1. **🔑 Authentication System**
   - Secure email-based authentication
   - Professional user profile management
   - Session persistence and security

2. **👤 Profile Customization**
   - Complete profile information management
   - Profile photo upload with global sync
   - Role and company information tracking

3. **💬 AI Assistant**
   - Always-available intelligent chatbot
   - Context-aware help and guidance
   - Maritime operations expertise

## 🔌 API Documentation

### Core Endpoints

```http
POST /extract          # Process PDF/Word documents
POST /extract-csv      # Process CSV/Excel files  
GET  /                 # Health check and status
```

### Request Example
```bash
curl -X POST \
  -F "file=@maritime-document.pdf" \
  http://localhost:8001/extract
```

### Response Format
```json
{
  "filename": "maritime-document.pdf",
  "vessel": "MV OCEAN PIONEER",
  "port": "PORT OF SINGAPORE",
  "cargo": "CONTAINER CARGO",
  "events": [
    {
      "name": "Vessel Arrival",
      "start_time": "08:00",
      "end_time": "08:30",
      "event_type": "arrival"
    },
    {
      "name": "Cargo Operations",
      "start_time": "09:00", 
      "end_time": "17:00",
      "event_type": "loading"
    }
  ]
}
```

## 📁 Project Architecture

```
laytime-intelligence/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AIChatbot.jsx   # AI assistant interface
│   │   │   ├── EventTable.jsx  # Maritime events display
│   │   │   ├── SupportModal.jsx # Customer support
│   │   │   └── TopNav.jsx      # Navigation header
│   │   ├── pages/              # Application pages
│   │   │   ├── LayspanDashboard.jsx # Main processing interface
│   │   │   ├── Profile.jsx     # User profile management
│   │   │   ├── SavedEvents.jsx # Event history management
│   │   │   └── SignIn.jsx      # Authentication interface
│   │   ├── context/            # React context providers
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── services/           # API integration
│   │   │   └── api.js          # Backend communication
│   │   └── utils/              # Utility functions
│   │       └── dataCleanup.js  # Data validation utilities
│   └── package.json
├── services/
│   └── extractor/              # Python processing service
│       ├── app/                # Core processing modules
│       ├── main_fixed.py       # FastAPI server
│       └── requirements.txt    # Python dependencies
└── README.md
```

## 🎯 Core Capabilities

### Advanced Document Processing
- **Multi-Format Intelligence**: Supports PDF, Word, CSV, Excel with format-specific optimization
- **Maritime Pattern Recognition**: Specialized algorithms for maritime document structures
- **Time Extraction Engine**: Advanced time pattern matching and normalization
- **Real-Time Processing**: Live progress tracking with instant feedback
- **Export Integration**: Seamless data export for external systems

### Professional User Experience
- **Responsive Design**: Optimized for desktop and mobile maritime operations
- **Drag & Drop Interface**: Intuitive file handling with visual feedback
- **Interactive Data Tables**: Real-time editing with validation
- **Profile Photo Management**: Professional user profiles with photo sync
- **AI-Powered Help**: Context-aware assistance for maritime operations

### Enterprise-Ready Features
- **Data Validation**: Comprehensive input sanitization and error handling
- **Event Management**: Complete CRUD operations for maritime events
- **Profile Synchronization**: Real-time updates across all platform components
- **Export Flexibility**: Multiple format support for system integration
- **Security First**: Secure data handling and user authentication

## 🚀 Deployment Options

### Production Configuration

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   VITE_EXTRACTOR_URL=https://api.laytime-intelligence.com
   ```

2. **Build Process**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deployment Targets**
   - **Frontend**: CDN, Static hosting (Vercel, Netlify)
   - **Backend**: Cloud platforms (AWS, Azure, GCP)

### Docker Deployment
```bash
# Container orchestration
docker-compose up -d
```

## 🔒 Security & Performance

### Security Features
- **Authentication**: Secure user session management
- **File Validation**: Comprehensive upload security checks
- **Data Protection**: Client-side encryption and secure storage
- **CORS Configuration**: Secure cross-origin request handling

### Performance Optimization
- **Efficient Processing**: Optimized document parsing algorithms
- **Local Caching**: Smart client-side result caching
- **Component Optimization**: Lazy loading and code splitting
- **Build Optimization**: Minified production builds for fast loading

## 🤝 Contributing

We welcome contributions from the maritime technology community!

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📞 Support & Contact

- **📧 Email Support**: abhishekgiri1978@gmail.com
- **🐛 Bug Reports**: GitHub Issues
- **📖 Documentation**: Inline code comments and API docs
- **💬 AI Assistant**: Available 24/7 within the platform

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 🌊 About Laytime Intelligence

**Built specifically for the Maritime Industry**

*Empowering maritime professionals worldwide with intelligent document processing and operational efficiency.*

**Integrated Maritime Exchange (IME) - Transforming Maritime Operations Through Technology**

---

### 🏆 Why Choose Laytime Intelligence?

- ✅ **Maritime-Specific**: Built by maritime professionals for maritime operations
- ✅ **AI-Powered**: Advanced machine learning for accurate data extraction  
- ✅ **User-Friendly**: Intuitive interface designed for operational efficiency
- ✅ **Scalable**: Handles everything from single documents to bulk processing
- ✅ **Secure**: Enterprise-grade security for sensitive maritime data
- ✅ **Support**: Comprehensive support with AI assistant and expert help

*Transform your maritime document processing today with Laytime Intelligence.*
