'use client'

import {HeroUIProvider} from '@heroui/react'
import {PWARegister} from './pwa-register'
import {useEffect} from 'react'

export function Providers({children}) {
  useEffect(() => {
    // Definir tema no lado do cliente
    document.documentElement.classList.add('light')
  }, [])

  return (
    <HeroUIProvider>
      <PWARegister />
      {children}
    </HeroUIProvider>
  )
}