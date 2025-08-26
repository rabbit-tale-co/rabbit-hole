"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function Privacy() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to everyone
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Email</Label>
              <p className="text-sm text-muted-foreground">
                Display your email on your profile
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Messages</Label>
              <p className="text-sm text-muted-foreground">
                Let other users send you messages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Content Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Post Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Who can see your posts
              </p>
            </div>
            <select className="px-3 py-2 border rounded-md">
              <option>Everyone</option>
              <option>Followers only</option>
              <option>Private</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
