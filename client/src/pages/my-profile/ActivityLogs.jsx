import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ListFilter, Clock, Shield } from "lucide-react";
import axiosInstance from "@/api";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/audit/logs");
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Shield className="text-blue-500" /> Security Activity Logs
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Recent sign-ins, password updates, and transaction attempts on your account.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-gray-500 dark:text-gray-400">
          Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          No activities logged yet.
        </div>
      ) : (
        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 space-y-6">
          {logs.map((log) => (
            <div key={log._id} className="relative pl-6">
              <span className="absolute -left-[6px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-800" />
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {log.action}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <span>IP: {log.ipAddress}</span>
                  <span className="truncate max-w-[200px]" title={log.userAgent}>
                    Agent: {log.userAgent}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
