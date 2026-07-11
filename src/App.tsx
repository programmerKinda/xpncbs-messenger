
import MainLayout from "./routes/MainLayout";
import { Routes, Route,BrowserRouter} from "react-router-dom";
// import Login from "../views/auth/Login";
// import Register from "../views/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
      </Routes>
    </BrowserRouter>
  );
}


    


export default App;
