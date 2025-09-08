import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API configuration - ensure this matches your backend
  const API_BASE_URL = "http://localhost:5000";
  const API_ENDPOINT = `${API_BASE_URL}/ai/get-review`;

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter code to review!");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      console.log("🚀 Sending request to:", API_ENDPOINT);
      console.log("📝 Code length:", code.length, "characters");

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ prompt: code }),
      });
      
      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("✅ Response data received:", Object.keys(data));
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.review) {
        throw new Error("No review data received from server");
      }
      
      setResult(data.review);
      console.log("🎉 Review displayed successfully");
      
    } catch (err) {
      console.error("❌ API Error:", err);
      const errorMessage = err.message || "An unexpected error occurred";
      
      // Provide specific error messages for common issues
      if (err.message.includes("Failed to fetch")) {
        setError("❌ Connection Error: Cannot connect to backend server. Please ensure the server is running on port 5000.");
      } else if (err.message.includes("500")) {
        setError("❌ Server Error: Backend server encountered an error. Check server logs for details.");
      } else if (err.message.includes("API key")) {
        setError("❌ API Key Error: Invalid or missing Google Gemini API key. Check backend configuration.");
      } else if (err.message.includes("rate limit")) {
        setError("❌ Rate Limit: API quota exceeded. Please try again later.");
      } else {
        setError(`❌ Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setResult("");
    setError("");
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        const data = await response.json();
        setError("✅ Backend connected successfully!");
        setTimeout(() => setError(""), 3000);
      } else {
        setError("❌ Backend health check failed");
      }
    } catch (err) {
      setError("❌ Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">💡 AI Code Reviewer</h1>
      
      {/* Connection Status */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded"
        >
          🔍 Test Connection
        </button>
        <span className="text-sm text-gray-400">
          Backend: {API_BASE_URL}
        </span>
      </div>
      
      <div className="w-full max-w-3xl space-y-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here for AI-powered review..."
          className="w-full h-60 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "🔍 Analyzing..." : "📝 Review Code"}
          </button>
          
          <button
            onClick={handleClear}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-900/20 border border-red-700 p-4 rounded-lg">
            <p className="text-red-300 font-medium">{error}</p>
            <p className="text-red-400 text-sm mt-2">
              💡 Troubleshooting: Check if backend is running on port 5000 and has valid API key
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="w-full bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-green-400">📋 Code Review Results</h3>
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="text-gray-200 mb-3 leading-relaxed" {...props} />
                ),
                code: ({ node, inline, className, children, ...props }) => (
                  inline ? (
                    <code className="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto" {...props}>
                      {children}
                    </code>
                  )
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-semibold text-blue-400 mt-6 mb-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-semibold text-blue-300 mt-4 mb-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside space-y-1 text-gray-200" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-200" {...props} />
                )
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
