interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}
export default function Menu({ items }: { items: MenuItem[] }) {
  return (
    

  
  <ul className="menu">
    {items.map((item) => (
      <li key={item.label} className="menu__item">
        <span className="menu__icon">{item.icon}</span>
        <button onClick={item.onClick} className="menu__button">{item.label}</button>
      </li>
    ))}
  </ul>

  )
}
