
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
          <Route path="/settings" element={<div>Settings</div>}/>
          <Route path="/contacts" element={<div>Contacts</div>}/>
          <Route path="/calls" element={<div>Calls</div>}/>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


    


export default App;
