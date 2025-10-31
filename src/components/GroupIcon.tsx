import Image from 'next/image'

interface GroupIconProps {
  iconType: 'emoji' | 'image'
  iconValue: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function GroupIcon({ iconType, iconValue, size = 'md' }: GroupIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-3xl',
    lg: 'w-16 h-16 text-4xl',
    xl: 'w-24 h-24 text-6xl',
  }

  const containerClass = `${sizeClasses[size]} bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0`

  if (iconType === 'image' && iconValue.startsWith('http')) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-indigo-200 flex-shrink-0`}>
        <Image
          src={iconValue}
          alt="Group icon"
          width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <span>{iconValue || '💰'}</span>
    </div>
  )
}


