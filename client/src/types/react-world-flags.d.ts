declare module 'react-world-flags' {
  import type { ImgHTMLAttributes, JSX } from 'react'

  interface FlagProps extends ImgHTMLAttributes<HTMLImageElement> {
    code: string
  }

  const FlagModule: {
    default: (props: FlagProps) => JSX.Element
  }

  export default FlagModule
}