'use client';

interface PendingActionsProps {
  isRejected: boolean;
  handleLogout: () => Promise<void>;
}

export default function PendingActions({ isRejected, handleLogout }: PendingActionsProps) {
  return (
    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Sign Out
          </button>
        </form>
        {!isRejected && (
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </button>
        )}
      </div>
    </div>
  );
}
