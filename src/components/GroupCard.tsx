import Link from 'next/link'
import { Group } from '@/types/database'
import GroupIcon from './GroupIcon'

interface GroupCardProps {
  group: Group
  memberCount?: number
}

export default function GroupCard({ group, memberCount = 0 }: GroupCardProps) {
  return (
    <Link href={`/dashboard/groups/${group.id}`}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-800 transition-all p-6 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                {group.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <GroupIcon
              iconType={group.icon_type}
              iconValue={group.icon_value}
              size="md"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

