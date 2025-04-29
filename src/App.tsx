import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Register from "./pages/Register";
import Notelist from "./pages/Notelist";
import Users from "./pages/Users";
import NoteEdit from "./pages/NoteEdit";
import NoteAdd from "./pages/NoteAdd";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import { AuthProvider } from "./utils/AuthProvider";
import BaseLayout from "./layouts/BaseLayout";
import FolderList from "./pages/FolderList";
import AddFolderPage from "./pages/AddFolderPage";
import NoteView from "./pages/NoteView";

const queryClient = new QueryClient()

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
		<Route>	

				<Route path="/" element={<BaseLayout/>}>
					<Route path="register" element={<PublicRoute><Register/></PublicRoute>}></Route>
					<Route path="Signin" element={<PublicRoute><Signin/></PublicRoute>}></Route>
				</Route>

				<Route path="/" element={<RootLayout/>}>
					<Route path="/note/:id" element={<PrivateRoute><Notelist/></PrivateRoute>}></Route>
					<Route path="note/edit/:id" element={<PrivateRoute><NoteEdit/></PrivateRoute>}></Route>
					<Route path="notes/add/:folderId" element={<PrivateRoute><NoteAdd/></PrivateRoute>}></Route>
					<Route path="folder" element={<PrivateRoute><FolderList/></PrivateRoute>}></Route>
					<Route path="folders/add" element={<PrivateRoute><AddFolderPage/></PrivateRoute>}></Route>
					<Route path="user" element={<PrivateRoute><Users/></PrivateRoute>}></Route>
					<Route path="note/view/:noteId" element={<PrivateRoute><NoteView/></PrivateRoute>}></Route>

				</Route>

				<Route path="/" element={<BaseLayout/>}>
					<Route index element={<Home/>}></Route>
				</Route>
				
		</Route>
	));
	return (
		<>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</AuthProvider>
		</>
	)
}

export default App

