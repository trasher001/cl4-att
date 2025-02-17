import { AlertTriangle } from "lucide-react";

export default function TemporaryDownPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <AlertTriangle className="text-yellow-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Site Temporariamente Desativado</h1>
        <p className="text-gray-600 mb-4">
          Estamos passando por manutenções e voltaremos em breve. Agradecemos sua paciência!
        </p>
        <p className="text-gray-500 text-sm">Tente novamente mais tarde.</p>
      </div>
    </div>
  );
}
