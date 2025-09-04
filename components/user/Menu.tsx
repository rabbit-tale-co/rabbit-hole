'use client'

import * as React from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { SettingsDialog } from '@/components/settings/Dialog'
import { OutlineCarrot, OutlineCrown, OutlineLogout, OutlineSettings, OutlineUser } from '../icons/Icons'
import { Badge } from '@/components/ui/badge'
import { PremiumBadge } from './PremiumBadge'

export function UserProfileMenu() {
  const { user: auth_user, profile: user, signOut } = useAuth()
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  if (!auth_user || !user) {
    return null
  }

  const items: Array<
    | { href: string; label: string; icon?: React.ElementType; onClick?: undefined }
    | { href?: undefined; label: string; icon?: React.ElementType; onClick: () => void }
  > = [
      { href: `/user/${user.username}`, label: 'Profile', icon: OutlineUser },
      { href: '/golden-carrot', label: 'Upgrade', icon: OutlineCarrot },
      { href: '/support', label: 'Support us', icon: OutlineCrown },
      { label: 'Settings', icon: OutlineSettings, onClick: () => setSettingsOpen(true) },
    ]



  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <UserAvatar
              username={user.username}
              avatarUrl={user.avatar_url || undefined}
              size="sm"
              accentHex={user.accent_color || undefined}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none flex items-center gap-1">
                  {user.display_name || user.username}
                  <PremiumBadge show={user.is_premium} />
                </p>
                <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item, idx) => (
            item.href ? (
              <Link href={item.href} key={item.href}>
                <DropdownMenuItem>
                  {item.icon && <item.icon />}
                  <span>{item.label}</span>
                  {item.label === 'Upgrade' && (
                    <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200 text-[10px]">-42%</Badge>
                  )}
                </DropdownMenuItem>
              </Link>
            ) : (
              <DropdownMenuItem key={`action-${idx}`} onClick={item.onClick}>
                {item.icon && <item.icon />}
                <span>{item.label}</span>
                {item.label === 'Upgrade' && (
                  <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200 px-2 py-0.5 text-[10px] font-semibold">-42%</Badge>
                )}
              </DropdownMenuItem>
            )
          ))}
          {/* Settings entry is provided in links */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSignOut()}>
            <OutlineLogout />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
