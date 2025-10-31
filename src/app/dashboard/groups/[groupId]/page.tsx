import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getGroup, getGroupMembers } from '@/app/actions/groups'
import { getGroupExpenses } from '@/app/actions/expenses'
import { getGroupSettlements } from '@/app/actions/settlements'
import { calculateBalances } from '@/app/actions/balances'
import TopNav from '@/components/TopNav'
import ExpenseCard from '@/components/ExpenseCard'
import SettlementCard from '@/components/SettlementCard'
import BalanceCard from '@/components/BalanceCard'
import InviteCodeButton from '@/components/InviteCodeButton'
import MembersModal from '@/components/MembersModal'
import GroupIcon from '@/components/GroupIcon'
import GroupPageClient from '@/components/GroupPageClient'
import { formatCurrency } from '@/lib/calculations'

export default async function GroupDetail({ params }: { params: { groupId: string } }) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { groupId } = await params

  try {
    const [group, members, expenses, { balances, simplifiedDebts }, settlements] = await Promise.all([
      getGroup(groupId),
      getGroupMembers(groupId),
      getGroupExpenses(groupId),
      calculateBalances(groupId),
      getGroupSettlements(groupId),
    ])

    const memberEmails: Record<string, string> = {}
    const memberNames: Record<string, string> = {}
    members.forEach((member: {user_id: string; email: string; first_name?: string | null; last_name?: string | null}) => {
      memberEmails[member.user_id] = member.email
      const displayName = member.first_name && member.last_name
        ? `${member.first_name} ${member.last_name}`
        : member.first_name || member.email
      memberNames[member.user_id] = displayName
    })

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

    const timeline = [
      ...expenses.map(e => ({
        type: 'expense' as const,
        date: e.expense_date || e.created_at,
        data: e,
      })),
      ...settlements.map(s => ({
        type: 'settlement' as const,
        date: s.settled_at,
        data: s,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
      <div className="min-h-screen bg-gray-950">
        <TopNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
              ← Back to Groups
            </Link>
          </div>

          <GroupPageClient
            group={group}
            members={members}
            timeline={timeline}
            balances={balances}
            simplifiedDebts={simplifiedDebts}
            expenses={expenses}
            groupId={groupId}
            currentUserId={user.id}
            memberNames={memberNames}
            totalExpenses={totalExpenses}
          />
        </main>
      </div>
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Group not found'
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{errorMessage}</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
}

