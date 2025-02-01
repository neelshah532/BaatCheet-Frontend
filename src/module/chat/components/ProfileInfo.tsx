import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../../store/store'
import { colors } from '../../../constants/color'
import Tooltip from '../../../common/ToolTip'
import { FiEdit2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { IoPowerSharp } from 'react-icons/io5'
import http from '../../../services/http'
import { toast } from 'sonner'
import { handleError } from '../../../common/HandleError'

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore()
  const navigate = useNavigate()
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0)

  //   const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleLogout = async () => {
    try {
      const response = await http.post('/api/auth/logout', {}, { withCredentials: true })
      console.log(response)
      toast.success(response.data.message)
      navigate('/login')
      setUserInfo(undefined)
    } catch (error) {
      handleError(error)
    }
  }

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setSelectedColorIndex((userInfo?.color as number) || 0)
      setImagePreview(userInfo?.userImage ? `${import.meta.env.VITE_LOCAL_HOST}/${userInfo.userImage}` : '')
      //   console.log('Image:', userInfo)
    }
  }, [userInfo])

  return (
    <div className="absolute bottom-0 h-16 flex  items-center justify-between px-8 w-full bg-[#2a2b33]">
      <div className="w-full flex items-center justify-start gap-5">
        <div className="relative w-12 h-12">
          {imagePreview ? (
            <div>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
                <img src={imagePreview} alt="Profile Preview" className="w-12 h-12 rounded-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
              {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName[0]}${userInfo?.lastName[0]}`.toUpperCase() : '?'}
            </div>
          )}
        </div>
        <div>{userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName} ` : ''}</div>
      </div>
      <div className="flex items-center gap-3">
        <Tooltip content="Edit Your Profile" direction="top">
          <FiEdit2 className="text-purple-400 text-xl font-medium" onClick={() => navigate('/profile')} />
        </Tooltip>
        <Tooltip content="Edit Your Profile" direction="top">
          <IoPowerSharp className="text-red-400 text-xl font-medium" onClick={handleLogout} />
        </Tooltip>
      </div>
    </div>
  )
}

export default ProfileInfo
