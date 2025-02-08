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
} from "lucide-react";
import axios from "axios"; // Import axios for making HTTP requests
import { toast } from "sonner"; // Import toast from sonner

const DragDropInterface = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedApp, setDraggedApp] = useState(null);
  const [droppedApps, setDroppedApps] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [selectedFile, setSelectedFile] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state

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
      name: "Google Sheets",
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

  const handleOptionChange = (appId, option) => {
    if (appId === 2) {
      setSelectedOptions({
        ...selectedOptions,
        [appId]: { [option]: true },
      });
      return;
    }

    setSelectedOptions({
      ...selectedOptions,
      [appId]: {
        ...selectedOptions[appId],
        [option]: !selectedOptions[appId]?.[option],
      },
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
    if (draggedApp && !droppedApps.find((app) => app.id === draggedApp.id)) {
      setDroppedApps([...droppedApps, draggedApp]);
    }
    setDraggedApp(null);
  };

  const removeApp = (appId) => {
    setDroppedApps(droppedApps.filter((app) => app.id !== appId));
    setSelectedOptions({ ...selectedOptions, [appId]: {} });
    setCredentials({ ...credentials, [appId]: {} });
    setSelectedFile({ ...selectedFile, [appId]: null });
  };

  const handleSubmit = async () => {
    setLoading(true); // Start loading when submission begins

    try {
      console.log("Processing apps with the following data:");
      console.log("Dropped Apps:", droppedApps);
      console.log("Selected Options:", selectedOptions);
      console.log("Credentials:", credentials);
      console.log("Selected Files:", selectedFile);

      for (const app of droppedApps) {
        const options = selectedOptions[app.id] || {};

        switch (app.name) {
          case "Gmail":
            if (options.loadMails) {
              try {
                const response = await axios.get(
                  "http://localhost:5000/api/emails"
                );
                console.log("Emails loaded:", response.data);
                toast.success(`Successfully loaded emails from Gmail`);
              } catch (error) {
                console.error("Error loading emails:", error);
                toast.error(`Failed to load emails: ${error.message}`);
              }
            }
            if (options.tasks) {
              try {
                const response = await axios.get(
                  "http://localhost:5000/api/send_tasks_notion"
                );
                console.log("Tasks loaded:", response.data);
                toast.success(`Successfully processed tasks from Gmail`);
              } catch (error) {
                console.error("Error loading tasks:", error);
                toast.error(`Failed to process tasks: ${error.message}`);
              }
            }
            if (options.attachments) {
              try {
                const response = await axios.get(
                  "http://localhost:5000/api/attachments"
                );
                console.log("Attachments loaded:", response.data);
                toast.success(`Successfully processed attachments from Gmail`);
              } catch (error) {
                console.error("Error loading attachments:", error);
                toast.error(`Failed to process attachments: ${error.message}`);
              }
            }
            break;

          default:
            console.log(`No integration defined for ${app.name}`);
            toast.warning(`Integration not implemented for ${app.name}`);
        }
      }

      toast.success("All integrations completed successfully!");
    } catch (error) {
      console.error("Error during integration:", error);
      toast.error("Integration failed. Please try again.");
    } finally {
      setLoading(false); // End loading when all operations are complete
    }
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
            {["loadMails", "tasks", "attachments"].map((option) => (
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
        return (
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Gmail ID"
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
          </div>
        );

      case "Google Sheets":
        const prevApp =
          droppedApps[droppedApps.findIndex((a) => a.id === app.id) - 1];
        return prevApp ? (
          <div
            className={`p-3 rounded ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Data from {prevApp.name} will be stored in Sheets
            </p>
          </div>
        ) : null;

      case "Notion":
        const previousApp =
          droppedApps[droppedApps.findIndex((a) => a.id === app.id) - 1];
        return previousApp ? (
          <div
            className={`p-3 rounded ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Data from {previousApp.name} will be stored in Notion
            </p>
          </div>
        ) : (
          <div
            className={`p-3 rounded ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Today's Target
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen p-8 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="flex flex-col items-center">
            <div className="loader mb-4"></div>
            <p className="text-white">Processing integrations...</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Integration Hub
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Apps Panel */}
          <div className="col-span-3">
            <div
              className={`p-4 rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow`}
            >
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div className="space-y-3">
                {apps
                  .filter((app) =>
                    app.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => handleDragStart(app)}
                      className={`p-3 rounded-lg border ${
                        darkMode
                          ? "border-gray-700 bg-gray-800 cursor-move"
                          : "border-gray-200 bg-white cursor-move hover:shadow"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <app.icon
                          className="h-6 w-6"
                          style={{ color: app.color }}
                        />
                        <div>
                          <h3
                            className={
                              darkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            {app.name}
                          </h3>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {app.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Integration Canvas */}
          <div className="col-span-9">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`min-h-[600px] rounded-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              } shadow p-6`}
            >
              {droppedApps.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles
                      className={`h-12 w-12 mx-auto mb-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      Drag and drop apps here to start integration
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {droppedApps.map((app) => (
                    <div
                      key={app.id}
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-3">
                          <app.icon
                            className="h-6 w-6"
                            style={{ color: app.color }}
                          />
                          <h3
                            className={
                              darkMode ? "text-white" : "text-gray-900"
                            }
                          >
                            {app.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeApp(app.id)}
                          className={`p-1 rounded-full ${
                            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          }`}
                        >
                          <X
                            className={`h-5 w-5 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          />
                        </button>
                      </div>
                      {renderAppOptions(app)}
                    </div>
                  ))}

                  {/* Submit Button */}
                  {droppedApps.length > 0 && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSubmit}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          darkMode
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {loading ? "Processing..." : "Process Integration"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropInterface;
