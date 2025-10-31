import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white">
                Split Expenses
                <span className="block text-indigo-400">Share Fairly</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto">
                Track shared expenses with friends and family. Settle up easily and fairly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/auth/sign-up"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/auth/sign-in"
                className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Expenses</h3>
              <p className="text-gray-400">
                Keep track of shared expenses with groups and individuals
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Split Smart</h3>
              <p className="text-gray-400">
                Automatically calculate who owes what and to whom
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">Settle Up</h3>
              <p className="text-gray-400">
                Mark payments as complete and keep everyone in sync
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
