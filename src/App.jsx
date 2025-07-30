import {Routes, Route ,Navigate, BrowserRouter} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import Admin from "./pages/Admin";
import AdminPanel from "./components/admin/AdminProblem";
import ProblemPage from "./pages/ProblemPage"
import AdminDelete from "./components/admin/AdminDelete"
import AdminVideo from "./components/admin/AdminVideo";
import AdminUpload from "./components/admin/AdminUpload";
import OTPVerification from "./pages/OTPVerification" ;
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminUpdate from "./components/admin/AdminUpdate";
import ProfilePage from "./pages/ProfilePage";
import ContestCreationPage from "./components/ContestCreationPage";
import ContestDetailPage from "./pages/ContestDetailPage" ;
import ContestsListPage from "./pages/ContestListPage";
import LeaderboardPage from "./pages/LeaderBoardPage";
import PlansPage from "./pages/PlansPage";
import PaymentCanceled from "./components/payment/PaymentCanceled";
import PaymentSuccess from "./components/payment/PaymentSuccess";
import PremiumDetails from "./components/payment/PremiumDetails";
import EditProfilePage from "./pages/profile/EditProfilePage";
import WishListPage from "./pages/WishlistPage" ;

function App(){
  
  const dispatch = useDispatch();
  const {user,isAuthenticated,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
 
  <BrowserRouter>
    <Routes>
      <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/profilePage" element={<ProfilePage></ProfilePage>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
      {/* <Route path="/admin" element={<AdminPanel/>}></Route> */}
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate/> : <Navigate to="/" />} />
      <Route path="/admin/update-problem/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel/> : <Navigate to="/" />} />

      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />

      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/admin/contest" element={isAuthenticated && user?.role === 'admin' ? <ContestCreationPage/> : <Navigate to='/' />}></Route>

      <Route path="/contest/:id" element={isAuthenticated && <ContestDetailPage/>} ></Route>

      <Route path="/contest/ContestListPage" element={isAuthenticated && <ContestsListPage/>} ></Route>

      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      <Route path="/contest/:contestId/problem/:problemId" element={<ProblemPage/>}></Route>
      <Route path="/contest/:id/leaderboard" element={<LeaderboardPage></LeaderboardPage>}></Route>
      
      <Route path="/OTPVerification/:emailId/:firstName" element={<OTPVerification></OTPVerification>}></Route>

      <Route path="/plansPage" element={<PlansPage></PlansPage>}></Route>

      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-canceled" element={<PaymentCanceled />} />

      <Route path="/my-premium" element={<PremiumDetails/>}></Route>

      <Route path="/profile/edit" element={<EditProfilePage/>}></Route>

       <Route path="/wishlist" element={<WishListPage />} />

    </Routes>
  </BrowserRouter>

  <ToastContainer position="top-right"
    autoClose={3000} // Close after 5 seconds
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
  />
  </>
  )
}

export default App;