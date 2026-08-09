import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { LifeBuoy, CheckCircle2, AlertCircle, PlusCircle, MessageCircle } from "lucide-react";
import axiosInstance from "@/api";
import { supportConfig } from "@/config/supportConfig";

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(supportConfig.ticket_categories[0]);
  const [description, setDescription] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/ticket/my-tickets");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const { data } = await axiosInstance.post("/api/ticket/create", {
        subject,
        category,
        description,
      });
      if (data.success) {
        toast.success(data.message);
        setSubject("");
        setDescription("");
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create support ticket");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LifeBuoy className="text-yellow-500" /> Support Help Desk
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Need help with your order or payment? Submit a support ticket and our team will get back to you shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Ticket Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PlusCircle className="text-yellow-500" /> Open a New Ticket
          </h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Double payment for Order #1234"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
            >
              {supportConfig.ticket_categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your issue in detail..."
              rows={4}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            Submit Ticket
          </button>
        </form>

        {/* Existing Tickets List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="text-yellow-500" /> Your Support Tickets
          </h2>

          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-500">
              No tickets submitted yet.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[400px]">
              {tickets.map((t) => (
                <div
                  key={t._id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-2 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-gray-400">Category: {t.category}</span>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">{t.subject}</h3>
                    </div>
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
                  <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2">{t.description}</p>
                  {t.response && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-lg border-l-2 border-yellow-500 mt-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Official Response:</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{t.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;
