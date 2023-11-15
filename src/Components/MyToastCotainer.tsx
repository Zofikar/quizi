'use client'
import { Slide, ToastContainer } from 'react-toastify'

export default function MyToastCotainer() {
  return (
    <ToastContainer
    position="top-center"
    autoClose={5000}
    closeOnClick
    pauseOnHover
    theme="dark"
    transition={Slide}
  />
  )
}
