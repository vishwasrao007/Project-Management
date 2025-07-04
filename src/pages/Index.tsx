import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, FolderOpen, Menu, X, LogOut } from 'lucide-react';
import TeamMemberDashboard from '@/components/dashboard/TeamMemberDashboard';
import TeamLeaderDashboard from '@/components/dashboard/TeamLeaderDashboard';
import GroupTeamLeaderDashboard from '@/components/dashboard/GroupTeamLeaderDashboard';
import GroupHeadDashboard from '@/components/dashboard/GroupHeadDashboard';
import LeaderDashboard from '@/components/dashboard/LeaderDashboard';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import MemberManagement from '@/components/dashboard/MemberManagement';
import AppSidebar from '@/components/AppSidebar';
import Login from '@/components/Login';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:4000/api';

const HIERARCHY_LEVELS = [
  'Team Member',
  'Team Leader', 
  'Group Team Leader',
  'Group Head',
  'Leader of Group Head',
  'Managing Director'
];

const Index = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const { toast } = useToast();

  // Fetch members from API
  useEffect(() => {
    if (currentUser) {
      fetch(`${API_URL}/members`)
        .then(res => res.json())
        .then(setMembers)
        .catch(err => {
          console.error('Failed to fetch members:', err);
          setMembers([]);
        });
    }
  }, [currentUser]);

  // Derive available roles from members, or show only "Team Leader" if no members
  const availableRoles = members.length === 0
    ? ['Team Leader']
    : Array.from(new Set(members.map(m => m.role)));

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    // Set the user's role as the current role
    const level = HIERARCHY_LEVELS.indexOf(user.role);
    setCurrentUser(prev => ({ ...prev, level }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const renderDashboard = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
      case 'Super Admin':
        return <SuperAdminDashboard />;
      case 'Team Member':
        return <TeamMemberDashboard />;
      case 'Team Leader':
        return <TeamLeaderDashboard currentUser={currentUser} />;
      case 'Group Team Leader':
        return <GroupTeamLeaderDashboard />;
      case 'Group Head':
        return <GroupHeadDashboard />;
      case 'Leader of Group Head':
      case 'Managing Director':
        return <LeaderDashboard />;
      default:
        return <TeamMemberDashboard />;
    }
  };

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // For Super Admin, show only the dashboard (no tabs)
  if (currentUser.role === 'Super Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
                <p className="text-blue-200">Welcome back, {currentUser.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-blue-200 mb-1">Current Role</div>
                  <div className="text-lg font-semibold text-white bg-red-600/30 px-4 py-2 rounded-lg border border-red-400/30">
                    {currentUser.role}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-black hover:bg-transparent focus:bg-transparent border-none p-2"
                >
                  <LogOut className="h-5 w-5 text-black" />
                </Button>
              </div>
            </div>
          </div>

          {/* Super Admin Dashboard */}
          {renderDashboard()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar
          isOpen={sidebarOpen}
          currentUser={currentUser}
          hierarchyLevels={availableRoles}
          members={members}
          onRoleChange={() => {}} // Disable role switching for logged-in users
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : ''}`}>
          <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  {/* Sidebar Toggle Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-white hover:bg-white/20 lg:hidden"
                  >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                  
                  {/* Desktop Toggle Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-white hover:bg-white/20 hidden lg:flex"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>

                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Project Management Dashboard</h1>
                    <p className="text-blue-200">Welcome back, {currentUser.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-blue-200 mb-1">Current Role</div>
                    <div className="text-lg font-semibold text-white bg-blue-600/30 px-4 py-2 rounded-lg border border-blue-400/30">
                      {currentUser.role}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-black hover:bg-transparent focus:bg-transparent border-none p-2"
                  >
                    <LogOut className="h-5 w-5 text-black" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20 p-1">
                <TabsTrigger 
                  value="dashboard" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger 
                  value="members" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                {renderDashboard()}
              </TabsContent>

              <TabsContent value="projects">
                {renderDashboard()}
              </TabsContent>

              <TabsContent value="members">
                <MemberManagement currentUserRole={currentUser.role} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
