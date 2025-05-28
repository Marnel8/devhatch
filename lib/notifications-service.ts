import { database } from "@/app/lib/firebase"
import { ref, push, get, set, remove, query, orderByChild } from "firebase/database"

export interface Notification {
  id: string
  title: string
  message: string
  type: "email" | "system" | "sms"
  priority: "low" | "medium" | "high"
  recipients: string[]
  status: "draft" | "sent" | "scheduled" | "failed"
  createdAt: string
  sentAt?: string
  scheduledFor?: string
  readCount?: number
  totalRecipients?: number
  createdBy: string
}

const NOTIFICATIONS_REF = "notifications"

export const notificationsService = {
  async createNotification(notification: Omit<Notification, "id">) {
    const notificationsRef = ref(database, NOTIFICATIONS_REF)
    const newNotificationRef = push(notificationsRef)
    const newNotification = {
      ...notification,
      id: newNotificationRef.key,
      createdAt: new Date().toISOString(),
    }
    await set(newNotificationRef, newNotification)
    return newNotification
  },

  async getNotifications() {
    const notificationsRef = ref(database, NOTIFICATIONS_REF)
    const notificationsQuery = query(notificationsRef, orderByChild("createdAt"))
    const snapshot = await get(notificationsQuery)
    
    if (!snapshot.exists()) {
      return []
    }

    const notifications: Notification[] = []
    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key!,
        ...childSnapshot.val(),
      })
    })

    return notifications.reverse() // Most recent first
  },

  async updateNotification(id: string, updates: Partial<Notification>) {
    const notificationRef = ref(database, `${NOTIFICATIONS_REF}/${id}`)
    await set(notificationRef, updates)
    return { id, ...updates }
  },

  async deleteNotification(id: string) {
    const notificationRef = ref(database, `${NOTIFICATIONS_REF}/${id}`)
    await remove(notificationRef)
  },

  async sendNotification(id: string) {
    const notificationRef = ref(database, `${NOTIFICATIONS_REF}/${id}`)
    const updates = {
      status: "sent",
      sentAt: new Date().toISOString(),
    }
    await set(notificationRef, updates)
    return { id, ...updates }
  },

  async markNotificationAsRead(notificationId: string, userId: string) {
    const readRef = ref(database, `${NOTIFICATIONS_REF}/${notificationId}/reads/${userId}`)
    await set(readRef, true)
    
    // Update read count
    const notificationRef = ref(database, `${NOTIFICATIONS_REF}/${notificationId}`)
    const snapshot = await get(notificationRef)
    const notification = snapshot.val()
    
    if (notification) {
      const reads = notification.reads || {}
      const readCount = Object.keys(reads).length
      await set(ref(database, `${NOTIFICATIONS_REF}/${notificationId}/readCount`), readCount)
    }
  },
} 