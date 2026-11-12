import { Silkscreen } from 'next/font/google'
import PixelSad from '@/components/shop/PixelSad'

export const metadata = {
  title: 'Shop | Studio Pilz',
}

const pixelFont = Silkscreen({ weight: '400', subsets: ['latin'] })

export default function ShopPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 pb-16 pt-28 sm:px-6">
      <PixelSad text="waiting for the aliens to let us onto the next, higher timeline" fontClass={pixelFont.className} />
    </main>
  )
}
