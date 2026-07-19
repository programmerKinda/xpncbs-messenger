export default function Login() {
  return (
    <div className="login">
      <h2 className="text-gray-700">Login</h2>
      <form>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button className="text-gray-700" type="submit">
          Login
        </button>
      </form>
    </div>
  )
}
