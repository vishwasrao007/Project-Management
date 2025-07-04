import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, TrendingUp, Award, Building, Users, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

const LeaderDashboard = () => {
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

  // All Divisions in the org (assuming 'Division' is a department group, adapt as needed)
  const divisions = [...new Set(users.filter(u => u.role === 'Group Head').map(u => u.division || u.department))];
  const departments = [...new Set(users.filter(u => u.role === 'Team Leader').map(u => u.department))];
  const teams = [...new Set(users.filter(u => u.role === 'Team Leader').map(u => u.id))];
  const totalProjects = projects.length;
  const successRate = totalProjects > 0 ? Math.round((projects.filter(p => p.status === 'DONE').length / totalProjects) * 100) : 0;

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

  return (
    <div className="space-y-6">
      {/* Executive Leadership Dashboard Bar */}
      <div className="bg-gray-900/90 rounded-lg p-6 grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="text-[#6c7ae0] text-2xl font-bold">{divisions.length}</div>
          <div className="text-[#b0b8d9] text-sm">Divisions</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#6c7ae0] text-2xl font-bold">{departments.length}</div>
          <div className="text-[#b0b8d9] text-sm">Departments</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#4e9af1] text-2xl font-bold">{teams.length}</div>
          <div className="text-[#b0b8d9] text-sm">Teams</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#4be09e] text-2xl font-bold">{totalProjects}</div>
          <div className="text-[#b0b8d9] text-sm">Total Projects</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-[#ffb347] text-2xl font-bold">{successRate}%</div>
          <div className="text-[#b0b8d9] text-sm">Success Rate</div>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-[#4e9af1] flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4e9af1]">{projects.filter(p => p.status === 'Ongoing').length}</div>
            <div className="text-xs text-[#b0b8d9]">Currently in development</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-[#ffb347] flex items-center gap-2">
              <Award className="h-5 w-5" /> Quality Assurance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#ffb347]">{projects.filter(p => p.status === 'UAT').length}</div>
            <div className="text-xs text-[#b0b8d9]">in testing & UAT phase</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-[#4be09e] flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> Production Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4be09e]">{projects.filter(p => p.status === 'LIVE').length}</div>
            <div className="text-xs text-[#b0b8d9]">Live & operational</div>
          </CardContent>
        </Card>
      </div>

      {/* Division Performance Overview Table */}
      <Card className="bg-[#232e4a] border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-[#ffb347]" />
            Division Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e3a5c]">
                  <TableHead className="text-[#b0b8d9]">Group Head</TableHead>
                  <TableHead className="text-[#b0b8d9]">Division</TableHead>
                  <TableHead className="text-[#b0b8d9]">Performance</TableHead>
                  <TableHead className="text-[#b0b8d9]">Scale</TableHead>
                  <TableHead className="text-[#4e9af1] text-center">Ongoing</TableHead>
                  <TableHead className="text-[#ffb347] text-center">UAT</TableHead>
                  <TableHead className="text-[#4be09e] text-center">Live</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divisions.map(division => {
                  const groupHead = users.find(u => u.role === 'Group Head' && (u.division === division || u.department === division));
                  const divisionDepartments = users.filter(u => u.role === 'Team Leader' && (u.division === division || u.department === division));
                  const divisionTeams = [...new Set(divisionDepartments.map(d => d.id))].length;
                  const divisionProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => divisionDepartments.map(d => d.id).includes(id)));
                  const ongoing = divisionProjects.filter(p => p.status === 'Ongoing').length;
                  const uat = divisionProjects.filter(p => p.status === 'UAT').length;
                  const live = divisionProjects.filter(p => p.status === 'LIVE').length;
                  let performance = 'Needs Focus', perfColor = 'bg-[#e05c5c] text-white';
                  if (live / (ongoing + uat + live) > 0.5) performance = 'Excellent', perfColor = 'bg-[#4be09e] text-[#232e4a]';
                  else if (live / (ongoing + uat + live) > 0.3) performance = 'Good', perfColor = 'bg-[#6c7ae0] text-white';
                  else if (uat / (ongoing + uat + live) > 0.4) performance = 'Fair', perfColor = 'bg-[#ffb347] text-[#232e4a]';
                  // Scale: depts, teams, projects
                  const scale = `${divisionDepartments.length} depts | ${divisionTeams} teams | ${divisionProjects.length} projects`;
                  // Division icon (example mapping)
                  const divisionIcons = {
                    'Product Division': '🛠️',
                    'Technology Division': '💻',
                    'Innovation Division': '💡',
                    'Operations Division': '⚙️',
                  };
                  return (
                    <TableRow key={division} className="border-[#2e3a5c]">
                      <TableCell className="text-white font-medium">{groupHead ? groupHead.name : '-'}</TableCell>
                      <TableCell className="text-white font-medium flex items-center gap-2">{divisionIcons[division] || '🏢'} {division}</TableCell>
                      <TableCell><span className={`px-3 py-1 rounded-full text-xs font-semibold ${perfColor}`}>{performance}</span></TableCell>
                      <TableCell className="text-[#b0b8d9]">{scale}</TableCell>
                      <TableCell className="text-center text-[#4e9af1] font-bold">{ongoing}</TableCell>
                      <TableCell className="text-center text-[#ffb347] font-bold">{uat}</TableCell>
                      <TableCell className="text-center text-[#4be09e] font-bold">{live}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        {/* Top Performer */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#ffb347] text-lg font-bold">★ Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Example: Division with highest success rate */}
            {(() => {
              const divisionStats = divisions.map(division => {
                const divisionDepartments = users.filter(u => u.role === 'Team Leader' && (u.division === division || u.department === division));
                const divisionProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => divisionDepartments.map(d => d.id).includes(id)));
                const done = divisionProjects.filter(p => p.status === 'DONE').length;
                const total = divisionProjects.length;
                return { division, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
              });
              const top = divisionStats.reduce((prev, curr) => curr.rate > prev.rate ? curr : prev, { division: '', rate: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.division}</div>
                  <div className="text-sm text-[#ffb347]">{top.rate}% success rate</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Largest Division */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#4e9af1] text-lg font-bold">↗ Largest Division</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const divisionStats = divisions.map(division => {
                const divisionDepartments = users.filter(u => u.role === 'Team Leader' && (u.division === division || u.department === division));
                return { division, count: divisionDepartments.length };
              });
              const top = divisionStats.reduce((prev, curr) => curr.count > prev.count ? curr : prev, { division: '', count: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.division}</div>
                  <div className="text-sm text-[#4e9af1]">{top.count} departments</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Most Productive */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#4be09e] text-lg font-bold">✓ Most Productive</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const divisionStats = divisions.map(division => {
                const divisionDepartments = users.filter(u => u.role === 'Team Leader' && (u.division === division || u.department === division));
                const divisionProjects = projects.filter(p => Array.isArray(p.teamMembers) && p.teamMembers.some(id => divisionDepartments.map(d => d.id).includes(id)));
                return { division, total: divisionProjects.length };
              });
              const top = divisionStats.reduce((prev, curr) => curr.total > prev.total ? curr : prev, { division: '', total: 0 });
              return (
                <div>
                  <div className="text-lg font-semibold text-[#232e4a]">{top.division}</div>
                  <div className="text-sm text-[#4be09e]">{top.total} total projects</div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Organization Scale */}
        <Card className="bg-gray-900/90 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-[#6c7ae0] text-lg font-bold">🏢 Organization Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[#b0b8d9]">Divisions:</span>
                <span className="text-[#6c7ae0] font-bold">{divisions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b0b8d9]">Departments:</span>
                <span className="text-[#6c7ae0] font-bold">{departments.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#b0b8d9]">Teams:</span>
                <span className="text-[#4e9af1] font-bold">{teams.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderDashboard;
