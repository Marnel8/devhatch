"use client"

import { useCallback, useRef } from "react"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = initAudioContext()

      // Create success sound (ascending beep)
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn("Could not play success sound:", error)
    }
  }, [initAudioContext])

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = initAudioContext()

      // Create error sound (descending beep)
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (error) {
      console.warn("Could not play error sound:", error)
    }
  }, [initAudioContext])

  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = initAudioContext()

      // Create notification sound (double beep)
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator1.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator2.frequency.setValueAtTime(600, audioContext.currentTime + 0.15)

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.15)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator1.start(audioContext.currentTime)
      oscillator1.stop(audioContext.currentTime + 0.1)

      oscillator2.start(audioContext.currentTime + 0.15)
      oscillator2.stop(audioContext.currentTime + 0.25)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }, [initAudioContext])

  return {
    playSuccessSound,
    playErrorSound,
    playNotificationSound,
  }
}
