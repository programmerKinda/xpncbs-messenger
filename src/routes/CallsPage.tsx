import { MdAddIcCall } from "react-icons/md";
import CommonSidebar from '@/shared/components/CommonSidebar'
import { Calculator } from "lucide-react";

export default function Calls() {


  return (
    <>
      <CommonSidebar
        title="Звонки"
        resize={true}
        bodyContent={<><div></div></>} 
        popupButton={{
          icon: <MdAddIcCall />,
          menuItems: [
            { label: 'Новый звонок', icon: <MdAddIcCall />, onClick: () => console.log('Новый звонок') },
            { label: 'Новая конференция', icon: <Calculator />, onClick: () => console.log('Новая конференция') },
          ],

        }}
      />
       
      
    </>
  )
}
