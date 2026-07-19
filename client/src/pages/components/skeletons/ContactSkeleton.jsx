const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className}`}
  />
);

const ContactSkeleton = () => (
  <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 transition-all duration-300">
    <div className="max-w-6xl mx-auto py-16 px-6">
      <SkeletonBlock className="h-10 w-72 mx-auto mb-4" />
      <SkeletonBlock className="h-6 w-96 mx-auto mb-10" />

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full">
          <SkeletonBlock className="h-7 w-48 mb-6" />
          <div className="space-y-5">
            <SkeletonBlock className="h-6 w-64" />
            <SkeletonBlock className="h-6 w-52" />
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="h-6 w-32" />
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full">
          <SkeletonBlock className="h-7 w-48 mb-6" />
          <div className="space-y-4">
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-12 w-full" />
            <SkeletonBlock className="h-24 w-full" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactSkeleton;
