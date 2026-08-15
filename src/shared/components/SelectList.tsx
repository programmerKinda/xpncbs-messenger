import { useState,useRef,useEffect } from "react"

interface SelectListProps{
    list:string[]
    defaultValue?:string
}


export default function SelectList({list,defaultValue}:SelectListProps){
    const [selected,setSelected] = useState(defaultValue? defaultValue : 'Не выбрано') 
    const [isOpen ,setIsOpen] = useState(false)
    const selectItem = (item:string)=>{
        setSelected(item)
        setIsOpen(false)
    }
    const ref = useRef<HTMLParagraphElement>(null)
    const [height,setHeight] = useState<number>()
    useEffect(()=>{
    const el = ref.current
    if (el ){
        setHeight(el.clientHeight)
    } 
    },[])
  return(
    <>   {isOpen && (<div className="absolute inset-0 z-10000" onClick={()=>{setIsOpen(false)}}></div>)} <div className="select-list relative">
      <p onClick={()=>{setIsOpen(!isOpen)}} ref={ref}>{selected}</p>
      {isOpen && (<><ul className="select-list-dropdown" style={{top:height+'px'}}>
        {list.map((item)=>(<><li className="select-list-item" onClick={()=>{selectItem(item)}}>
            {item}
            </li></>))}
        </ul></>)}
    </div></>

  )
}