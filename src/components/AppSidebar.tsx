import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  currentUser: {
    name: string;
    role: string;
    level: number;
  };
  hierarchyLevels: string[];
  members: any[];
  onRoleChange: (role: string) => void;
}

const AppSidebar = ({ isOpen, currentUser, hierarchyLevels, members, onRoleChange }: AppSidebarProps) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => {}} // Will be controlled by parent
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
        ${isOpen ? 'lg:block' : 'lg:hidden'}
      `}>
        <div className="p-6 h-full overflow-y-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Role Selector
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {hierarchyLevels.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No roles available</div>
                ) : (
                  hierarchyLevels.map((role) => {
                    const roleMembers = members.filter(m => m.role === role);
                    return (
                      <div key={role} className="space-y-2">
                        <Button
                          variant={currentUser.role === role ? "default" : "outline"}
                          onClick={() => onRoleChange(role)}
                          className={`w-full justify-start ${
                            currentUser.role === role 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : "bg-white/10 hover:bg-white/20 text-white border-white/30"
                          }`}
                        >
                          {role}
                          {roleMembers.length > 0 && (
                            <span className="ml-auto bg-white/20 px-2 py-1 rounded text-xs">
                              {roleMembers.length}
                            </span>
                          )}
                        </Button>
                        {roleMembers.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {roleMembers.map(member => (
                              <div key={member.id} className="text-xs text-gray-300 pl-2">
                                • {member.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
