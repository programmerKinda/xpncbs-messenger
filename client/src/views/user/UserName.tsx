export default function UserName({
  name,
  phone,
  contactName,
}: {
  name: string
  phone: string
  contactName: string
}) {
  return <span className="user-name">{contactName ? contactName : name || phone}</span>
}
