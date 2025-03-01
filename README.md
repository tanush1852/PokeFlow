# PokeFlow

PokeFlow is a powerful workflow automation platform that seamlessly integrates with Google Suite, Notion and LinkedIn to streamline task management, meeting coordination, and document organization. The platform leverages AI capabilities and provides a no-code environment for creating custom automation workflows.

## 🚀 Features

### Core Functionality
- **Google Suite Integration**: Seamless automation of tasks, calendar management, and file organization across Google Workspace
- **AI-Powered Meeting Assistant**: Automatic meeting summarization using OpenAI
- **Notion Integration**: Automated task creation and management through the Notion API
- **Recruitment Automation**: LinkedIn data scraping tool for candidate sourcing based on job descriptions
- **No-Code Workflow Builder**: Intuitive interface for creating custom automation templates
- **Workflow Marketplace**: Platform for sharing and monetizing custom automation templates (in development)

### Technical Highlights
- Real-time data synchronization with Google Suite services
- OpenAI integration for intelligent content processing
- Secure authentication and data handling
- Stripe integration for marketplace transactions
- Scalable Flask backend architecture
- Modern React frontend with responsive design

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: Flask
- **Database**: Firebase
- **APIs**:
  - Google Suite APIs
  - Notion API
  - OpenAI API
  - LinkedIn API
  - Stripe API

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pokeflow.git

# Install frontend dependencies
cd pokeflow/frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

## 🔧 Configuration

1. Create a `.env` file in the backend directory with the following variables:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NOTION_API_KEY=your_notion_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

2. Set up Firebase configuration in `frontend/src/config/firebase.js`

## 🚦 Running the Application

```bash
# Start the Flask backend
cd backend
python app.py

# Start the React frontend
cd frontend
npm start
```

## 🎯 Future Roadmap

- Template marketplace with user-generated workflows
- Advanced AI-powered workflow suggestions
- Enhanced recruitment automation features
- Mobile application development
- Integration with additional productivity tools

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
