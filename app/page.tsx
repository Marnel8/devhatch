import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MobileHeader } from "@/components/mobile-header"
import { ArrowRight, Egg, ExternalLink, Sparkles } from "lucide-react"
import { database } from "@/app/lib/firebase"
import { ref, get } from "firebase/database"
import { Suspense } from "react"

// Types for project data
interface Project {
  name: string
  description: string
  longDescription: string
  color: string
  borderColor: string
  bgColor: string
  textColor: string
  openings: number
  icon: string
  tags: string[]
}

// Function to fetch projects from Firebase
async function getProjects(): Promise<Project[]> {
  const projectsRef = ref(database, 'projects')
  const jobsRef = ref(database, 'jobPostings')
  
  const [projectsSnapshot, jobsSnapshot] = await Promise.all([
    get(projectsRef),
    get(jobsRef)
  ])
  
  if (!projectsSnapshot.exists()) {
    // Return default projects if no data exists in Firebase
    const defaultProjects = [
      {
        name: "TRIOE",
        description: "Advanced circuit board development and intelligent marketing automation systems",
        longDescription:
          "Pioneering the future of electronic design with cutting-edge circuit board development tools and AI-powered marketing solutions.",
        color: "from-blue-500 to-blue-600",
        borderColor: "border-blue-200",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        openings: 0, // Will be updated from jobPostings
        icon: "⚡",
        tags: ["Hardware", "Marketing", "AI"],
      },
      {
        name: "MR. MED",
        description: "Immersive 3D and Mixed Reality solutions for next-generation medical training",
        longDescription:
          "Revolutionizing medical education through immersive technologies, creating realistic training environments for healthcare professionals.",
        color: "from-purple-500 to-purple-600",
        borderColor: "border-purple-200",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        openings: 0, // Will be updated from jobPostings
        icon: "🥽",
        tags: ["VR/AR", "Healthcare", "3D"],
      },
      {
        name: "HAPTICS",
        description: "Revolutionary haptic feedback systems and tactile interface technologies",
        longDescription:
          "Developing the next generation of touch-based interfaces that bridge the gap between digital and physical interactions.",
        color: "from-emerald-500 to-emerald-600",
        borderColor: "border-emerald-200",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        openings: 0, // Will be updated from jobPostings
        icon: "🤖",
        tags: ["Robotics", "IoT", "Sensors"],
      },
    ]

    // Update openings from jobPostings if they exist
    if (jobsSnapshot.exists()) {
      const jobs = Object.values(jobsSnapshot.val()) as any[]
      defaultProjects.forEach(project => {
        const projectJobs = jobs.filter(job => 
          job.project === project.name && 
          job.isActive === true
        )
        project.openings = projectJobs.reduce((total, job) => 
          total + (job.availableSlots - (job.filledSlots || 0)), 0
        )
      })
    }

    return defaultProjects
  }

  const projects = Object.values(projectsSnapshot.val()) as Project[]

  // Update openings from jobPostings if they exist
  if (jobsSnapshot.exists()) {
    const jobs = Object.values(jobsSnapshot.val()) as any[]
    projects.forEach(project => {
      const projectJobs = jobs.filter(job => 
        job.project === project.name && 
        job.isActive === true
      )
      project.openings = projectJobs.reduce((total, job) => 
        total + (job.availableSlots - (job.filledSlots || 0)), 0
      )
    })
  }

  return projects
}

// Loading skeleton for projects
function ProjectSkeleton() {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-xl animate-pulse">
      <CardHeader className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
          <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
        </div>
        <div className="w-3/4 h-8 bg-slate-200 rounded mb-3"></div>
        <div className="w-full h-20 bg-slate-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-6">
          <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
          <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
        </div>
      </CardHeader>
      <CardContent className="relative p-8 pt-0">
        <div className="w-full h-12 bg-slate-200 rounded"></div>
      </CardContent>
    </Card>
  )
}

