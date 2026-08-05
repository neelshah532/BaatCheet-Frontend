import { useEffect, useState } from 'react'
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
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleLogout = async () => {
    try {
      const response = await http.post('/api/auth/logout', {}, { withCredentials: true })
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
    }
  }, [userInfo])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-5 w-full border-t border-white/[0.08] bg-[#0D0E12]/95 backdrop-blur-xl z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 flex-shrink-0">
          {imagePreview ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-md overflow-hidden"
              style={{ backgroundColor: colors[selectedColorIndex] }}
            >
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md border border-white/20"
              style={{ backgroundColor: colors[selectedColorIndex] }}
            >
              {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName[0]}${userInfo?.lastName[0]}`.toUpperCase() : '?'}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0D0E12]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white truncate">
            {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName}` : 'Profile'}
          </span>
          <span className="text-[10px] text-white/40 truncate font-mono">{userInfo?.email || 'online'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Tooltip content="Edit Profile" direction="top">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            aria-label="Edit Profile"
          >
            <FiEdit2 className="text-sm" />
          </button>
        </Tooltip>
        <Tooltip content="Logout" direction="top">
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/10"
            aria-label="Logout"
          >
            <IoPowerSharp className="text-sm" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default ProfileInfo
