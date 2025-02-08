import React, { useState, useEffect } from 'react';
import {
  Mail, Linkedin, FileText, Database, Search, FileSpreadsheet,
  Sparkles, Video, Link2, User, Lock, MapPin, Briefcase,
  Upload, X, Sun, Moon, Plus, ArrowRight
} from 'lucide-react';

const IntegratedInterface = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedApp, setDraggedApp] = useState(null);
  const [droppedApps, setDroppedApps] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [selectedFile, setSelectedFile] = useState({});
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'apps'

  const apps = [
    { 
      id: 1, 
      name: 'Google Meet', 
      icon: Video, 
      color: '#00897B',
      description: 'Summarize meeting transcripts and create action items'
    },
    { 
      id: 2, 
      name: 'Gmail', 
      icon: Mail, 
      color: '#EA4335',
      description: 'Process emails, tasks, and attachments'
    },
    { 
      id: 3, 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: '#0A66C2',
      description: 'Search and analyze job listings'
    },
    { 
      id: 4, 
      name: 'Google Drive', 
      icon: Database, 
      color: '#0F9D58',
      description: 'Store and manage files'
    },
    { 
      id: 5, 
      name: 'Google Sheets', 
      icon: FileSpreadsheet, 
      color: '#34A853',
      description: 'Analyze and visualize data'
    },
    { 
      id: 6, 
      name: 'Notion', 
      icon: FileText, 
      color: '#000000',
      description: 'Document and organize information'
    }
  ];

  const templates = [
    {
      id: 1,
      name: "Gmail Tasks to Notion",
      description: "Automatically sync your Gmail tasks to Notion for better task management",
      apps: [
        { 
          id: 2, 
          name: 'Gmail', 
          icon: Mail, 
          color: '#EA4335',
          presetOptions: { tasks: true }
        },
        { 
          id: 6, 
          name: 'Notion', 
          icon: FileText, 
          color: '#000000'
        }
      ]
    },
    {
      id: 2,
      name: "Gmail Attachments to Drive",
      description: "Save your Gmail attachments directly to Google Drive",
      apps: [
        { 
          id: 2, 
          name: 'Gmail', 
          icon: Mail, 
          color: '#EA4335',
          presetOptions: { attachments: true }
        },
        { 
          id: 4, 
          name: 'Google Drive', 
          icon: Database, 
          color: '#0F9D58'
        }
      ]
    },
    {
      id: 3,
      name: "Meet Summary to Sheets",
      description: "Summarize meeting transcripts and save them to Google Sheets",
      apps: [
        { 
          id: 1, 
          name: 'Google Meet', 
          icon: Video, 
          color: '#00897B'
        },
        { 
          id: 5, 
          name: 'Google Sheets', 
          icon: FileSpreadsheet, 
          color: '#34A853'
        }
      ]
    }
  ];

  const handleTemplateSelect = (template) => {
    // Clear existing apps and states
    setDroppedApps([]);
    setSelectedOptions({});
    setCredentials({});
    setSelectedFile({});

    // Add template apps
    setDroppedApps(template.apps);

    // Set any preset options
    template.apps.forEach(app => {
      if (app.presetOptions) {
        setSelectedOptions(prev => ({
          ...prev,
          [app.id]: app.presetOptions
        }));
      }
    });

    // Switch to apps view
    setActiveTab('apps');
  };

  const handleOptionChange = (appId, option) => {
    setSelectedOptions({
      ...selectedOptions,
      [appId]: {
        ...selectedOptions[appId],
        [option]: !selectedOptions[appId]?.[option]
      }
    });
  };

  const handleCredentialChange = (appId, field, value) => {
    setCredentials({
      ...credentials,
      [appId]: {
        ...credentials[appId],
        [field]: value
      }
    });
  };

  const handleFileChange = (appId, event) => {
    const file = event.target.files[0];
    setSelectedFile({
      ...selectedFile,
      [appId]: file
    });
  };

  const handleDragStart = (app) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedApp && !droppedApps.find(app => app.id === draggedApp.id)) {
      setDroppedApps([...droppedApps, draggedApp]);
    }
    setDraggedApp(null);
  };

  const removeApp = (appId) => {
    setDroppedApps(droppedApps.filter(app => app.id !== appId));
    setSelectedOptions({ ...selectedOptions, [appId]: {} });
    setCredentials({ ...credentials, [appId]: {} });
    setSelectedFile({ ...selectedFile, [appId]: null });
  };

  const renderAppOptions = (app) => {
    switch (app.name) {
      case 'Google Meet':
        return (
          <div className="space-y-3">
            <div className={`p-4 rounded border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <label className="flex items-center justify-center w-full">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(app.id, e)}
                  className="hidden"
                  accept=".txt"
                />
                <div className={`flex flex-col items-center cursor-pointer ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">
                    {selectedFile[app.id]?.name || 'Upload text file to summarize'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        );

      case 'Gmail':
        return (
          <div className="space-y-3">
            {['loadMails', 'tasks', 'attachments'].map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOptions[app.id]?.[option] || false}
                  onChange={() => handleOptionChange(app.id, option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
        );

      case 'LinkedIn':
        return (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'email', e.target.value)}
              value={credentials[app.id]?.email || ''}
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'password', e.target.value)}
              value={credentials[app.id]?.password || ''}
            />
            <input
              type="text"
              placeholder="Job Post"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'jobPost', e.target.value)}
              value={credentials[app.id]?.jobPost || ''}
            />
            <input
              type="text"
              placeholder="Location"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'location', e.target.value)}
              value={credentials[app.id]?.location || ''}
            />
          </div>
        );

      case 'Google Drive':
        return (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Gmail ID"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'email', e.target.value)}
              value={credentials[app.id]?.email || ''}
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              onChange={(e) => handleCredentialChange(app.id, 'password', e.target.value)}
              value={credentials[app.id]?.password || ''}
            />
          </div>
        );

      case 'Google Sheets':
        const prevApp = droppedApps[droppedApps.findIndex(a => a.id === app.id) - 1];
        return prevApp ? (
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Data from {prevApp.name} will be stored in Sheets
            </p>
          </div>
        ) : null;

      case 'Notion':
        const previousApp = droppedApps[droppedApps.findIndex(a => a.id === app.id) - 1];
        return previousApp ? (
          <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Data from {previousApp.name} will be stored in Notion
            </p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const handleSubmit = () => {
    console.log('Processing apps with the following data:');
    console.log('Dropped Apps:', droppedApps);
    console.log('Selected Options:', selectedOptions);
    console.log('Credentials:', credentials);
    console.log('Selected Files:', selectedFile);
  };

  return (
    <div className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Integration Hub
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'templates'
                    ? darkMode 
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('apps')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'apps'
                    ? darkMode 
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : darkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Apps
              </button>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="col-span-3">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              {activeTab === 'templates' ? (
                <div className="space-y-4">
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Saved Templates
                  </h2>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border ${
                        darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      } cursor-pointer transition-colors`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {template.name}
                      </h3>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {template.description}
                      </p>
                      <div className="flex space-x-2">
                        {template.apps.map((app) => (
                          <div
                            key={app.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: app.color }}
                          >
                            <app.icon className="w-5 h-5 text-white" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    {apps
                      .filter(app => 
                        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.description.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((app) => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={() => handleDragStart(app)}
                          className={`p-4 rounded-lg border ${
                            darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          } cursor-move transition-colors`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: app.color }}
                            >
                              <app.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {app.name}
                              </h3>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {app.description}
                              </p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-9">
            <div
              className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow min-h-[600px]`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {droppedApps.length === 0 ? (
                <div className={`h-full flex flex-col items-center justify-center ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Plus className="w-12 h-12 mb-4" />
                  <p className="text-lg">Drag and drop apps here to get started</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {droppedApps.map((app, index) => (
                    <div
                      key={app.id}
                      className={`p-6 rounded-lg border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: app.color }}
                          >
                            <app.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {app.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeApp(app.id)}
                          className={`p-1 rounded-lg hover:bg-gray-200 ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                          }`}
                        >
                          <X className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                        </button>
                      </div>
                      {renderAppOptions(app)}
                      {index < droppedApps.length - 1 && (
                        <div className="flex justify-center my-4">
                          <ArrowRight className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleSubmit}
                    className={`w-full py-3 rounded-lg ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white font-medium transition-colors`}
                  >
                    Process Integration
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedInterface;