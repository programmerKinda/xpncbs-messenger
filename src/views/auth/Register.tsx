export default function Register() {
  return (
    <div className="register">
      <h2 className="text-gray-700">Register</h2>
      <form>
        <input type="text" placeholder="Username" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button className="text-gray-700" type="submit">
          Register
        </button>
      </form>
    </div>
  )
}
