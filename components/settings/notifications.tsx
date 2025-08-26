"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export function Notifications() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Push Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New Followers</Label>
              <p className="text-sm text-muted-foreground">
                When someone follows you
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Likes & Comments</Label>
              <p className="text-sm text-muted-foreground">
                When someone likes or comments on your posts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Reposts</Label>
              <p className="text-sm text-muted-foreground">
                When someone reposts your content
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Messages</Label>
              <p className="text-sm text-muted-foreground">
                When you receive new messages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Summary of your weekly activity
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  )
}
