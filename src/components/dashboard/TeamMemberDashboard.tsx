import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit, FolderPlus, Calendar, ListTodo, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const API_URL = 'https://your-app.up.railway.app/api';

interface Project {
  id: string;
  name: string;
  type: 'main' | 'sub';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Ongoing' | 'On Hold' | 'DONE' | 'Cancelled' | 'In Development' | 'UAT' | 'LIVE' | 'Re Development';
  startDate: string;
  endDate: string;
  commonPages: number;
  uniquePages: number;
  tasks: string[];
  mainProjectId?: string;
}

const TeamMemberDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();

  // Fetch projects and members from API on mount
  useEffect(() => {
    fetch(`${API_URL}/projects`).then(res => res.json()).then(setProjects);
    fetch(`${API_URL}/members`).then(res => res.json()).then(setMembers);
    fetch(`${API_URL}/auth/users`).then(res => res.json()).then(setUsers);
  }, []);

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const addProject = (projectData: Omit<Project, 'id'>) => {
    fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    })
      .then(res => res.json())
      .then(newProject => setProjects(projects => [...projects, newProject]));
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    })
      .then(res => res.json())
      .then(updated => setProjects(projects => projects.map(p => p.id === id ? updated : p)));
  };

  const deleteProject = (id: string) => {
    fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' })
      .then(() => setProjects(projects => projects.filter(p => p.id !== id)));
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      'Ongoing': 'bg-blue-500',
      'On Hold': 'bg-yellow-500',
      'DONE': 'bg-green-500',
      'Cancelled': 'bg-red-500',
      'In Development': 'bg-purple-500',
      'UAT': 'bg-orange-500',
      'LIVE': 'bg-emerald-500',
      'Re Development': 'bg-pink-500'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Project['priority']) => {
    const colors = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-green-500'
    };
    return colors[priority];
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Main Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.type === 'main').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Sub Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.type === 'sub').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {projects.filter(p => p.status === 'Ongoing').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setEditingProject(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <ProjectDialog
            project={editingProject}
            onSave={(data) => {
              if (editingProject) {
                updateProject(editingProject.id, data);
              } else {
                addProject(data);
              }
              setIsProjectDialogOpen(false);
              setEditingProject(null);
            }}
            onClose={() => {
              setIsProjectDialogOpen(false);
              setEditingProject(null);
            }}
            members={users}
            projects={projects}
          />
        </Dialog>
      </div>

      {/* Projects Table */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Projects Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead 
                    className="text-blue-200 cursor-pointer hover:text-white"
                    onClick={() => handleSort('name')}
                  >
                    Project Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200">Type</TableHead>
                  <TableHead 
                    className="text-blue-200 cursor-pointer hover:text-white"
                    onClick={() => handleSort('priority')}
                  >
                    Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="text-blue-200 cursor-pointer hover:text-white"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-blue-200">Timeline</TableHead>
                  <TableHead className="text-blue-200">Pages</TableHead>
                  <TableHead className="text-blue-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => (
                  <TableRow key={project.id} className="border-white/20 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-400 text-blue-200">
                        {project.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPriorityColor(project.priority)} text-white`}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-200">
                      <div className="text-sm">
                        <div>{project.startDate}</div>
                        <div className="text-xs">to {project.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-blue-200">
                      <div className="text-sm">
                        <div>Common: {project.commonPages}</div>
                        <div>Unique: {project.uniquePages}</div>
                        <div className="font-semibold">Total: {project.commonPages + project.uniquePages}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-400 text-blue-200 hover:bg-blue-600 hover:text-white"
                          onClick={() => {
                            setEditingProject(project);
                            setIsProjectDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-200 hover:bg-red-600 hover:text-white"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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

// Project Dialog Component
const ProjectDialog = ({ 
  project, 
  onSave, 
  onClose, 
  members,
  projects
}: { 
  project: Project | null; 
  onSave: (data: Omit<Project, 'id'>) => void; 
  onClose: () => void;
  members: any[];
  projects: Project[];
}) => {
  const [formData, setFormData] = useState<Omit<Project, 'id'> & { mainProjectId?: string }>({
    name: project?.name || '',
    type: project?.type || 'main',
    priority: project?.priority || 'Medium',
    status: project?.status || 'In Development',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    commonPages: project?.commonPages || 0,
    uniquePages: project?.uniquePages || 0,
    tasks: project?.tasks || [],
    mainProjectId: project?.mainProjectId || ''
  });

  const [newTask, setNewTask] = useState('');
  const [leadId, setLeadId] = useState<string | undefined>(undefined);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Add this effect to update formData when project changes
  useEffect(() => {
    setFormData({
      name: project?.name || '',
      type: project?.type || 'main',
      priority: project?.priority || 'Medium',
      status: project?.status || 'In Development',
      startDate: project?.startDate || '',
      endDate: project?.endDate || '',
      commonPages: project?.commonPages || 0,
      uniquePages: project?.uniquePages || 0,
      tasks: project?.tasks || [],
      mainProjectId: project?.mainProjectId || ''
    });
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setFormData({
        ...formData,
        tasks: [...formData.tasks, newTask.trim()]
      });
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const handleMemberToggle = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  return (
    <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white text-sm">
      <DialogHeader>
        <DialogTitle className="text-xl text-sm">
          {project ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-white">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-white">Project Type</Label>
            <Select value={formData.type} onValueChange={(value: 'main' | 'sub') => setFormData({...formData, type: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="main">Main Project</SelectItem>
                <SelectItem value="sub">Sub Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {formData.type === 'sub' && (
          <div>
            <Label htmlFor="mainProjectId" className="text-white">Main Project</Label>
            <Select
              value={formData.mainProjectId || ''}
              onValueChange={(value) => setFormData({ ...formData, mainProjectId: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select main project" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {projects.filter(p => p.type === 'main').map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority" className="text-white">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: 'High' | 'Medium' | 'Low') => setFormData({...formData, priority: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" className="text-white">Status</Label>
            <Select value={formData.status} onValueChange={(value: Project['status']) => setFormData({...formData, status: value})}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="DONE">DONE</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="In Development">In Development</SelectItem>
                <SelectItem value="UAT">UAT</SelectItem>
                <SelectItem value="LIVE">LIVE</SelectItem>
                <SelectItem value="Re Development">Re Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-white">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-white">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="commonPages" className="text-white">Common Pages</Label>
            <Input
              id="commonPages"
              type="number"
              min="0"
              value={formData.commonPages}
              onChange={(e) => setFormData({...formData, commonPages: parseInt(e.target.value) || 0})}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="uniquePages" className="text-white">Unique Pages</Label>
            <Input
              id="uniquePages"
              type="number"
              min="0"
              value={formData.uniquePages}
              onChange={(e) => setFormData({...formData, uniquePages: parseInt(e.target.value) || 0})}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white">Team Lead</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select a team lead" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {members.filter((member) => member.role === 'Team Leader').map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-white text-sm">Team Members</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start bg-gray-800 border-gray-600 text-white mt-1 min-h-[40px] text-left"
              >
                {selectedMembers.length === 0
                  ? 'Select team members'
                  : members
                      .filter((m) => selectedMembers.includes(m.id))
                      .map((m) => m.name)
                      .join(', ')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-gray-800 border-gray-600 text-white text-sm">
              <div className="max-h-48 overflow-y-auto space-y-1">
                {members.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-700">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                      id={`member-${member.id}`}
                    />
                    <span>{member.name}</span>
                    {selectedMembers.includes(member.id) && (
                      <X className="h-3 w-3 ml-auto text-gray-400 cursor-pointer" onClick={() => handleMemberToggle(member.id)} />
                    )}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-white">Tasks</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
            />
            <Button type="button" onClick={addTask} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {formData.tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                <span className="text-white">{task}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => removeTask(index)}
                  className="border-red-400 text-red-200 hover:bg-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            {project ? 'Update' : 'Create'} Project
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default TeamMemberDashboard;
