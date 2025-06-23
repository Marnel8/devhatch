import { useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { filterByProjectAccess, getAvailableProjects } from "@/lib/permissions"

interface UseProjectFilterOptions<T> {
  data: T[]
  selectedProject?: string
}

export function useProjectFilter<T extends { project?: string }>(
  options: UseProjectFilterOptions<T>
) {
  const { user } = useAuth()
  const { data, selectedProject } = options

  const filteredData = useMemo(() => {
    if (!user) return data

    // First, filter by user's project access permissions
    let filtered = filterByProjectAccess(user, data)

    // Then apply additional project filter if selected
    if (selectedProject && selectedProject !== "all") {
      filtered = filtered.filter(item => item.project === selectedProject)
    }

    return filtered
  }, [user, data, selectedProject])

  const availableProjects = useMemo(() => {
    return user ? getAvailableProjects(user) : ["TRIOE", "MR. MED", "HAPTICS"]
  }, [user])

  return {
    filteredData,
    availableProjects,
    hasProjectAccess: (project: string) => {
      if (!user) return false
      if (user.role === "superadmin") return true
      return user.projectAccess?.includes(project) || false
    }
  }
}

export default useProjectFilter 