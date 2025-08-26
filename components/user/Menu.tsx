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
import { LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { SettingsDialog } from '@/components/settings/Dialog'

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
      { href: `/user/${user.username}`, label: 'Profile', icon: User },
      { label: 'Settings', icon: Settings, onClick: () => setSettingsOpen(true) },
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
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {auth_user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item, idx) => (
            item.href ? (
              <Link href={item.href} key={item.href}>
                <DropdownMenuItem>
                  {item.icon && <item.icon className="mr-2 size-4" />}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              </Link>
            ) : (
              <DropdownMenuItem key={`action-${idx}`} onClick={item.onClick}>
                {item.icon && <item.icon className="mr-2 size-4" />}
                <span>{item.label}</span>
              </DropdownMenuItem>
            )
          ))}
          {/* Settings entry is provided in links */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSignOut()}>
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
