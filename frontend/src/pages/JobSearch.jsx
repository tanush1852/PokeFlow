import { useState } from "react";

const JobSearch = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [sheetLink, setSheetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const webAppUrl = "https://script.google.com/home/projects/1CB8wk4WPMXwS0L-8LscPCmYo7XMF_3kxEnOsBjvOMl35YomfXUx0m8NI"; // Replace this with your Web App URL

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, location }),
    });

    const text = await response.text();
    setMessage(text);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Find Jobs & Save to Google Sheets</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Job Title (e.g., Frontend Developer)"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          required
          className="w-full text-white px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Location (e.g., New York)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full text-white px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Google Sheet Link (Not needed, for reference)"
          value={sheetLink}
          onChange={(e) => setSheetLink(e.target.value)}
          className="w-full px-4 text-white py-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          {loading ? "Searching..." : "Search & Save"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </div>
  );
};

export default JobSearch;
