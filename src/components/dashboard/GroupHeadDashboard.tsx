import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

const GroupHeadDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetch(`${API_URL}/projects`).then(res => res.json()).then(setProjects);
    fetch(`${API_URL}/members`).then(res => res.json()).then(setMembers);
    fetch(`${API_URL}/auth/users`).then(res => res.json()).then(setUsers);
  }, []);

  // All Team Members in the org
  const teamMembers = users.filter(u => u.role === 'Team Member');
  const departments = [...new Set(teamMembers.map(u => u.department))];
  const memberStats = teamMembers.map(member => {
    const memberProjects = projects.filter(p => p.teamMembers?.includes(member.id));
    return {
      name: member.name,
      projectCount: memberProjects.length,
      ongoing: memberProjects.filter(p => p.status === 'Ongoing').length,
      onHold: memberProjects.filter(p => p.status === 'On Hold').length,
      done: memberProjects.filter(p => p.status === 'DONE').length,
      uat: memberProjects.filter(p => p.status === 'UAT').length,
      live: memberProjects.filter(p => p.status === 'LIVE').length,
    };
  });

  const totalStats = memberStats.reduce(
    (acc, m) => ({
      projectCount: acc.projectCount + m.projectCount,
      ongoing: acc.ongoing + m.ongoing,
      onHold: acc.onHold + m.onHold,
      done: acc.done + m.done,
      uat: acc.uat + m.uat,
      live: acc.live + m.live,
    }),
    { projectCount: 0, ongoing: 0, onHold: 0, done: 0, uat: 0, live: 0 }
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedMembers = [...memberStats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const getStatusBadge = (count, status) => {
    const colors = {
      'Total': 'bg-blue-500',
      'Ongoing': 'bg-blue-600',
      'On Hold': 'bg-yellow-500',
      'Done': 'bg-green-500',
      'UAT': 'bg-orange-500',
      'Live': 'bg-emerald-500'
    };
    return (
      <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>{count}</Badge>
    );
  };

  const getDepartmentIcon = (department: string) => {
    const icons = {
      'Frontend Development': '🎨',
      'Backend Development': '⚙️',
      'Mobile Development': '📱',
      'DevOps & Infrastructure': '🚀',
      'Quality Assurance': '✅'
    };
    return icons[department as keyof typeof icons] || '💼';
  };

  const getHealthScore = (leader: typeof memberStats[0]) => {
    const total = leader.ongoing + leader.uat + leader.live;
    const liveRatio = leader.live / total;
    const uatRatio = leader.uat / total;
    
    if (liveRatio > 0.5) return { score: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (liveRatio > 0.3 && uatRatio > 0.2) return { score: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (uatRatio > 0.4) return { score: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { score: 'Needs Focus', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#1a2341] border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#6c7ae0]" /> Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#6c7ae0]">{[...new Set(users.filter(u => u.role === 'Team Member').map(u => u.department))].length}</div>
            <div className="text-xs text-[#b0b8d9]">{[...new Set(users.filter(u => u.role === 'Team Member').map(u => u.teamLeaderId))].length} total teams</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2341] border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#4e9af1]" /> Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4e9af1]">{projects.filter(p => p.status === 'Ongoing').length}</div>
            <div className="text-xs text-[#b0b8d9]">in development</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2341] border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#ffb347]" /> Testing Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#ffb347]">{projects.filter(p => p.status === 'UAT').length}</div>
            <div className="text-xs text-[#b0b8d9]">UAT & QA</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a2341] border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#4be09e]" /> Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4be09e]">{projects.filter(p => p.status === 'LIVE').length}</div>
            <div className="text-xs text-[#b0b8d9]">Live systems</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Overview Table */}
      <Card className="bg-[#232e4a] border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-[#6c7ae0]" />
            Department Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e3a5c]">
                  <TableHead className="text-[#b0b8d9]">Group Team Leader</TableHead>
                  <TableHead className="text-[#b0b8d9]">Department</TableHead>
                  <TableHead className="text-[#b0b8d9]">Health</TableHead>
                  <TableHead className="text-[#b0b8d9] text-center">Teams</TableHead>
                  <TableHead className="text-[#4e9af1] text-center">Ongoing</TableHead>
                  <TableHead className="text-[#ffb347] text-center">UAT</TableHead>
                  <TableHead className="text-[#4be09e] text-center">Live</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Get all unique departments
                  const departments = [...new Set(users.filter(u => u.role === 'Team Member').map(u => u.department))];
                  return departments.map(dept => {
                    const deptMembers = users.filter(u => u.role === 'Team Member' && u.department === dept);
                    const deptMemberIds = deptMembers.map(m => m.id);
                    // Find the group team leader for this department (first team leader found)
                    const groupTeamLeader = users.find(u => u.role === 'Group Team Leader' && u.department === dept);
                    // Health calculation (example: based on live/uat/ongoing ratio)
                    const deptProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => deptMemberIds.includes(id)));
                    const ongoing = deptProjects.filter(p => p.status === 'Ongoing').length;
                    const uat = deptProjects.filter(p => p.status === 'UAT').length;
                    const live = deptProjects.filter(p => p.status === 'LIVE').length;
                    let health = 'Needs Focus', healthColor = 'bg-[#e05c5c] text-white';
                    if (live / (ongoing + uat + live) > 0.5) health = 'Excellent', healthColor = 'bg-[#4be09e] text-[#232e4a]';
                    else if (live / (ongoing + uat + live) > 0.3) health = 'Good', healthColor = 'bg-[#6c7ae0] text-white';
                    else if (uat / (ongoing + uat + live) > 0.4) health = 'Fair', healthColor = 'bg-[#ffb347] text-[#232e4a]';
                    // Teams: unique teamLeaderId among dept members
                    const teams = [...new Set(deptMembers.map(m => m.teamLeaderId))].length;
                    // Department icon
                    const deptIcons = {
                      'Frontend Development': '🎨',
                      'Backend Development': '⚙️',
                      'Mobile Development': '📱',
                      'DevOps & Infrastructure': '🚀',
                      'Quality Assurance': '✅'
                    };
                    return (
                      <TableRow key={dept} className="border-[#2e3a5c]">
                        <TableCell className="text-white font-medium">{groupTeamLeader ? groupTeamLeader.name : '-'}</TableCell>
                        <TableCell className="text-white font-medium flex items-center gap-2">{deptIcons[dept] || '💼'} {dept}</TableCell>
                        <TableCell><span className={`px-3 py-1 rounded-full text-xs font-semibold ${healthColor}`}>{health}</span></TableCell>
                        <TableCell className="text-center text-[#b0b8d9]">{teams}</TableCell>
                        <TableCell className="text-center text-[#4e9af1] font-bold">{ongoing}</TableCell>
                        <TableCell className="text-center text-[#ffb347] font-bold">{uat}</TableCell>
                        <TableCell className="text-center text-[#4be09e] font-bold">{live}</TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Production Ready */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#4be09e] text-lg font-bold">✓ Production Ready</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Most live projects
              const deptStats = departments.map(dept => {
                const deptMembers = users.filter(u => u.role === 'Team Member' && u.department === dept);
                const deptMemberIds = deptMembers.map(m => m.id);
                const deptProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => deptMemberIds.includes(id)));
                return { dept, live: deptProjects.filter(p => p.status === 'LIVE').length };
              });
              const top = deptStats.reduce((prev, curr) => curr.live > prev.live ? curr : prev, { dept: '', live: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.dept}</div>
                  <div className="text-sm text-[#4be09e]">{top.live} live projects</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Most Active */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#4e9af1] text-lg font-bold">↗ Most Active</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Most ongoing projects
              const deptStats = departments.map(dept => {
                const deptMembers = users.filter(u => u.role === 'Team Member' && u.department === dept);
                const deptMemberIds = deptMembers.map(m => m.id);
                const deptProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => deptMemberIds.includes(id)));
                return { dept, ongoing: deptProjects.filter(p => p.status === 'Ongoing').length };
              });
              const top = deptStats.reduce((prev, curr) => curr.ongoing > prev.ongoing ? curr : prev, { dept: '', ongoing: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.dept}</div>
                  <div className="text-sm text-[#4e9af1]">{top.ongoing} ongoing projects</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Quality Focus */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#ffb347] text-lg font-bold">△ Quality Focus</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Most UAT projects
              const deptStats = departments.map(dept => {
                const deptMembers = users.filter(u => u.role === 'Team Member' && u.department === dept);
                const deptMemberIds = deptMembers.map(m => m.id);
                const deptProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => deptMemberIds.includes(id)));
                return { dept, uat: deptProjects.filter(p => p.status === 'UAT').length };
              });
              const top = deptStats.reduce((prev, curr) => curr.uat > prev.uat ? curr : prev, { dept: '', uat: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.dept}</div>
                  <div className="text-sm text-[#ffb347]">{top.uat} projects in UAT</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Organization Overview Row */}
      <div className="bg-gray-900/90 rounded-lg p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-[#6c7ae0] text-2xl font-bold">{[...new Set(users.filter(u => u.role === 'Team Member').map(u => u.department))].length}</div>
          <div className="text-[#b0b8d9] text-sm">Departments</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#6c7ae0] text-2xl font-bold">{[...new Set(users.filter(u => u.role === 'Team Member').map(u => u.teamLeaderId))].length}</div>
          <div className="text-[#b0b8d9] text-sm">Total Teams</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#4e9af1] text-2xl font-bold">{projects.filter(p => p.status === 'Ongoing').length}</div>
          <div className="text-[#b0b8d9] text-sm">Active Projects</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#4be09e] text-2xl font-bold">{projects.filter(p => p.status === 'LIVE').length}</div>
          <div className="text-[#b0b8d9] text-sm">Live Systems</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#ffb347] text-2xl font-bold">{totalStats.projectCount > 0 ? Math.round((totalStats.done / totalStats.projectCount) * 100) : 0}%</div>
          <div className="text-[#b0b8d9] text-sm">Success Rate</div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeadDashboard;
