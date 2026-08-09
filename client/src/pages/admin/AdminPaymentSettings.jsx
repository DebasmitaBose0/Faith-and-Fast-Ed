import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { QrCode, Save, Upload } from 'lucide-react';
import {
  getPaymentSettings,
  updatePaymentSettings,
} from '@/store/extra-slice/paymentSettingsSlice';

const AdminPaymentSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.paymentSettings);

  const [upiId, setUpiId] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');

  useEffect(() => {
    dispatch(getPaymentSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setUpiId(settings.upiId || '');
      setQrPreview(settings.qrCode?.url || '');
    }
  }, [settings]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for the QR code.');
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!upiId.trim() && !qrFile && !settings?.qrCode?.url) {
      toast.error('Add a UPI ID or upload a QR code first.');
      return;
    }
    try {
      await dispatch(
        updatePaymentSettings({ upiId: upiId.trim(), qrCode: qrFile })
      ).unwrap();
      setQrFile(null);
      toast.success('Payment settings saved successfully!');
    } catch (err) {
      toast.error(
        (typeof err === 'object' ? err?.message : err) ||
          'Failed to save payment settings'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <QrCode className="w-6 h-6 text-yellow-500 dark:text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Payment Settings
          </h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure the UPI ID and QR code that customers see when they choose
          Online Payment (UPI) at checkout.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourbusiness@upi"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              UPI QR Code
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-40 h-40 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 overflow-hidden">
                {qrPreview ? (
                  <img
                    src={qrPreview}
                    alt="UPI QR code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">
                    No QR uploaded yet
                  </span>
                )}
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition">
                <Upload className="w-4 h-4" />
                {qrFile ? 'Change QR image' : 'Upload QR image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-red-600 dark:to-red-700 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPaymentSettings;
