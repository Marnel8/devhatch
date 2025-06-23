export const CONTACT_INFO = {
  email: "devops@g.batstate-u.edu.ph",
  office: "BatStateU DevOps Office",
  location: "3rd Floor, SteerHub Building",
  university: "Batangas State University",
  city: "Batangas City, Philippines",
  domain: "@g.batstate-u.edu.ph",
}

export const DEMO_CREDENTIALS = {
  student: {
    email: "student@g.batstate-u.edu.ph",
    password: "demo123456",
  },
  superadmin: {
    email: "admin@g.batstate-u.edu.ph",
    password: "admin123456",
  },
  projectAdmins: {
    trioe: {
      email: "trioe.admin@devhatch.com",
      password: "trioe123456",
    },
    mrmed: {
      email: "mrmed.admin@devhatch.com",
      password: "mrmed123456",
    },
    haptics: {
      email: "haptics.admin@devhatch.com",
      password: "haptics123456",
    },
    multi: {
      email: "multi.admin@devhatch.com",
      password: "multi123456",
    },
  },
}

export const PROJECTS = {
  TRIOE: {
    name: "TRIOE",
    color: "blue",
    icon: "⚡",
  },
  MR_MED: {
    name: "MR. MED",
    color: "purple",
    icon: "🥽",
  },
  HAPTICS: {
    name: "HAPTICS",
    color: "emerald",
    icon: "🤖",
  },
} as const
