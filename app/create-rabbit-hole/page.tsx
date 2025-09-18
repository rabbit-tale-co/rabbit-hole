"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Center from "@/components/Center";

export default function CreateRabbitHolePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    description: "",
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/rabbit-holes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/rabbitholes/${formData.name}`);
      } else {
        alert(data.error || "Failed to create rabbit hole");
      }
    } catch (error) {
      console.error("Error creating rabbit hole:", error);
      alert("Failed to create rabbit hole");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Center>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-4">
            You need to be logged in to create a rabbit hole.
          </p>
          <Button onClick={() => router.push("/auth/confirm")}>
            Log In
          </Button>
        </div>
      </Center>
    );
  }

  return (
    <Center>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Rabbit Hole</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name (URL)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="my-rabbit-hole"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="My Rabbit Hole"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your rabbit hole..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_public: !!checked })
              }
            />
            <Label htmlFor="is_public">Public rabbit hole</Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Rabbit Hole"}
          </Button>
        </form>
      </div>
    </Center>
  );
}
