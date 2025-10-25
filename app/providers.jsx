'use client'

import {HeroUIProvider} from '@heroui/react'
import {PWARegister} from './pwa-register'

export function Providers({children}) {
  return (
    <HeroUIProvider>
      <PWARegister />
      {children}
    </HeroUIProvider>
  )
}