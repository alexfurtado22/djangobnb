import Link from 'next/link'
import AirbnbLogo from '../public/icons/airbnb.svg'
import { APP_NAME } from '@/lib/constants'

type LogoProps = {
  className?: string
  onClick?: () => void
}

const Logo = ({ className, onClick }: LogoProps) => {
  return (
    <Link href="/" aria-label={APP_NAME} onClick={onClick}>
      <AirbnbLogo className={`text-brand h-8 w-auto ${className ?? ''}`} />
    </Link>
  )
}

export default Logo