// Projects grid component with loading state
async function ProjectsGrid() {
  const projects = await getProjects()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
      {projects.map((project) => (
        <Card
          key={project.name}
          className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${project.borderColor} bg-white`}
        >
          {/* Gradient Background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          ></div>

          <CardHeader className="relative p-8">
            {/* Project Icon & Badge */}
            <div className="flex items-center justify-between mb-6">
              <div
                className={`w-16 h-16 ${project.bgColor} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
              >
                {project.icon}
              </div>
              <Badge
                variant="secondary"
                className={`${project.bgColor} ${project.textColor} border-0 px-3 py-1 font-semibold`}
              >
                {project.openings} positions
              </Badge>
            </div>

            {/* Project Title */}
            <CardTitle className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors">
              {project.name}
            </CardTitle>

            {/* Short Description */}
            <CardDescription className="text-slate-600 text-base leading-relaxed mb-4">
              {project.description}
            </CardDescription>

            {/* Long Description */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{project.longDescription}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardHeader>

          <CardContent className="relative p-8 pt-0">
            <Link href={`/jobs?project=${project.name}`}>
              <Button
                className={`w-full h-12 bg-gradient-to-r ${project.color} hover:shadow-lg hover:shadow-current/25 transition-all duration-300 text-white font-semibold border-0`}
              >
                View Positions
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>

          {/* Decorative Corner */}
          <div
            className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${project.color} opacity-10 rounded-bl-full`}
          ></div>
        </Card>
      ))}
    </div>
  )
}

// Footer projects list component
async function FooterProjectsList() {
  const projects = await getProjects()
  
  return (
    <ul className="space-y-4">
      {projects.map((project) => (
        <li key={project.name}>
          <Link
            href={`/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-slate-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group"
          >
            <span className="text-lg mr-2">{project.icon}</span>
            <span>{project.name}</span>
            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <MobileHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative">
          <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-32">
            <div className="max-w-5xl mx-auto text-center">
              {/* Premium Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/90">Premium OJT Experience</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Hatch Your
                <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Future in Tech
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                Join BatStateU DevOps Office's elite OJT program and work on groundbreaking projects that shape
                tomorrow's technology landscape.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                <Link href="/jobs" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-lg shadow-xl shadow-emerald-500/25 border-0"
                  >
                    Explore Opportunities
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/apply" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-8 border-white/20 hover:text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-lg"
                  >
                    Apply Now
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 sm:py-24 lg:py-32 relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center space-x-2 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Innovation Projects</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Shape the Future with
              <span className="block bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Cutting-Edge Projects
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Choose from our portfolio of innovative projects that are defining the next generation of technology
              solutions.
            </p>
          </div>

          {/* Projects Grid with Loading State */}
          <Suspense fallback={
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {[...Array(3)].map((_, i) => (
                <ProjectSkeleton key={i} />
              ))}
            </div>
          }>
            <ProjectsGrid />
          </Suspense>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30"></div>
      </section>

      {/* Premium Footer */}
      <footer className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Egg className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">DevHatch</span>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-md">
                  Hatching the next generation of developers, designers, and innovators through world-class OJT
                  experiences.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-400 text-sm">Actively recruiting talented students</span>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
                <ul className="space-y-4">
                  {[
                    { name: "Browse Opportunities", href: "/jobs" },
                    { name: "Application Portal", href: "/apply" },
                    { name: "About DevHatch", href: "/about" },
                    { name: "Contact Us", href: "/contact" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-slate-300 hover:text-emerald-400 transition-colors duration-300 flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Projects */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Innovation Projects</h3>
                <Suspense fallback={
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                }>
                  <FooterProjectsList />
                </Suspense>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-800 mt-16 pt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-white">Get in Touch</h4>
                  <div className="space-y-2 text-slate-300">
                    <p className="flex items-center">
                      <span className="font-medium">BatStateU DevOps Office</span>
                    </p>
                    <p>3rd Floor, SteerHub Building</p>
                    <p>Batangas State University</p>
                    <p>Batangas City, Philippines</p>
                    <p className="text-emerald-400 font-medium">devops@gmail.com</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <Link href="/apply">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 shadow-xl shadow-emerald-500/25 border-0"
                    >
                      Start Your Journey
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-800 mt-12 pt-8 text-center">
              <p className="text-slate-400 text-sm">
                &copy; 2024 DevHatch - BatStateU DevOps Office. All rights reserved.
                <span className="mx-2">•</span>
                Crafted with passion for innovation.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </footer>
    </div>
  )
}
