
import MainLayout from "./views/layouts/MainLayout";
import MainPage from "./routes/MainPage";
import { Routes, Route,BrowserRouter} from "react-router-dom";
// import Login from "../views/auth/Login";
// import Register from "../views/auth/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
        <Route path="/" element={<MainPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


    


export default App;
