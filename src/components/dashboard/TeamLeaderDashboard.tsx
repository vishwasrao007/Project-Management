import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, FolderOpen, Clock } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

const TeamLeaderDashboard = ({ currentUser }) => {
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

  // Show all Team Members in the org (not just direct reports)
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
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStats.projectCount}</div>
            <div className="text-xs text-blue-300">Across all team members</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{totalStats.ongoing}</div>
            <div className="text-xs text-blue-300">Ongoing projects</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-200">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{totalStats.onHold}</div>
            <div className="text-xs text-yellow-300">Need attention</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-200">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{totalStats.done}</div>
            <div className="text-xs text-green-300">Completed projects</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-200">UAT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{totalStats.uat}</div>
            <div className="text-xs text-orange-300">Testing phase</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-200">Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{totalStats.live}</div>
            <div className="text-xs text-emerald-300">Production ready</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Performance Table */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                    Team Member {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('projectCount')}>
                    Total Projects {sortField === 'projectCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('ongoing')}>
                    Ongoing {sortField === 'ongoing' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('onHold')}>
                    On Hold {sortField === 'onHold' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('done')}>
                    Done {sortField === 'done' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('uat')}>
                    UAT {sortField === 'uat' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200 cursor-pointer hover:text-white text-center" onClick={() => handleSort('live')}>
                    Live {sortField === 'live' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow key={member.name} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{member.name}</TableCell>
                    <TableCell className="text-center">{member.projectCount}</TableCell>
                    <TableCell className="text-center">{member.ongoing}</TableCell>
                    <TableCell className="text-center">{member.onHold}</TableCell>
                    <TableCell className="text-center">{member.done}</TableCell>
                    <TableCell className="text-center">{member.uat}</TableCell>
                    <TableCell className="text-center">{member.live}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamLeaderDashboard;
