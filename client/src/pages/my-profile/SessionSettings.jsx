import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Laptop, Trash2, ShieldAlert } from "lucide-react";
import axiosInstance from "@/api";

const SessionSettings = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/session/active");
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load active sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    try {
      const { data } = await axiosInstance.delete(`/api/session/revoke/${sessionId}`);
      if (data.success) {
        toast.success("Session revoked successfully");
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke session");
    }
  };

  const handleRevokeOthers = async () => {
    try {
      const { data } = await axiosInstance.delete("/api/session/revoke-others");
      if (data.success) {
        toast.success("All other sessions revoked successfully");
        fetchSessions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke other sessions");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldAlert className="text-yellow-500" /> Active Sessions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View and manage devices currently logged into your account.
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeOthers}
            className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-sm font-semibold transition-colors duration-200"
          >
            Revoke All Others
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-gray-500 dark:text-gray-400">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No active sessions found.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {sessions.map((session) => (
            <div key={session._id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
                  <Laptop className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {session.userAgent || "Unknown Device"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    IP: {session.ipAddress} • Last active: {new Date(session.lastActiveAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(session._id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg transition-colors duration-150"
                title="Revoke session"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionSettings;
