import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Database,
  CheckCircle,
  Play,
} from 'lucide-react';
import axiosInstance from '@/api';

const AdminBackup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/backup/list');
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to fetch backups list'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleTriggerBackup = async () => {
    try {
      setTriggering(true);
      const { data } = await axiosInstance.post('/api/backup/trigger');
      if (data.success) {
        toast.success('Database backup generated successfully!');
        fetchBackups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger backup');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="text-yellow-500" /> Database Backup Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate and manage backups of users, products, and order
            collections.
          </p>
        </div>
        <button
          onClick={handleTriggerBackup}
          disabled={triggering}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-red-600 dark:to-red-700 text-white font-semibold rounded-xl shadow-md hover:opacity-90 disabled:opacity-60 transition-all duration-200 text-sm"
        >
          <Play className="h-4 w-4 fill-white" />
          {triggering ? 'Creating Backup...' : 'Trigger Backup Now'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold">Backup History Log</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading backup files history...
          </div>
        ) : backups.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No database backups have been generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4">Backup Name</th>
                  <th className="p-4">Collections</th>
                  <th className="p-4">Triggered By</th>
                  <th className="p-4">File Size</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {backups.map((bk) => (
                  <tr
                    key={bk._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="p-4 font-mono font-medium text-gray-800 dark:text-gray-200">
                      {bk.backupName}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-md text-xs font-semibold mr-1">
                        {bk.collectionsBackedUp?.join(', ') || 'All'}
                      </span>
                    </td>
                    <td className="p-4">{bk.triggeredBy?.name || 'System'}</td>
                    <td className="p-4">{bk.fileSizeKb} KB</td>
                    <td className="p-4">
                      {new Date(bk.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                        <CheckCircle className="h-4 w-4" /> SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBackup;
