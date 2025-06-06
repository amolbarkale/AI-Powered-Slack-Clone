import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    phone: ''
  });
  const [avatar, setAvatar] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('formData:', formData)
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting signup process...');
      
      // Simple signup with our new function
      const result = await signUp(
        formData.email,
        formData.password,
        { fullName: formData.name }
      );
      
      console.log('Signup result:', result);
      
      if (result.success) {
        toast({
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
        });
      } else {
        toast({
          title: 'Sign up failed',
          description: result.error || 'Failed to create account. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password *
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio (optional)
          </label>
          <Input
            id="bio"
            name="bio"
            type="text"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone (optional)
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#3C1042]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
