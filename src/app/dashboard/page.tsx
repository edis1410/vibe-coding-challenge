import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TopNav from '@/components/TopNav'
import GroupCard from '@/components/GroupCard'
import { getGroups } from '@/app/actions/groups'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const groups = await getGroups()

  const groupsWithMembers = await Promise.all(
    (groups as { id: string; name: string; description: string | null; created_by: string; created_at: string; invite_code: string; currency: string; icon_type: 'emoji' | 'image'; icon_value: string }[]).map(async (group) => {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
      
      return {
        ...group,
        memberCount: count || 0,
      }
    })
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Your Groups</h2>
            <p className="text-gray-400 mt-1">Manage your expense groups</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/join"
              className="px-6 py-3 bg-gray-800 text-indigo-400 border-2 border-gray-700 rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              🔗 Join Group
            </Link>
            <Link
              href="/dashboard/groups/new"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              + Create Group
            </Link>
          </div>
        </div>

        {groupsWithMembers.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-white mb-2">No groups yet</h3>
            <p className="text-gray-400 mb-6">
              Create a new group or join an existing one to start tracking expenses
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/join"
                className="px-6 py-3 bg-gray-800 text-indigo-400 border-2 border-gray-700 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                🔗 Join with Code
              </Link>
              <Link
                href="/dashboard/groups/new"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                + Create New Group
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsWithMembers.map((group: { id: string; name: string; description: string | null; created_by: string; created_at: string; invite_code: string; currency: string; icon_type: 'emoji' | 'image'; icon_value: string; memberCount: number }) => (
              <GroupCard key={group.id} group={group} memberCount={group.memberCount} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


