import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Register from "./pages/Register";
import Notelist from "./pages/Notelist";
import NoteEditor from "./pages/NoteEditor";
import Users from "./pages/Users";

const queryClient = new QueryClient()

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route index element={<Home/>} />
			<Route path="signin" element={<Signin/>}></Route>
			<Route path="register" element={<Register/>}></Route>
			<Route path="note" element={<Notelist/>}></Route>
			<Route path="edit" element={<NoteEditor/>}></Route>
			<Route path="user/:id" element={<Users/>}></Route>

			{/* <Route path="product" element={<Product />} />
			<Route path="product/add" element={<AddProduct />} />
			<Route path="product/:id" element={<ProductDetail/>}/>
			<Route path="product/:id/edit" element={<EditProduct/>}/> */}
			
		</Route>
	));
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</>
	)
}

export default App
