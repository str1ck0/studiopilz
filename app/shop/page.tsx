import { Silkscreen } from 'next/font/google'
import PixelSad from '@/components/shop/PixelSad'

export const metadata = {
  title: 'Shop | Studio Pilz',
}

const pixelFont = Silkscreen({ weight: '400', subsets: ['latin'] })

export default function ShopPage() {
  // exactly one screen tall; the footer is pinned over the bottom padding
  return (
    <main className="flex h-svh items-center justify-center overflow-hidden px-4 pb-28 pt-24 sm:px-6 sm:pb-20">
      <PixelSad text="waiting for the aliens to let us onto the next, higher timeline" fontClass={pixelFont.className} />
    </main>
  )
}
