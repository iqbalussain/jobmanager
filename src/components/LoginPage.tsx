
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Briefcase, Droplets } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeContext';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
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

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Water Drop Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-32 right-20 w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}></div>
      </div>

      {/* Main Glass Card with Corner Glow Animation */}
      <Card className={`
        w-full 
        max-w-md 
        shadow-2xl 
        border-2 
        relative
        overflow-hidden
        animate-fade-in
        ${isDark 
          ? 'border-white/20 backdrop-blur-xl bg-white/5 glass-gaming-strong neon-trace-card' 
          : 'border-gray-200 bg-white/95 backdrop-blur-sm'
        }
      `}>
        {/* Corner Glow Animation - only in dark mode */}
        {isDark && (
          <div className="pointer-events-none absolute inset-0 z-20">
            <span className="corner-glow top-0 left-0" />
            <span className="corner-glow top-0 right-0 animation-delay-1" />
            <span className="corner-glow bottom-0 right-0 animation-delay-2" />
            <span className="corner-glow bottom-0 left-0 animation-delay-3" />
          </div>
        )}

        {/* Floating water drops on card */}
        <div className="absolute top-4 right-4 opacity-30">
          <Droplets className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-blue-500'} animate-pulse`} />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20">
          <div className={`w-2 h-2 ${isDark ? 'bg-secondary/50' : 'bg-blue-500/50'} rounded-full animate-ping`}></div>
        </div>

        <CardHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className={`
              w-16 h-16 
              border-2 
              rounded-2xl 
              flex items-center justify-center
              shadow-lg
              ${isDark 
                ? 'glass-gaming border-primary/30 backdrop-blur-md bg-gradient-to-br from-primary/20 to-secondary/20' 
                : 'border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50'
              }
            `}>
              <Briefcase className={`w-8 h-8 ${isDark ? 'text-primary' : 'text-blue-600'} drop-shadow-lg`} />
            </div>
          </div>
          <CardTitle className={`text-3xl font-bold drop-shadow-lg ${
            isDark 
              ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent' 
              : 'text-gray-900'
          }`}>
            JobFlow
          </CardTitle>
          <CardDescription className={`font-medium ${
            isDark ? 'text-white/90' : 'text-gray-600'
          }`}>
            Work Order Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={`
              grid w-full grid-cols-2 
              border p-1
              ${isDark 
                ? 'glass-gaming border-white/20 bg-white/10 backdrop-blur-md' 
                : 'border-gray-200 bg-gray-50'
              }
            `}>
              <TabsTrigger 
                value="signin"
                className={`
                  transition-all rounded-lg
                  ${isDark 
                    ? 'data-[state=active]:bg-primary/30 data-[state=active]:text-white text-white/80' 
                    : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600'
                  }
                  data-[state=active]:shadow-lg
                `}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className={`
                  transition-all rounded-lg
                  ${isDark 
                    ? 'data-[state=active]:bg-secondary/30 data-[state=active]:text-white text-white/80' 
                    : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600'
                  }
                  data-[state=active]:shadow-lg
                `}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className={`
                      ${isDark 
                        ? 'glass-gaming border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-primary/50 focus:ring-primary/30 backdrop-blur-md' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      }
                    `}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className={`
                      ${isDark 
                        ? 'glass-gaming border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-primary/50 focus:ring-primary/30 backdrop-blur-md' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      }
                    `}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className={`${
                    isDark 
                      ? 'glass-gaming border-red-500/30 bg-red-500/10' 
                      : 'border-red-300 bg-red-50'
                  }`}>
                    <AlertDescription className={isDark ? 'text-red-200' : 'text-red-800'}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className={`
                    w-full shadow-xl transition-all hover:scale-105 active:scale-95
                    ${isDark 
                      ? 'glass-gaming bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary hover:to-primary/80 border-primary/30 text-white backdrop-blur-md' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0'
                    }
                  `}
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
                  <Label htmlFor="signup-name" className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className={`
                      ${isDark 
                        ? 'glass-gaming border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-secondary/50 focus:ring-secondary/30 backdrop-blur-md' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                      }
                    `}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className={`
                      ${isDark 
                        ? 'glass-gaming border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-secondary/50 focus:ring-secondary/30 backdrop-blur-md' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                      }
                    `}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    minLength={6}
                    className={`
                      ${isDark 
                        ? 'glass-gaming border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:border-secondary/50 focus:ring-secondary/30 backdrop-blur-md' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                      }
                    `}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className={`${
                    isDark 
                      ? 'glass-gaming border-red-500/30 bg-red-500/10' 
                      : 'border-red-300 bg-red-50'
                  }`}>
                    <AlertDescription className={isDark ? 'text-red-200' : 'text-red-800'}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className={`${
                    isDark 
                      ? 'glass-gaming border-green-500/30 bg-green-500/10' 
                      : 'border-green-300 bg-green-50'
                  }`}>
                    <AlertDescription className={isDark ? 'text-green-200' : 'text-green-800'}>
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className={`
                    w-full shadow-xl transition-all hover:scale-105 active:scale-95
                    ${isDark 
                      ? 'glass-gaming bg-gradient-to-r from-secondary/80 to-secondary/60 hover:from-secondary hover:to-secondary/80 border-secondary/30 text-white backdrop-blur-md' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0'
                    }
                  `}
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
