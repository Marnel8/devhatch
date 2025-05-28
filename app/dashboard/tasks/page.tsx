"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Clock, Play, Pause, Square, MoreHorizontal, Calendar, User, Flag } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  dueDate: string
  timeSpent: number
  estimatedTime: number
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement User Authentication",
    description: "Set up Firebase authentication for the application",
    status: "in-progress",
    priority: "high",
    category: "Development",
    dueDate: "2024-01-15",
    timeSpent: 120,
    estimatedTime: 180,
  },
  {
    id: "2",
    title: "Design Database Schema",
    description: "Create the database structure for the OJT portal",
    status: "completed",
    priority: "medium",
    category: "Design",
    dueDate: "2024-01-10",
    timeSpent: 90,
    estimatedTime: 90,
  },
  {
    id: "3",
    title: "Write API Documentation",
    description: "Document all API endpoints and their usage",
    status: "todo",
    priority: "low",
    category: "Documentation",
    dueDate: "2024-01-20",
    timeSpent: 0,
    estimatedTime: 60,
  },
  {
    id: "4",
    title: "Unit Testing Setup",
    description: "Configure Jest and write initial test cases",
    status: "review",
    priority: "medium",
    category: "Testing",
    dueDate: "2024-01-18",
    timeSpent: 45,
    estimatedTime: 120,
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [view, setView] = useState<"list" | "kanban">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "review":
        return "bg-yellow-100 text-yellow-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const toggleTimer = (taskId: string) => {
    if (activeTimer === taskId) {
      setActiveTimer(null)
    } else {
      setActiveTimer(taskId)
    }
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={getPriorityColor(task.priority)} className="capitalize">
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
          <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
          <Badge variant="outline">
            <User className="w-3 h-3 mr-1" />
            {task.category}
          </Badge>
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {task.timeSpent}m / {task.estimatedTime}m
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleTimer(task.id)}
              className="flex items-center gap-1"
            >
              {activeTimer === task.id ? (
                <>
                  <Pause className="w-3 h-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Start
                </>
              )}
            </Button>
            {activeTimer === task.id && (
              <Button variant="outline" size="sm" onClick={() => setActiveTimer(null)}>
                <Square className="w-3 h-3" />
                Stop
              </Button>
            )}
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(task.timeSpent / task.estimatedTime) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const KanbanColumn = ({ status, title }: { status: string; title: string }) => (
    <div className="flex-1 min-w-80">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center justify-between">
          {title}
          <Badge variant="secondary">{filteredTasks.filter((task) => task.status === status).length}</Badge>
        </h3>
        <div className="space-y-3">
          {filteredTasks
            .filter((task) => task.status === status)
            .map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks & Projects</h1>
          <p className="text-muted-foreground">Manage your OJT tasks and track progress</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new task to your project board.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter task title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter task description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsCreateDialogOpen(false)}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={(value) => setView(value as "list" | "kanban")}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No tasks found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="kanban">
          <div className="flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn status="todo" title="To Do" />
            <KanbanColumn status="in-progress" title="In Progress" />
            <KanbanColumn status="review" title="Review" />
            <KanbanColumn status="completed" title="Completed" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
