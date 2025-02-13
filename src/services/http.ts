import axios from 'axios'
// import { Adminlogout } from '../redux/userSlice';

// import { userToken } from 'utils'

export interface ApiErrorData {
  message: string
}

// Create a map to store the AbortController instances

// Create instance of axios
const http = axios.create({
  baseURL: `${import.meta.env.VITE_LOCAL_HOST}`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

export default http
