import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Briefcase, Droplets } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Check your email for verification link!');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* No Water Drop or Glow Effects */}
      <Card className="
        w-full 
        max-w-md 
        shadow-2xl 
        border 
        border-border
        bg-card
        relative
        overflow-hidden
        animate-fade-in
      ">
        {/* Remove all corner glow span elements and floating visuals */}

        <CardHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="
              w-16 h-16 
              border-2 border-primary/30
              rounded-2xl 
              flex items-center justify-center
              shadow-lg
              backdrop-blur
              bg-gradient-to-br from-primary/10 to-secondary/10
            ">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-lg">
            JobFlow
          </CardTitle>
          <CardDescription className="text-white/80 font-medium">
            Work Order Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="
              grid w-full grid-cols-2 
              border border-white/20
              bg-card
              backdrop-blur
              p-1
            ">
              <TabsTrigger 
                value="signin"
                className="
                  data-[state=active]:bg-primary/30 
                  data-[state=active]:text-white
                  data-[state=active]:shadow-lg
                  text-white/80
                  transition-all
                  rounded-lg
                "
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="
                  data-[state=active]:bg-secondary/30 
                  data-[state=active]:text-white
                  data-[state=active]:shadow-lg
                  text-white/80
                  transition-all
                  rounded-lg
                "
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white/90 font-medium">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="
                      border-border
                      bg-card
                      text-white
                      placeholder:text-white/50
                      focus:border-primary/50
                      focus:ring-primary/30
                      backdrop-blur
                    "
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white/90 font-medium">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="
                      border-border
                      bg-card
                      text-white
                      placeholder:text-white/50
                      focus:border-primary/50
                      focus:ring-primary/30
                      backdrop-blur
                    "
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="
                    w-full 
                    bg-gradient-to-r from-primary/80 to-primary/60
                    hover:from-primary hover:to-primary/80
                    border-primary/30
                    text-white
                    shadow-xl
                    backdrop-blur
                    transition-all
                    hover:scale-105
                    active:scale-95
                  "
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-white/90 font-medium">Full Name</Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="
                      border-border
                      bg-card
                      text-white
                      placeholder:text-white/50
                      focus:border-secondary/50
                      focus:ring-secondary/30
                      backdrop-blur
                    "
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white/90 font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="
                      border-border
                      bg-card
                      text-white
                      placeholder:text-white/50
                      focus:border-secondary/50
                      focus:ring-secondary/30
                      backdrop-blur
                    "
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white/90 font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className="
                      border-border
                      bg-card
                      text-white
                      placeholder:text-white/50
                      focus:border-secondary/50
                      focus:ring-secondary/30
                      backdrop-blur
                    "
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <AlertDescription className="text-green-200">{message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="
                    w-full 
                    bg-gradient-to-r from-secondary/80 to-secondary/60
                    hover:from-secondary hover:to-secondary/80
                    border-secondary/30
                    text-white
                    shadow-xl
                    backdrop-blur
                    transition-all
                    hover:scale-105
                    active:scale-95
                  "
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
