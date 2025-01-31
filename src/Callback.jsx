import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {useSpotifyStore} from './spotify/auth'

const Callback = () => {
  const handleRedirect = useSpotifyStore((state) => state.handleRedirect)
  const navigate = useNavigate()
  const isProcessing = useRef(false)

  console.log("Callback component")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    console.log(params.toString()) 
    const code = params.get('code')
    if (code && !isProcessing.current) {
      console.log("Handling redirect")
      isProcessing.current = true
      handleRedirect(code).then(() => {
        navigate('/')
      })
    } else {
      const error = params.get('error')
      if (error) {
        console.log(`err: ${error}`)
        navigate('/')
      }
    }
  }, [handleRedirect, navigate, window.location.search])

  return <div>Loading... </div>
}

export default Callback