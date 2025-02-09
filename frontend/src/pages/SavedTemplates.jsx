import React, { useState, useEffect } from "react";
import {
  Mail,
  Linkedin,
  FileText,
  Database,
  Search,
  FileSpreadsheet,
  Sparkles,
  Video,
  Link2,
  User,
  Lock,
  MapPin,
  Briefcase,
  Upload,
  X,
  Sun,
  Moon,
  Plus,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GoogleSignInDialog from "@/pages/Googledialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
const getInitials = (name) => {
    if (!name) return "U"; // Default initial if name is missing
    const words = name.split(" ");
    return words.length > 1
      ? words[0][0] + words[1][0] // First letter of first & last name
      : words[0][0]; // First letter if only one word
  };
const IntegratedInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedApp, setDraggedApp] = useState(null);
  const [droppedApps, setDroppedApps] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [selectedFile, setSelectedFile] = useState({});
  const [activeTab, setActiveTab] = useState("templates");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null); // Clear stored user info
    toast.success("Signed out successfully!");
    navigate("/"); 
  };
  if (!user) return null;
  const apps = [
    {
      id: 1,
      name: "Google Meet",
      icon: Video,
      color: "#00897B",
      description: "Summarize meeting transcripts and create action items",
    },
    {
      id: 2,
      name: "Gmail",
      icon: Mail,
      color: "#EA4335",
      description: "Process emails, tasks, and attachments",
      validConnections: {
        tasks: [6], // Notion ID
        meet: [6], // Notion ID
        attachments: [4], // Google Drive ID
      },
    },
    {
      id: 3,
      name: "LinkedIn",
      icon: Linkedin,
      color: "#0A66C2",
      description: "Search and analyze job listings",
    },
    {
      id: 4,
      name: "Google Drive",
      icon: Database,
      color: "#0F9D58",
      description: "Store and manage files",
    },
    {
      id: 5,
      name: "Google Docs",
      icon: FileSpreadsheet,
      color: "#34A853",
      description: "Analyze and visualize data",
    },
    {
      id: 6,
      name: "Notion",
      icon: FileText,
      color: "#000000",
      description: "Document and organize information",
    },
  ];

  const templates = [
    {
      id: 1,
      name: "Gmail Tasks to Notion",
      description:
        "Automatically sync your Gmail tasks to Notion for better task management",
      apps: [
        {
          id: 2,
          name: "Gmail",
          icon: Mail,
          color: "#EA4335",
          presetOptions: { tasks: true}, 
        },
        {
          id: 6,
          name: "Notion",
          icon: FileText,
          color: "#000000",
        },
      ],
    },
    {
      id: 2,
      name: "Gmail Attachments to Drive",
      description: "Save your Gmail attachments directly to Google Drive",
      apps: [
        {
          id: 2,
          name: "Gmail",
          icon: Mail,
          color: "#EA4335",
          presetOptions: { attachments: true },
        },
        {
          id: 4,
          name: "Google Drive",
          icon: Database,
          color: "#0F9D58",
        },
      ],
    },
    {
      id: 3,
      name: "Meet Summary to Docs",
      description:
        "Summarize meeting transcripts and save them to Google Docs",
      apps: [
        {
          id: 1,
          name: "Google Meet",
          icon: Video,
          color: "#00897B",
        },
        {
          id: 5,
          name: "Google Docs",
          icon: FileSpreadsheet,
          color: "#34A853",
        },
      ],
    },
    {
      id: 4,
      name: "Gmail Meet to Doc", // Changed name
      description: "Save meeting details from Gmail to Sheets", // Changed description
      apps: [
        {
          id: 2,
          name: "Gmail",
          icon: Mail,
          color: "#EA4335",
          presetOptions: { meet: true },
        },
        {
          id: 5, // Changed to Sheets
          name: "Google Docs",
          icon: FileSpreadsheet,
          color: "#34A853",
        },
      ],
    },
  ];

  const handleTemplateSelect = (template) => {
    setDroppedApps([]);
    setSelectedOptions({});
    setCredentials({});
    setSelectedFile({});
    setDroppedApps(template.apps);

    template.apps.forEach((app) => {
      if (app.presetOptions) {
        setSelectedOptions((prev) => ({
          ...prev,
          [app.id]: app.presetOptions,
        }));
      }
    });

    setActiveTab("apps");
  };

  const handleOptionChange = (appId, option) => {
    const newOptions = {};
    newOptions[option] = !selectedOptions[appId]?.[option];
    setSelectedOptions({
      ...selectedOptions,
      [appId]: newOptions,
    });
  };

  const handleCredentialChange = (appId, field, value) => {
    setCredentials({
      ...credentials,
      [appId]: {
        ...credentials[appId],
        [field]: value,
      },
    });
  };

  const handleFileChange = (appId, event) => {
    const file = event.target.files[0];
    setSelectedFile({
      ...selectedFile,
      [appId]: file,
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
    if (!draggedApp) return;

    if (droppedApps.find((app) => app.id === draggedApp.id)) return;

    const gmailApp = droppedApps.find((app) => app.id === 2);
    const gmailOptions = gmailApp ? selectedOptions[2] || {} : {};
    const meetApp=droppedApps.find((app) => app.id === 1);
    const LinkedInapp=droppedApps.find((app) => app.id === 3);
    const googledriveapp=droppedApps.find((app) => app.id === 4);
    const docsapp=droppedApps.find((app) => app.id === 5);
    const notionapp=droppedApps.find((app) => app.id === 6);
    if(meetApp){
        const validConnections = apps.find((a) => a.id === 1).validConnections;
        if (meetApp && draggedApp.id !== 5) return;
    }
    if(googledriveapp){
       
        if (googledriveapp && draggedApp.id !== 5) return;
        if (googledriveapp && draggedApp.id !== 6) return;
        if (googledriveapp && draggedApp.id !== 1) return;
        if (googledriveapp && draggedApp.id !== 2) return;
        if (googledriveapp && draggedApp.id !== 3) return;
    }
    if(docsapp){
       
        if (docsapp && draggedApp.id !== 6) return;
        if (docsapp && draggedApp.id !== 4) return;
        if (docsapp && draggedApp.id !== 3) return;
        if (docsapp && draggedApp.id !== 2) return;
        if (docsapp && draggedApp.id !== 1) return;
    }
    if(notionapp){
        if (notionapp && draggedApp.id !== 1) return;
        if (notionapp && draggedApp.id !== 2) return;
        if (notionapp && draggedApp.id !== 3) return;
        if (notionapp && draggedApp.id !== 4) return;
        if (notionapp && draggedApp.id !== 5) return;
    }

    if (gmailApp) {
      const validConnections = apps.find((a) => a.id === 2).validConnections;
      if (gmailOptions.tasks && draggedApp.id !== 6) return;
      if (gmailOptions.meet && draggedApp.id !== 6) return; // Changed to 5 for Sheets
      if (gmailOptions.attachments && draggedApp.id !== 4) return;

    }
    if(LinkedInapp)
    {
        if (LinkedInapp && draggedApp.id !== 5) return;
    }

    setDroppedApps([...droppedApps, draggedApp]);
    setDraggedApp(null);
  };

  const removeApp = (appId) => {
    setDroppedApps(droppedApps.filter((app) => app.id !== appId));
    setSelectedOptions({ ...selectedOptions, [appId]: {} });
    setCredentials({ ...credentials, [appId]: {} });
    setSelectedFile({ ...selectedFile, [appId]: null });
  };

  const isValidConfiguration = () => {
    const gmailApp = droppedApps.find((app) => app.id === 2);
    if (!gmailApp) return true;

    const gmailOptions = selectedOptions[2] || {};
    const hasGmailOption = Object.values(gmailOptions).some((val) => val);

    if (!hasGmailOption) return true;

    if (gmailOptions.tasks) {
      return droppedApps.some((app) => app.id === 6);
    }
    if (gmailOptions.meet) {
      return droppedApps.some((app) => app.id === 6); // Changed to check for Sheets
    }
    if (gmailOptions.attachments) {
      return droppedApps.some((app) => app.id === 4);
    }

    return true;
  };

  const renderAppOptions = (app) => {
    switch (app.name) {
      case "Google Meet":
        return (
          <div className="space-y-3">
            <div
              className={`p-4 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <label className="flex items-center justify-center w-full">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(app.id, e)}
                  className="hidden"
                  accept=".txt"
                />
                <div
                  className={`flex flex-col items-center cursor-pointer ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">
                    {selectedFile[app.id]?.name ||
                      "Upload text file to summarize"}
                  </span>
                </div>
              </label>
            </div>
          </div>
        );

      case "Gmail":
        return (
          <div className="space-y-3">
            {["tasks", "meet", "attachments"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOptions[app.id]?.[option] || false}
                  onChange={() => handleOptionChange(app.id, option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
        );

      case "LinkedIn":
        return (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              onChange={(e) =>
                handleCredentialChange(app.id, "email", e.target.value)
              }
              value={credentials[app.id]?.email || ""}
            />
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              onChange={(e) =>
                handleCredentialChange(app.id, "password", e.target.value)
              }
              value={credentials[app.id]?.password || ""}
            />
            <input
              type="text"
              placeholder="Job Post"
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              onChange={(e) =>
                handleCredentialChange(app.id, "jobPost", e.target.value)
              }
              value={credentials[app.id]?.jobPost || ""}
            />
            <input
              type="text"
              placeholder="Location"
              className={`w-full p-2 rounded border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
              onChange={(e) =>
                handleCredentialChange(app.id, "location", e.target.value)
              }
              value={credentials[app.id]?.location || ""}
            />
          </div>
        );

      case "Google Drive":
        const previApp =
          droppedApps[droppedApps.findIndex((a) => a.id === app.id) - 1];
        return previApp ? (
          <div
            className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Data from {previApp.name} will be stored in Google Drive
            </p>
          </div>
        ) : null;

      case "Google Docs":
        const prevApp =
          droppedApps[droppedApps.findIndex((a) => a.id === app.id) - 1];
        return prevApp ? (
          <div
            className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Data from {prevApp.name} will be stored in Docs
            </p>
          </div>
        ) : null;

      case "Notion":
        const previousApp =
          droppedApps[droppedApps.findIndex((a) => a.id === app.id) - 1];
        return previousApp ? (
          <div
            className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Data from {previousApp.name} will be stored in Notion
            </p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    console.log("Processing apps with the following data:");
    console.log("Dropped Apps:", droppedApps);
    console.log("Selected Options:", selectedOptions);
    console.log("Credentials:", credentials);
    console.log("Selected Files:", selectedFile);

    for (const app of droppedApps) {
      const options = selectedOptions[app.id] || {};

      switch (app.name) {
        case "Gmail":
          if (options.tasks) {
            try {
              const response = await axios.get(
                "http://localhost:5000/api/send_tasks_notion",
              );
              console.log("Tasks loaded:", response.data);
              toast.success(`Successfully processed tasks from Gmail`);
            } catch (error) {
              console.error("Error loading tasks:", error);
              toast.error(`Failed to process tasks: ${error.message}`);
            }
          }
          if (options.meet) {
            try {
              const response = await axios.get(
                "http://localhost:5000/api/send_meet_notion",
              );
              console.log("Meet details loaded:", response.data);
              toast.success(`Successfully processed meet details from Gmail`);
            } catch (error) {
              console.error("Error loading meet details:", error);
              toast.error(`Failed to process meet details: ${error.message}`);
            }
          }
          if (options.attachments) {
            try {
              const response = await axios.get(
                "http://localhost:5000//api/save_attachments_drive",
              );
              console.log("Attachments loaded:", response.data);
              toast.success(`Successfully processed attachments from Gmail`);
            } catch (error) {
              console.error("Error loading attachments:", error);
              toast.error(`Failed to process attachments: ${error.message}`);
            }
          }
          break;

        case "LinkedIn":
          try {
            const response = await axios.post(
              "http://localhost:5000/api/scrape-linkedin",
              {
                email: credentials[app.id]?.email,
                password: credentials[app.id]?.password,
                job_title: credentials[app.id]?.jobPost,
                location: credentials[app.id]?.location,
              },
            );
            console.log("LinkedIn data loaded:", response.data);
            toast.success(`Successfully processed LinkedIn data`);
          } catch (error) {
            console.error("Error loading LinkedIn data:", error);
            toast.error(`Failed to process LinkedIn data: ${error.message}`);
          }
          break;
        
        case "Google Meet":
          try {
            const response = await axios.post("http://localhost:5000/api/minutes_meet", {
              meet_data: "Your meeting transcript or relevant data here"
            });
            console.log("Minutes of meeting loaded:", response.data);
            toast.success("Successfully processed Google Meet data");
          } catch (error) {
            console.error("Error processing meeting data:", error);
            toast.error(`Failed to process meeting data: ${error.message}`);
          }
          break;

        default:
          console.log(`No integration defined for ${app.name}`);
      }
    }
  };

  return (
    <div
      className={`min-h-screen p-8 ${darkMode ? "bg-gray-900" : "bg-blue-100"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <h1
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              PokeFlow ⚡
            </h1>
            <div className="flex space-x-4">
        
            
              <button
                onClick={() => setActiveTab("templates")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "templates"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                      ? "text-white hover:text-white"
                      : "text-white hover:text-white"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab("apps")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "apps"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                      ? "text-white hover:text-white"
                      : "text-white hover:text-white"
                }`}
              >
                Apps
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
          <div className="flex items-center gap-4">
          {user.picture ? (
        <img
          src={user.picture}
          alt="Profile"
          className="h-8 w-8 rounded-full"
        />
      ) : user.name ? (
        <span>{getInitials(user.name).toUpperCase()}</span>
      ) : (
        <UserCircle className="h-8 w-8 text-gray-500" />
      )}

          <Button
      onClick={handleSignOut}
      className="bg-red-500 hover:bg-red-600 text-white"
    >
      Sign Out
    </Button>
    </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="col-span-3">
            <div
              className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}
            >
              {activeTab === "templates" ? (
                <div className="space-y-4">
                  <h2
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Saved Templates
                  </h2>
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                      } cursor-pointer transition-colors`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h3
                        className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {template.name}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
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
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      value={searchTerm}
                    />
                  </div>
                  {apps
                    .filter((app) =>
                      app.name.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((app) => (
                      <div
                        key={app.id}
                        className={`p-4 rounded-lg border ${
                          darkMode
                            ? "border-gray-700 hover:border-gray-600"
                            : "border-gray-200 hover:border-gray-300"
                        } cursor-pointer transition-colors`}
                        draggable
                        onDragStart={() => handleDragStart(app)}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: app.color }}
                          >
                            <app.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3
                              className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                            >
                              {app.name}
                            </h3>
                            <p
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            >
                              {app.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div
            className={`col-span-9 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} shadow`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {droppedApps.length === 0 ? (
              <div
                className={`h-full flex flex-col items-center justify-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                <Plus className="w-12 h-12 mb-4" />
                <p className="text-lg">
                  Drag and drop apps here to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {droppedApps.map((app, index) => (
                  <div
                    key={app.id}
                    className={`p-6 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: app.color }}
                        >
                          <app.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3
                          className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {app.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeApp(app.id)}
                        className={`p-1 rounded-lg hover:bg-gray-200 ${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"}`}
                      >
                        <X
                          className={
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }
                        />
                      </button>
                    </div>
                    {renderAppOptions(app)}
                    {index < droppedApps.length - 1 && (
                      <div className="flex justify-center my-4">
                        <ArrowRight
                          className={`w-6 h-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSubmit}
                  disabled={!isValidConfiguration()}
                  className={`w-full py-3 rounded-lg ${!isValidConfiguration() ? "bg-gray-400 cursor-not-allowed" : darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white font-medium transition-colors`}
                >
                  Process Integration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedInterface;
