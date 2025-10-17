import MagnifyingIcon from '../public/icons/magnifying.svg'

type IconProps = {
  className?: string
}

const Magnifying = ({ className }: IconProps) => {
  return <MagnifyingIcon className={`h-4 w-4 ${className ?? ''}`} />
}

export default Magnifying
