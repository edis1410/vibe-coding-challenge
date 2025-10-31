import Image from 'next/image'

interface MemberAvatarProps {
  email: string
  avatarUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function MemberAvatar({ email, avatarUrl, firstName, lastName, size = 'md' }: MemberAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  if (avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-indigo-200`}>
        <Image
          src={avatarUrl}
          alt={email}
          width={size === 'sm' ? 32 : size === 'lg' ? 48 : 40}
          height={size === 'sm' ? 32 : size === 'lg' ? 48 : 40}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} bg-indigo-100 rounded-full flex items-center justify-center`}>
      <span className="font-medium text-indigo-700">{getInitials()}</span>
    </div>
  )
}

