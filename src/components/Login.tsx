import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.name}!`,
        });
        onLogin(data.user);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Logo above the login box */}
      <div className="absolute top-12 left-0 right-0 flex justify-center z-10">
        <img src="/hdfc_logo.svg" alt="HDFC Logo" className="object-contain" style={{ width: '260px', maxWidth: '80%', maxHeight: '80%', background: '#fff' }} />
      </div>
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
            Login
          </CardTitle>
          <p className="text-blue-200">Enter your credentials to access the dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Demo Credentials */}
          {/*
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Available Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-300">
              <div><strong>Super Admin:</strong> superadmin / admin123</div>
              <div><strong>Team Member:</strong> nilesh / nilesh123</div>
              <div><strong>Team Leader:</strong> vibha / vibha123</div>
              <div><strong>Group Team Leader:</strong> narendra / narendra123</div>
              <div><strong>Group Head:</strong> anjani / anjani123</div>
              <div><strong>Leader of Group Head:</strong> ramesh / ramesh123</div>
              <div><strong>Managing Director:</strong> sashi / sashi123</div>
            </div>
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 