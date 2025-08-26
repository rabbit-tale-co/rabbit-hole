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
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// import { SettingsDialog } from '@/components/settings-dialog'

export function UserProfileMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  if (!user) {
    return null
  }

  // Use username from user_metadata (now consistent with database)
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  const links = [
    {
      href: `/user/${username}`, label: 'Profile', icon: User
    },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <UserAvatar
              username={username}
              avatarUrl={user.user_metadata?.avatar_url}
              size="sm"
              className="h-8 w-8"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {links.map((link) => (
            <Link href={link.href} key={link.href}>
              <DropdownMenuItem>
                {link.icon && <link.icon className="mr-2 size-4" />}
                <span>{link.label}</span>
              </DropdownMenuItem>
            </Link>
          ))}
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="mr-2 size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSignOut()}>
            <LogOut className="mr-2 size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} /> */}
    </>
  )
}
