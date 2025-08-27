"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotForm from "./ForgotForm";

type AuthTab = "login" | "register";

export function AuthModal({
  defaultTab = "login",
}: {
  defaultTab?: AuthTab;
}) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<AuthTab>(defaultTab);
  const [forgotOpen, setForgotOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">Sign in</Button>
      </DialogTrigger>

      {/* compact width, horizontal split on md+ */}
      <DialogContent className="p-0 overflow-hidden sm:max-w-[720px] md:max-w-2xl">
        <div className="grid min-h-[420px] md:grid-cols-[320px_minmax(0,1fr)]">
          {/* Left panel — minimal, monochrome */}
          <aside className="hidden md:flex flex-col gap-4 bg-muted/40 p-6 relative">
            <Image
              src="https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg"
              alt="Social Art"
              className="absolute rounded-r-lg inset-0 w-full h-full object-cover"
              width={320}
              height={420}
              priority
            />
            <div className="absolute inset-0 bg-black/50 rounded-r-lg" />
            <div className="flex flex-col gap-2 z-10 text-white">
              <Palette className="size-6" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Social Art</h3>
                <p className="text-xs opacity-80">Sign in to share your work and follow creators.</p>
              </div>
            </div>
          </aside>

          {/* Right panel */}
          <section className="max-h-[80vh] overflow-y-auto p-4">
            <DialogHeader className="mb-6 p-0">
              <DialogTitle className="text-base">Welcome</DialogTitle>
              <DialogClose asChild className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(v) => setTab(v as AuthTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-3">
                <LoginForm onSuccess={() => setOpen(false)} onForgot={() => setForgotOpen(true)} />
              </TabsContent>
              <TabsContent value="register" className="mt-3">
                <RegisterForm />
              </TabsContent>
            </Tabs>

            <p className="mt-3 text-[10px] text-muted-foreground">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </section>
        </div>
      </DialogContent>
      {/* Separate forgot password dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="p-4 sm:max-w-[480px]">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base">Reset your password</DialogTitle>
          </DialogHeader>
          <ForgotForm onSent={() => { setForgotOpen(false); setTab("login"); setOpen(true); }} />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
