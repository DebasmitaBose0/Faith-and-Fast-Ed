import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Inbox, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import axiosInstance from "@/api";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/ticket/all");
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResponseChange = (id, val) => {
    setResponses({ ...responses, [id]: val });
  };

  const handleUpdate = async (ticketId, status) => {
    const responseText = responses[ticketId];
    try {
      const { data } = await axiosInstance.put(`/api/ticket/update/${ticketId}`, {
        status,
        ...(responseText !== undefined && { response: responseText }),
      });
      if (data.success) {
        toast.success("Ticket updated successfully!");
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ticket");
    }
  };

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-gray-100 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="text-yellow-500" /> Support Ticket Center
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review, assign status, and answer user submitted tickets.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl text-gray-500 border border-gray-100">
          No support tickets open.
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-md text-xs font-semibold">
                      Category: {t.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.status === "Resolved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : t.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-2">{t.subject}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted by: {t.userId?.name || "Unknown"} ({t.userId?.email || ""}) •{" "}
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                  Update Official Response
                </label>
                <textarea
                  value={responses[t._id] ?? t.response}
                  onChange={(e) => handleResponseChange(t._id, e.target.value)}
                  placeholder="Type official response here..."
                  rows={2}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleUpdate(t._id, "In Progress")}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition"
                >
                  Set In Progress
                </button>
                <button
                  onClick={() => handleUpdate(t._id, "Resolved")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xs transition"
                >
                  Resolve & Save Answer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
