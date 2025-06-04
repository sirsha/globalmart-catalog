"use client";
import { FormEvent, useEffect, useState } from "react";

interface RepairJob {
  id: string;
  title: string;
  customerName: string;
  repairType: string;
  priority: string;
  status: string;
  dateAdded: string;
  estimatedCost?: string;
}

type Props = {};

const RepairShopMain = (props: Props) => {
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    customerName: "",
    repairType: "General Maintenance",
    priority: "Medium",
    estimatedCost: ""
  });
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repairTypes = [
    "Plumbing",
    "Electrical",
    "Appliance Repair",
    "HVAC",
    "General Maintenance",
    "Emergency Repair"
  ];

  const priorities = ["Low", "Medium", "High", "Emergency"];
  const statuses = ["Pending", "In Progress", "Completed", "On Hold"];

  // Fixed API endpoint - removed /v1 from the path
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Fetch repair jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching repairs from:", `${API_BASE_URL}/v1/repairs`);
        
        const res = await fetch(`${API_BASE_URL}/v1/repairs`);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("Fetched data:", data);
        setRepairJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch repair jobs", err);
        setError(err instanceof Error ? err.message : "Failed to fetch repairs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.customerName.trim()) {
      setError("Title and Customer Name are required");
      return;
    }

    const newJob = {
      ...formData,
      status: "Pending",
      dateAdded: new Date().toLocaleDateString(),
      description: formData.title // Map title to description for backend compatibility
    };

    try {
      setIsLoading(true);
      setError(null);
      console.log("Sending repair data:", newJob);

      const res = await fetch(`${API_BASE_URL}/v1/repairs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob)
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const createdJob = await res.json();
      console.log("Created job:", createdJob);
      
      // Refresh the list instead of manually adding to avoid ID issues
      const fetchRes = await fetch(`${API_BASE_URL}/v1/repairs`);
      if (fetchRes.ok) {
        const updatedData = await fetchRes.json();
        setRepairJobs(Array.isArray(updatedData) ? updatedData : []);
      }

      // Reset form
      setFormData({
        title: "",
        customerName: "",
        repairType: "General Maintenance",
        priority: "Medium",
        estimatedCost: ""
      });

    } catch (err) {
      console.error("Failed to add repair job", err);
      setError(err instanceof Error ? err.message : "Failed to add repair");
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = async (id: string, newStatus: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/v1/repairs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const updatedJob = await res.json();
      const updatedJobs = repairJobs.map(job =>
        job.id === id ? updatedJob : job
      );
      setRepairJobs(updatedJobs);
    } catch (err) {
      console.error("Failed to update job status", err);
      setError("Failed to update job status");
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repair job?")) {
      return;
    }

    try {
      setError(null);
      console.log("Deleting job with ID:", id);
      
      const res = await fetch(`${API_BASE_URL}/v1/repairs/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      setRepairJobs(repairJobs.filter(job => job.id !== id));
    } catch (err) {
      console.error("Failed to delete job", err);
      setError("Failed to delete job");
    }
  };

  const filteredJobs = repairJobs.filter(job => {
    const statusMatch = filterStatus === "All" || job.status === filterStatus;
    const priorityMatch = filterPriority === "All" || job.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Emergency": return "bg-red-500 text-white";
      case "High": return "bg-orange-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 border-green-300";
      case "In Progress": return "bg-blue-100 border-blue-300";
      case "On Hold": return "bg-yellow-100 border-yellow-300";
      case "Pending": return "bg-gray-100 border-gray-300";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔧 QuickFix Repair Shop</h1>
        <p className="text-gray-600">Professional Repair Management System</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-blue-600">Loading...</div>
        </div>
      )}

      {/* Add New Repair Job Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Repair Job</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="repair-title" className="block text-sm font-medium text-gray-700 mb-1">
              Repair Description *
            </label>
            <input
              id="repair-title"
              name="title"
              placeholder="e.g., Fix leaking pipe, Replace broken outlet"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              id="customer-name"
              name="customerName"
              placeholder="Customer name"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              required
            />
          </div>

          <div>
            <label htmlFor="repair-type" className="block text-sm font-medium text-gray-700 mb-1">
              Repair Type
            </label>
            <select
              id="repair-type"
              name="repairType"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.repairType}
              onChange={(e) => setFormData({...formData, repairType: e.target.value})}
            >
              {repairTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="estimated-cost" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Cost ($)
            </label>
            <input
              id="estimated-cost"
              name="estimatedCost"
              placeholder="Optional"
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-2 rounded-md font-medium transition-colors"
            >
              {isLoading ? "Adding..." : "Add Repair Job"}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="filter-status"
              name="filterStatus"
              className="border border-gray-300 p-2 rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Priority
            </label>
            <select
              id="filter-priority"
              name="filterPriority"
              className="border border-gray-300 p-2 rounded-md"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredJobs.length} of {repairJobs.length} jobs
            </div>
          </div>
        </div>
      </div>

      {/* Repair Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`p-6 rounded-lg border-2 ${getStatusColor(job.status)} transition-all hover:shadow-md`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 break-words">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div><strong>Customer:</strong> {job.customerName}</div>
                    <div><strong>Type:</strong> {job.repairType}</div>
                    <div><strong>Date Added:</strong> {job.dateAdded}</div>
                    {job.estimatedCost && (
                      <div><strong>Est. Cost:</strong> ${job.estimatedCost}</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="border border-gray-300 p-2 rounded-md text-sm"
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value)}
                    aria-label={`Update status for ${job.title}`}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    aria-label={`Delete repair job: ${job.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-gray-500 text-lg">No repair jobs to display</p>
            <p className="text-gray-400">Add your first repair job above to get started!</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {repairJobs.length > 0 && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statuses.map(status => {
            const count = repairJobs.filter(job => job.status === status).length;
            return (
              <div key={status} className="bg-white p-4 rounded-lg shadow-md text-center">
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RepairShopMain;