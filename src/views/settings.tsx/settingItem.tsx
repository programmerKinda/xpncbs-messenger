import { Subtitles } from "lucide-react";
import type { ReactNode } from "react";

interface settingItem{
  icon: React.ReactNode
  title: string
  subtitle: string

  
}
export default function SettingItem({icon,title,subtitle}:settingItem){
    return(  <div className="setting-item">
    <span className="setting-item__icon">{icon}</span>
    <div className="setting-item__info"><h2 className="setting-item__title">{title}</h2>
    <span className="setting-item-subtitle">{subtitle}</span></div>
    
    
  </div>)

}