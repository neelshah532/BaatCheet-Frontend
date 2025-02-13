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
      // console.log(response)
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

  // console.log('Image:', imagePreview)
  // console.log('User:', userInfo)

  return (
    <div className="absolute bottom-0 h-16 flex  items-center justify-between px-8 w-full border-t border-white/[0.05] bg-[#0C0C14]">
      <div className="w-full flex items-center justify-start gap-5">
        <div className="relative w-12 h-12">
          <div className="fixed inset-0 -z-50">
            {/* <div className="absolute inset-0 bg-[#080810]">
              <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)]" />
            </div> */}
            {/* <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-[600px] h-[600px] rounded-full 
                ${i === 0 ? 'top-[-300px] left-[-200px] bg-blue-500/10' : i === 1 ? 'top-[-200px] right-[-250px] bg-purple-500/10' : 'bottom-[-300px] left-[20%] bg-indigo-500/10'} 
                blur-[120px] animate-blob animation-delay-${i * 2000}`}
                />
              ))}
            </div> */}
          </div>
          {imagePreview ? (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[selectedColorIndex] }}>
              <img src={imagePreview} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: colors[selectedColorIndex] }}>
              {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName[0]}${userInfo?.lastName[0]}`.toUpperCase() : '?'}
            </div>
          )}
        </div>
        <div className="text-sm font-medium text-white">{userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName} ` : ''}</div>
      </div>
      <div className="flex items-center gap-3">
        <Tooltip content="Edit Your Profile" direction="top">
          <FiEdit2 className="text-gray-400 text-xl font-medium rounded-lg hover:bg-[#1C1C24] transition-colors" onClick={() => navigate('/profile')} />
        </Tooltip>
        <Tooltip content="Edit Your Profile" direction="top">
          <IoPowerSharp className="text-red-400 text-xl font-medium rounded-lg hover:bg-[#1C1C24] transition-colors" onClick={handleLogout} />
        </Tooltip>
      </div>
    </div>
  )
}

export default ProfileInfo
