import { AxiosError } from 'axios'
import { toast } from 'sonner'

interface ErrorResponse {
  status: number
  message: string
}

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    if ((error as AxiosError<ErrorResponse>).isAxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>
      if (axiosError.response) {
        console.error('Response Error:', axiosError.response)
        toast.error(axiosError.response.data?.message || 'Something went wrong')
      } else if (axiosError.request) {
        console.error('Request Error:', axiosError.request)
        toast.error('No response from server. Please try again.')
      } else {
        console.error('Error:', axiosError.message)
        toast.error(axiosError.message || 'An unexpected error occurred')
      }
    } else {
      console.error('Non-Axios Error:', error.message)
      toast.error(error.message || 'An unknown error occurred')
    }
  } else {
    console.error('Unknown Error Type:', error)
    toast.error('An unknown error occurred')
  }
}
