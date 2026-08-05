/**
 * Utility functions for handling media devices
 */

import { toast } from 'sonner'

/**
 * Checks if the browser supports WebRTC
 * @returns Boolean indicating if WebRTC is supported
 */
export const isWebRTCSupported = (): boolean => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.RTCPeerConnection)
}

/**
 * Checks if the browser is Safari (which has some WebRTC limitations)
 * @returns Boolean indicating if browser is Safari
 */
export const isSafari = (): boolean => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Display a warning if the browser has limited WebRTC support
 */
export const checkBrowserCompatibility = (): void => {
  if (!isWebRTCSupported()) {
    toast.error('Your browser does not support video calling. Please use a modern browser like Chrome, Firefox, or Edge.', { duration: 5000 })
    return
  }

  // Safari has some limitations with WebRTC
  if (isSafari()) {
    toast.warning("You're using Safari which has some limitations with video calls. For the best experience, consider using Chrome or Firefox.", { duration: 5000 })
  }
}

/**
 * Checks if the required media devices are available
 * @param requiresVideo Whether video is required
 * @returns A promise resolving to boolean indicating if devices are available
 */
export const checkMediaDevices = async (requiresVideo: boolean = false): Promise<boolean> => {
  // First check if the API is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    toast.error('Media devices API not supported in this browser')
    return false
  }

  try {
    // Get list of available devices
    const devices = await navigator.mediaDevices.enumerateDevices()

    // Check for audio input (microphone)
    const hasMicrophone = devices.some((device) => device.kind === 'audioinput')

    // Check for video input (camera) if needed
    const hasCamera = !requiresVideo || devices.some((device) => device.kind === 'videoinput')

    // If no microphone is available, show error
    if (!hasMicrophone) {
      toast.error('No microphone detected. Please connect a microphone to make calls.')
      return false
    }

    // If video is required but no camera available, show warning
    if (requiresVideo && !hasCamera) {
      toast.warning('No camera detected. You can proceed with audio only.')
      // We still return true as audio-only fallback is acceptable
    }

    return true
  } catch (error) {
    console.error('Error checking media devices:', error)
    toast.error('Failed to check available media devices')
    return false
  }
}

/**
 * Requests permission to use media devices
 * @param audio Whether to request audio permission
 * @param video Whether to request video permission
 * @returns A promise resolving to boolean indicating if permissions were granted
 */
export const requestMediaPermissions = async (audio: boolean = true, video: boolean = false): Promise<boolean> => {
  try {
    // Request permissions by attempting to access the devices
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video })

    // Stop all tracks immediately - we're just checking permissions
    stream.getTracks().forEach((track) => track.stop())

    return true
  } catch (error) {
    console.error('Error requesting media permissions:', error)

    // If permission denied
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      toast.error('Camera/microphone access denied. Please allow access in your browser settings.', { duration: 5000 })
    }
    // If no devices found
    else if (error.name === 'NotFoundError') {
      if (video) {
        toast.error('Camera or microphone not found. Please check your devices.')
      } else {
        toast.error('Microphone not found. Please check your audio devices.')
      }
    }
    // Other errors
    else {
      toast.error('Error accessing media devices. Please check your hardware.')
    }

    return false
  }
}

export default {
  checkMediaDevices,
  requestMediaPermissions,
  isWebRTCSupported,
  isSafari,
  checkBrowserCompatibility,
}
