'use client';

import { useState, useRef, useContext } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { UnsavedChangesContext } from '@/components/settings/Dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';
import { OutlineImage } from '@/components/icons/Icons';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar: {
    url: string;
    alt?: string;
    size: {
      width: number;
      height: number;
    }
  };
  cover: {
    url: string;
    alt?: string;
    size: {
      width: number;
      height: number;
    }
  };
}

interface EditProfileDialogProps {
  user: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

export function EditProfileDialog({ user, onClose, onProfileUpdated }: EditProfileDialogProps) {
  const { refreshProfile } = useAuth();
  const unsaved = useContext(UnsavedChangesContext);
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'cover' | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show crop interface
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target?.result as string);
      setCropType(type);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage: string) => {
    setIsUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      formData.append('userId', user.id);

      const uploadEndpoint = cropType === 'avatar' ? '/api/upload/avatar' : '/api/upload/cover';
      const response2 = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response2.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response2.json();

      // Update profile
      const updateData = cropType === 'avatar'
        ? { avatar_url: imageUrl }
        : { coverImage: imageUrl };

      // tutaj w nowej architekturze zapis jest poza kontekstem; po sukcesie tylko odswiezamy profil
      await refreshProfile();
      {
        onProfileUpdated({
          ...user,
          ...updateData,
        });
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setShowCrop(false);
      setCropImage(null);
      setCropType(null);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      // placeholder: po usunieciu avatara odswiezamy profil
      await refreshProfile();
      {
        onProfileUpdated({
          ...user,
          avatar: {
            url: '',
            size: {
              width: 0,
              height: 0,
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      alert('Failed to remove avatar. Please try again.');
    }
  };

  const handleRemoveCover = async () => {
    try {
      await refreshProfile();
      {
        onProfileUpdated({
          ...user,
          cover: {
            url: '',
            size: {
              width: 0,
              height: 0,
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to remove cover:', error);
      alert('Failed to remove cover. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (!email.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    try {
      // Create a promise for the profile update
      const updatePromise = (async () => {
        // Update profile data
        const profileUpdates: { username?: string; avatar_url?: string } = { username: username.trim() };

        // Update email if changed
        if (email !== user.email) {
          const { error: emailError } = await supabase.auth.updateUser({ email: email.trim() });
          if (emailError) {
            throw new Error(`Failed to update email: ${emailError.message}`);
          }
        }

        // Update password if provided
        if (password.trim()) {
          const { error: passwordError } = await supabase.auth.updateUser({ password: password.trim() });
          if (passwordError) {
            throw new Error(`Failed to update password: ${passwordError.message}`);
          }
        }

        // Update other profile fields
        // aktualny zapis profilu realizujemy poza tym komponentem; tu tylko refresh
        await refreshProfile();
        return { ok: true } as const;
      })();

      // Show toast with promise
      toast.promise(updatePromise, {
        loading: 'Updating profile...',
        success: () => {
          onProfileUpdated({
            ...user,
            username: username.trim(),
            email: email.trim(),
          });
          unsaved?.markAsSaved?.();
          onClose();
          return 'Profile updated successfully!';
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          return error instanceof Error ? error.message : 'Failed to update profile';
        },
      });

    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Save Button at the top */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleSave}
            disabled={!username.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Information</h3>

            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="size-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  {user.avatar.url ? (
                    <Image
                      src={user.avatar.url}
                      alt={username || 'User'}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-200 flex items-center justify-center text-gray-700 text-2xl font-bold">
                      {(username || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Avatar Actions */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-white shadow-lg border-2 border-gray-200"
                  >
                    <OutlineImage size={14} />
                  </Button>

                  {user.avatar.url && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={handleRemoveAvatar}
                      className="shadow-lg"
                    >
                      <Trash size={14} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Profile Picture</p>
                <p className="text-xs text-gray-500">Upload a new image or remove current one</p>
              </div>
            </div>

            {/* Cover Image Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cover Image</p>
                  <p className="text-xs text-gray-500">Add a cover image to your profile</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <OutlineImage size={16} className="mr-1" />
                    {user.cover.url ? 'Change' : 'Add'}
                  </Button>

                  {user.cover.url && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveCover}
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Cover Preview */}
              <div className="aspect-[3/1] w-full rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                {user.cover.url ? (
                  <Image
                    src={user.cover.url}
                    alt="Cover"
                    width={400}
                    height={133}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <OutlineImage size={24} />
                  </div>
                )}
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'cover')}
              className="hidden"
            />
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'avatar')}
              className="hidden"
            />

            {isUploading && (
              <p className="text-sm text-gray-500 mt-2 text-center">Uploading...</p>
            )}
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password (optional)
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
