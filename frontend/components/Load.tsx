import LoaderIcon from '../public/icons/load.svg'

type LoadProps = {
  className?: string
}

const Load = ({ className }: LoadProps) => {
  // We render the imported SVG component.
  // We can pass a className to it to control its size, color, and animation.
  return <LoaderIcon className={`h-5 w-5 ${className ?? ''}`} />
}

export default Load
