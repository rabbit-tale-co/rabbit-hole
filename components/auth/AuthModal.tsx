"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutlineClose } from "../icons/Icons";
import ForgotForm from "./ForgotForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type AuthTab = "login" | "register";

export function AuthModal({ defaultTab = "login" }: { defaultTab?: AuthTab }) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<AuthTab>(defaultTab);
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const AuthContent = () => (
    <div className="grid min-h-[420px] md:grid-cols-[320px_minmax(0,1fr)]">
      {/* Left panel — minimal, monochrome (hidden on mobile) */}
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
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">Social Art</h3>
            <p className="text-xs opacity-80">
              Sign in to share your work and follow creators.
            </p>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <section className="max-h-[80vh] overflow-y-auto p-4">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as AuthTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-3">
            <LoginForm
              onSuccess={() => setOpen(false)}
              onForgot={() => setForgotOpen(true)}
            />
          </TabsContent>
          <TabsContent value="register" className="mt-3">
            <RegisterForm />
          </TabsContent>
        </Tabs>

        <p className="mt-3 text-[10px] text-muted-foreground">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" target="_blank" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" target="_blank" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="sm" className="rounded-full">
              Sign in
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="text-center">
              <DrawerTitle>Welcome</DrawerTitle>
              <DrawerClose asChild className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" aria-label="Close">
                  <OutlineClose className="size-4" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <AuthContent />
            </div>
          </DrawerContent>
        </Drawer>

        {/* Mobile forgot password drawer */}
        <Drawer open={forgotOpen} onOpenChange={setForgotOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="text-center">
              <DrawerTitle>Reset your password</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <ForgotForm
                onSent={() => {
                  setForgotOpen(false);
                  setTab("login");
                  setOpen(true);
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="rounded-full">
            Sign in
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 overflow-hidden sm:max-w-[720px] md:max-w-2xl">
          <DialogHeader className="mb-6 p-4 pb-0">
            <DialogTitle className="text-base">Welcome</DialogTitle>
            <DialogClose asChild className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" aria-label="Close">
                <OutlineClose className="size-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <AuthContent />
        </DialogContent>
      </Dialog>

      {/* Desktop forgot password dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="p-4 sm:max-w-[480px]">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base">Reset your password</DialogTitle>
          </DialogHeader>
          <ForgotForm
            onSent={() => {
              setForgotOpen(false);
              setTab("login");
              setOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
