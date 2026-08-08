interface CommonWindowHeaderProps {
  children: React.ReactNode
}

export default function CommonWindowHeader({ children }: CommonWindowHeaderProps) {
  return <header className="common-window__header">{children}</header>
}
