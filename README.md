# PokeFlow

PokeFlow is a powerful workflow automation platform that seamlessly integrates with Google Suite, Notion and LinkedIn to streamline task management, meeting coordination, and document organization. The platform leverages AI capabilities and provides a no-code environment for creating custom automation workflows.

[![GitHub stars](https://img.shields.io/github/stars/yourusername/pokeflow.svg?style=social&label=Star)](https://github.com/yourusername/pokeflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
  - LinkedIn Scraping

## Interface

<div align="center">
  <img src="https://github.com/user-attachments/assets/4f076c77-c6fd-4bf1-9d53-376688161884" alt="Dashboard" width="700"/>
</div>

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px;">
  <img src="https://github.com/user-attachments/assets/d361c9e7-c00c-4d1a-b014-72c2d85fcd4f" alt="Workflow Builder" width="340"/>
  <img src="https://github.com/user-attachments/assets/fa95a75a-314d-46fe-a344-479a5496912b" alt="Integration Panel" width="340"/>
</div>

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px;">
  <img src="https://github.com/user-attachments/assets/362de8d5-c796-4769-8dae-e7dd3dda5bbc" alt="Calendar Integration" width="340"/>
  <img src="https://github.com/user-attachments/assets/e11fedbc-4f38-4953-bfdf-7cdab52af52a" alt="Document Management" width="340"/>
</div>

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px;">
  <img src="https://github.com/user-attachments/assets/19e91833-61fc-491e-b5f3-847119b95523" alt="Analytics Dashboard" width="340"/>
  <img src="https://github.com/user-attachments/assets/f3a8ec28-92ed-4e94-a0ec-d842ec20a846" alt="Template Marketplace" width="340"/>
</div>

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

## 📊 Key Benefits

- **Time Savings**: Automate repetitive tasks to focus on high-value work
- **Reduced Errors**: Eliminate manual data entry and human error
- **Improved Collaboration**: Streamline communication between team members
- **Enhanced Productivity**: Create consistent workflows that scale with your business
- **Data Insights**: Gain valuable analytics on your workflows and processes

## 🔒 Security

PokeFlow prioritizes the security of your data:
- End-to-end encryption for all data in transit
- OAuth 2.0 authentication for all service connections
- Regular security audits and updates
- GDPR and CCPA compliant data handling

