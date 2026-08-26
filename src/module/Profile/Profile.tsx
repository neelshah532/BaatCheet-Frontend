import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../../services/http'
import { toast } from 'sonner'
import { useAppStore } from '../../store/store'
import { handleError } from '../../common/HandleError'
import { colors } from '../../constants/color'
import { FiUpload, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { PROFILE_STRINGS } from '../../constants/constant'
import { motion } from 'framer-motion'

const Profile = () => {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0)

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
        return
      }
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const uploadProfileImage = async () => {
    if (!profileImage) return null
    setIsLoading(true)
    const formData = new FormData()
    formData.append('profileImage', profileImage)
    try {
      const response = await http.post('/api/auth/addProfileImage', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setIsLoading(false)
      setUserInfo({ ...response.data.imageUrl })
      toast.success('Profile image uploaded')
      return response.data.imageUrl
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveImage = useCallback(async () => {
    try {
      const response = await http.delete('/api/auth/deleteProfileImage', { withCredentials: true })
      if (response.status === 200) {
        setProfileImage(null)
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success('Profile image removed')
      }
    } catch (error) {
      handleError(error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateProfile()) return

    setIsLoading(true)
    try {
      const response = await http.post(
        '/api/auth/update-profile',
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          color: selectedColorIndex,
        },
        {
          withCredentials: true,
        }
      )

      if (response.status === 200 && response.data) {
        setUserInfo({ ...response.data })
        toast.success('Profile saved successfully')
        navigate('/')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateProfile = () => {
    if (!firstName.trim()) {
      toast.error('First name is required')
      return false
    }
    if (!lastName.trim()) {
      toast.error('Last name is required')
      return false
    }
    if (selectedColorIndex === undefined || selectedColorIndex < 0) {
      toast.error('Please select a color theme')
      return false
    }
    return true
  }

  const renderProfilePreview = useMemo(() => {
    if (imagePreview) {
      return (
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden"
            style={{ backgroundColor: colors[selectedColorIndex] }}
          >
            <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-md transition-colors"
            title="Remove image"
          >
            <FiX size={14} />
          </button>
        </div>
      )
    }

    return (
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-light text-white shadow-2xl border-2 border-white/20"
        style={{ backgroundColor: colors[selectedColorIndex] }}
      >
        {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '?'}
      </div>
    )
  }, [imagePreview, selectedColorIndex, firstName, lastName, handleRemoveImage])

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setFirstName(userInfo?.firstName || '')
      setLastName(userInfo?.lastName || '')
      setSelectedColorIndex((userInfo?.color as number) || 0)
      setImagePreview(userInfo?.userImage ? `${import.meta.env.VITE_LOCAL_HOST}/${userInfo.userImage}` : '')
    }
  }, [userInfo])

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full bg-[#0B0C10] flex flex-col items-center justify-center p-4 relative overflow-y-auto font-sans select-none selection:bg-indigo-500/30 selection:text-white">
      {/* Background Depth Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_#1A1C24_0%,_#0B0C10_70%)] opacity-80" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
          {/* Back Button (Only visible if profile is ALREADY set up) */}
          {userInfo?.profileSetup && (
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => navigate('/')}
              className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium transition-all"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back</span>
            </motion.button>
          )}

          <div className="text-center mb-6 pt-2">
            <h2 className="text-2xl font-bold text-white tracking-wide">{userInfo?.profileSetup ? 'Edit Your Profile' : 'Set Up Your Profile'}</h2>
            <p className="text-white/40 text-xs font-light mt-1">
              {userInfo?.profileSetup ? 'Update your display name, theme color, or avatar' : 'Setup is required for new users before entering chat'}
            </p>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-white/10 gap-4">
            {renderProfilePreview}

            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" id="profileImage" />
              <label
                htmlFor="profileImage"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer text-xs font-medium transition-all"
              >
                <FiUpload size={14} />
                <span>Upload Avatar</span>
              </label>

              {profileImage && (
                <button
                  type="button"
                  onClick={uploadProfileImage}
                  disabled={isLoading}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all"
                >
                  {isLoading ? 'Saving...' : 'Save Avatar'}
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Readonly Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 pl-1">{PROFILE_STRINGS.EMAIL}</label>
              <input
                type="email"
                value={userInfo?.email || ''}
                className="w-full px-4 py-3 bg-white/[0.02] rounded-xl border border-white/5 text-sm text-white/40 font-mono focus:outline-none cursor-not-allowed"
                disabled
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60 pl-1">{PROFILE_STRINGS.FIRST_NAME}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60 pl-1">{PROFILE_STRINGS.LAST_NAME}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="Last Name"
                  required
                />
              </div>
            </div>

            {/* Avatar Theme Color */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-white/60 pl-1">Avatar Theme Color</label>
              <div className="grid grid-cols-5 gap-2.5">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColorIndex(index)}
                    className={`h-10 rounded-xl transition-all duration-200 flex items-center justify-center ${
                      selectedColorIndex === index ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B0C10] scale-105 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColorIndex === index && <FiCheck className="text-white text-base drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 px-6 rounded-xl bg-white text-black hover:bg-slate-100 font-semibold text-xs shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <span>{userInfo?.profileSetup ? PROFILE_STRINGS.UPDATE_PROFILE : PROFILE_STRINGS.COMPLETED_PROFILE}</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile
