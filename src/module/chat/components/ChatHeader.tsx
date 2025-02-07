import React, { useEffect, useState } from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { useAppStore } from '../../../store/store'
import { colors } from '../../../constants/color'

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)

  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])
  // console.log('Color Index:', colorIndex)
  // console.log('Selected Chat:', selectedChatData)

  return (
    <div className="py-4 px-6 backdrop-blur-md bg-[#13131A]/80 border-b border-white/[0.05]">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Profile Image/Avatar */}
          <div className="relative">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ">
              {typeof selectedChatData !== 'string' && selectedChatData?.image ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[colorIndex] }}>
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${selectedChatData.image}`} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: colors[colorIndex] }}>
                  {typeof selectedChatData !== 'string' && selectedChatData?.firstName && selectedChatData?.lastName
                    ? `${selectedChatData.firstName[0]}${selectedChatData.lastName[0]}`.toUpperCase()
                    : '?'}
                </div>
              )}
              {/* Online status indicator */}
              <div className="absolute bottom-1 right-0 w-3 h-3 bg-green-500 rounded-full border-[1.5px] border-[#13131A]" />
            </div>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-white font-semibold">
              {selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData?.firstName
                ? `${selectedChatData?.firstName} ${selectedChatData?.lastName}`
                : typeof selectedChatData !== 'string' && selectedChatData?.email}
            </h2>
            <p className="text-sm text-gray-400">Active now</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={closeChat} className="p-2 rounded-full hover:bg-white/[0.05] text-gray-400 hover:text-white transition-all">
            <RiCloseFill size={24} />
          </button>
        </div>
      </div>
    </div>
  )

  // return (
  //   <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between md:px-20 px-8">
  //     <div className="flex gap-5 items-center justify-between w-full">
  //       <div className="flex gap-3 items-center justify-center">
  //         <div className="relative w-12 h-12 overflow-hidden rounded-full">
  //           {typeof selectedChatData !== 'string' && selectedChatData?.image ? (
  //             <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors[colorIndex] }}>
  //               <img src={`${import.meta.env.VITE_LOCAL_HOST}/${selectedChatData.image}`} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover" />
  //             </div>
  //           ) : (
  //             <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: colors[colorIndex] }}>
  //               {typeof selectedChatData !== 'string' && selectedChatData?.firstName && selectedChatData?.lastName
  //                 ? `${selectedChatData.firstName[0]}${selectedChatData.lastName[0]}`.toUpperCase()
  //                 : '?'}
  //             </div>
  //           )}
  //         </div>
  //         <div className="text-white">
  //           {selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData?.firstName
  //             ? `${selectedChatData?.firstName}  ${selectedChatData?.lastName}`
  //             : typeof selectedChatData !== 'string' && selectedChatData?.email}
  //         </div>
  //       </div>
  //       <div className="flex gap-5 items-center justify-center">
  //         <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={closeChat}>
  //           <RiCloseFill size={24} className="text-3xl" />
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // )
}

export default ChatHeader
