import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../../services/http'
import { toast } from 'sonner'
import { useAppStore } from '../../store/store'
import { handleError } from '../../common/HandleError'
import { colors } from '../../constants/color'
import { FiUpload, FiX } from 'react-icons/fi'
import { PROFILE_STRINGS } from '../../constants/constant'

const Profile = () => {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  //   const [userData, setUserData] = useState<UserInfo | null>(null)
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
      return response.data.imageUrl
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Remove selected image
  const handleRemoveImage = useCallback(async () => {
    try {
      const response = await http.delete('/api/auth/deleteProfileImage', { withCredentials: true })
      if (response.status === 200) {
        setProfileImage(null)
        setImagePreview('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success('Profile image removed successfully')
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
        toast.success('Profile updated successfully')
        navigate('/chat')
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }
  //   profile validation

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
      toast.error('Please select a color')
      return false
    }
    return true
  }

  // Memoize the profile preview component
  const renderProfilePreview = useMemo(() => {
    if (imagePreview) {
      return (
        <div className="relative w-24 h-24">
          <div className="w-28 h-28 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
            <img src={imagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover" />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full 
            flex items-center justify-center text-white hover:bg-red-600 
            transition-colors duration-200"
          >
            <FiX size={16} />
          </button>
        </div>
      )
    }

    return (
      <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
        {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '?'}
      </div>
    )
  }, [imagePreview, selectedColorIndex, firstName, lastName, handleRemoveImage])

  // Add this inside your form, after the avatar preview
  const ImageUploadSection = React.memo(() => (
    <div className="flex flex-col items-center space-y-4">
      {/* Upload Button */}
      <div className="relative">
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" id="profileImage" />
        <label
          htmlFor="profileImage"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#15151F]/50 
          border border-white/[0.05] text-gray-300 hover:text-white 
          hover:border-indigo-500/30 cursor-pointer transition-all duration-300"
        >
          <FiUpload size={18} />
          <span className="text-sm">{PROFILE_STRINGS.PROFILE_IMAGE_DESCRIPTION}</span>
        </label>
        <p className="mt-2 text-xs text-gray-400 text-center">{PROFILE_STRINGS.MAX_SIZE}</p>
      </div>

      {/* Save Button */}
      <button
        onClick={uploadProfileImage}
        disabled={isLoading}
        hidden={!imagePreview}
        className="w-full px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold 
        hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 mt-2"
      >
        {isLoading ? `${PROFILE_STRINGS.LOADING_SAVE}` : `${PROFILE_STRINGS.SAVE}`}
      </button>
    </div>
  ))

  // useEffect to set the user data

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setFirstName(userInfo?.firstName || '')
      setLastName(userInfo?.lastName || '')
      setSelectedColorIndex((userInfo?.color as number) || 0)
      setImagePreview(userInfo?.userImage ? `${import.meta.env.VITE_LOCAL_HOST}/${userInfo.userImage}` : '')
      //   console.log('Image:', userInfo)
    }
  }, [userInfo])

  return (
    <div className="max-h-screen bg-[#0A0A0F] flex flex-col h-full overflow-hidden ">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#080810]">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)]" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-[600px] h-[600px] rounded-full 
                ${i === 0 ? 'top-[-300px] left-[-200px] bg-blue-500/10' : i === 1 ? 'top-[-200px] right-[-250px] bg-purple-500/10' : 'bottom-[-300px] left-[20%] bg-indigo-500/10'} 
                blur-[120px] animate-blob animation-delay-${i * 2000}`}
            />
          ))}
        </div>
      </div>

      {/* main card start frome here */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[440px]">
          {/* Profile Card */}
          <div className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
            <div className="relative bg-[#0C0C14]/95 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-7">
              {/* User Avatar Preview */}
              <div className="mb-6 flex justify-center items-center gap-8">
                {renderProfilePreview}
                <ImageUploadSection />
                {/* <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
                  {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '?'}
                </div> */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">{PROFILE_STRINGS.EMAIL}</label>
                  <input
                    type="email"
                    value={userInfo?.email || ''}
                    className="w-full px-4 py-3 bg-[#15151F]/50 rounded-lg border border-white/[0.05]
                      text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/30 
                      focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
                    disabled
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">{PROFILE_STRINGS.FIRST_NAME}</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#15151F]/50 rounded-lg border border-white/[0.05]
                        text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/30 
                        focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">{PROFILE_STRINGS.LAST_NAME}</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#15151F]/50 rounded-lg border border-white/[0.05]
                        text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/30 
                        focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">{PROFILE_STRINGS.CHOOSE}</label>
                  <div className="grid grid-cols-5 gap-3">
                    {colors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedColorIndex(index)}
                        className={`w-full aspect-square rounded-lg transition-transform hover:scale-110
                          ${selectedColorIndex === index ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0C0C14]' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isLoading} className="w-full relative group/button overflow-hidden rounded-lg mt-6">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-90 
                    group-hover/button:opacity-100 transition-opacity duration-300"
                  />
                  <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                    {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <span className="text-[15px] text-white font-semibold tracking-wide">
                      {userInfo?.profileSetup ? `${PROFILE_STRINGS.UPDATE_PROFILE}` : `${PROFILE_STRINGS.COMPLETED_PROFILE}`}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
