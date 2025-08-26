"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function Content() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Content Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-play Videos</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play videos in feed
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Sensitive Content</Label>
              <p className="text-sm text-muted-foreground">
                Display content that may be sensitive
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feed Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Feed Algorithm</Label>
              <p className="text-sm text-muted-foreground">
                How posts are ordered in your feed
              </p>
            </div>
            <select className="px-3 py-2 border rounded-md">
              <option>Latest first</option>
              <option>Most relevant</option>
              <option>Most popular</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
