# EthiScan — AI-Powered Ethical Brand Intelligence Platform

EthiScan is an AI-powered web application that helps users understand the ethical and sustainability profile of brands. It combines web search intelligence, AI analysis, and user search history to provide an easy-to-understand ethical evaluation.

## 🚀 Live Demo

- **Live Application:** https://vidhya1101.github.io/EthiScan/
- **GitHub Repository:** https://github.com/Vidhya1101/EthiScan
> The frontend is hosted on GitHub Pages and the backend is deployed on Render. MongoDB Atlas is used for database storage.

---

## ✨ Features

### 🔍 Live Brand Analysis
- Search for a brand directly from the web application.
- Uses live web search data to gather relevant sustainability and ethical information.
- Generates a dynamic AI-based evaluation for the searched brand.

### 🤖 AI Ethical Scoring
- Provides an ethical score for the analyzed brand.
- Includes sustainability information and industry classification.
- Explains positive indicators and ethical concerns.

### 🌱 Smart Ethical Alternatives
- Suggests alternative brands based on the AI analysis.
- Helps users explore potentially more ethical choices.

### 🔐 User Authentication
- User registration and login.
- JWT-based authentication.
- Passwords are securely hashed using bcrypt.

### 📊 Dashboard & Search History
- Stores authenticated users' search history.
- Displays ethical, warning, and unethical search statistics.
- Provides a personal dashboard for reviewing previous searches.

### 🎨 Modern Interface
- Dark futuristic UI.
- Responsive layout.
- Smooth animations and interactive components.

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- GitHub Pages

### Backend
- Node.js
- Express.js
- Render

### Database
- MongoDB Atlas
- Mongoose

### AI & Web Intelligence
- OpenRouter AI API
- Serper Web Search API

### Authentication & Security
- JWT
- bcrypt.js
- CORS

---

## 🏗️ Architecture

```text
                    EthiScan
                       │
                       ▼
              GitHub Pages Frontend
                       │
                       ▼
               Render Backend API
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Serper Web Search          OpenRouter AI
          │                         │
          └────────────┬────────────┘
                       ▼
                Ethical Analysis
                       │
                       ▼
                 MongoDB Atlas
                       │
                       ▼
              Dashboard & History
```

---

## 🌐 Deployment

EthiScan is deployed using a separate frontend and backend architecture:

| Component | Platform | Link |
|---|---|---|
| Frontend | GitHub Pages | https://vidhya1101.github.io/EthiScan/ |
| Source Code | GitHub | https://github.com/Vidhya1101/EthiScan |
| Database | MongoDB Atlas | Cloud database |

The GitHub Pages frontend sends API requests to the Render backend. The backend communicates with MongoDB Atlas, Serper, and OpenRouter to process brand searches and store authenticated users' search history.

---

## 💻 Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Vidhya1101/EthiScan.git
cd EthiScan
```

### 2. Navigate to the Backend

```bash
cd backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
SERPER_API_KEY=your_serper_api_key
```

**Never commit the `.env` file or real API keys to GitHub.**

### 5. Start the Backend

```bash
node server.js
```

The local backend normally runs on:

```text
http://localhost:5000
```

---

## 📁 Project Structure

```text
EthiScan/
├── backend/
│   ├── models/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── docs/
│   ├── css/
│   ├── js/
│   ├── components/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   └── register.html
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 🔄 Application Flow

1. User opens the EthiScan web application.
2. User searches for a brand.
3. The frontend sends the request to the Render backend.
4. The backend collects relevant web information using Serper.
5. OpenRouter AI analyzes the collected information.
6. EthiScan generates an ethical score and supporting insights.
7. Authenticated searches are stored in MongoDB Atlas.
8. Users can view their search history and statistics on the dashboard.

---

## 🔮 Future Improvements

- Barcode scanning support
- Product-level ethical analysis
- Browser extension integration
- Mobile application
- Community verification system
- AI-powered ESG report generation
- Personalized ethical preferences
- Multi-language support
- Advanced AI explainability
- Real-time sustainability monitoring

---

## 👩‍💻 Project

**EthiScan — AI-Powered Ethical Brand Intelligence Platform**

GitHub: https://github.com/Vidhya1101/EthiScan

Live Demo: https://vidhya1101.github.io/EthiScan/
