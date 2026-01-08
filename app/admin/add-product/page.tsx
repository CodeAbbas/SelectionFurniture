// app/admin/add-product/page.tsx
import AdminProductChat from '../../components/AdminProductChat'; // Ensure this path matches where you saved the component

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="mb-4 text-gray-600">
            Paste a product URL below to generate the JSON for products.js.
          </p>
          {/* This renders the chat component we created earlier */}
          <AdminProductChat />
        </div>
      </div>
    </div>
  );
}