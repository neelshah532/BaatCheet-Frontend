import { create } from 'zustand'
import { createAuthSlice } from './slices/AuthSlices'
import { AuthState } from '../types'

export const useAppStore = create<AuthState>((...set) => ({
  ...createAuthSlice(...set),
}))
