import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { HelpCircle, Check, MessageSquare, Send } from "lucide-react";
import axiosInstance from "@/api";

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/faq/pending");
      if (data.success) {
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load pending questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleAnswerChange = (id, val) => {
    setAnswers({ ...answers, [id]: val });
  };

  const handleAnswerSubmit = async (faqId) => {
    const answerText = answers[faqId]?.trim();
    if (!answerText) {
      toast.error("Please enter an answer.");
      return;
    }
    try {
      const { data } = await axiosInstance.put(`/api/faq/answer/${faqId}`, {
        answer: answerText,
      });
      if (data.success) {
        toast.success("Answered and published successfully!");
        setAnswers({ ...answers, [faqId]: "" });
        fetchFaqs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit answer");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="text-yellow-500" /> FAQ Moderation Board
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Answer user questions to publish them publicly on the single product page.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading pending questions...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-500">
          No questions pending moderation.
        </div>
      ) : (
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-md text-xs font-semibold">
                    Product: {faq.productId?.name || "Unknown Product"}
                  </span>
                  <h3 className="text-lg font-bold mt-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-400 shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Asked by: {faq.userId?.name || "Anonymous"} ({faq.userId?.email || ""}) •{" "}
                    {new Date(faq.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={answers[faq._id] ?? ""}
                  onChange={(e) => handleAnswerChange(faq._id, e.target.value)}
                  placeholder="Type your official answer here..."
                  className="flex-1 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
                <button
                  onClick={() => handleAnswerSubmit(faq._id)}
                  className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl shadow-md hover:opacity-90 flex items-center gap-1.5 text-sm font-semibold transition"
                >
                  <Send className="h-4 w-4" /> Publish Answer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
