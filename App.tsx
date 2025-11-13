
import React, { useState, useCallback } from 'react';
import { PROPERTY_TYPES, PROPERTY_CONDITIONS } from './constants';
import type { PropertyDetails, EstimationResult } from './types';
import { estimatePropertyPrice } from './services/geminiService';
import Loader from './components/Loader';

const initialFormData: PropertyDetails = {
  type: PROPERTY_TYPES[0],
  location: '',
  area: 50,
  rooms: 2,
  condition: PROPERTY_CONDITIONS[0],
  description: '',
};

function App() {
  const [formData, setFormData] = useState<PropertyDetails>(initialFormData);
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number';
    setFormData(prev => ({
      ...prev,
      [name]: isNumberInput ? parseFloat(value) : value,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.location || !formData.area || !formData.rooms) {
      setError("Будь ласка, заповніть обов'язкові поля: місцезнаходження, площа та кількість кімнат.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const estimation = await estimatePropertyPrice(formData);
      setResult(estimation);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Сталася невідома помилка.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
            AI Оцінювач Нерухомості
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Отримайте миттєву оцінку вартості вашого житла в Україні
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Деталі об'єкта</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Місцезнаходження (місто, район)*</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="напр. Київ, Печерський район" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Площа (м²)*</label>
                  <input type="number" id="area" name="area" value={formData.area} onChange={handleInputChange} required min="1" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">К-сть кімнат*</label>
                  <input type="number" id="rooms" name="rooms" value={formData.rooms} onChange={handleInputChange} required min="1" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип нерухомості</label>
                <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Стан</label>
                <select id="condition" name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                  {PROPERTY_CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Додатковий опис</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500" placeholder="напр. панорамні вікна, близькість до метро, розвинена інфраструктура"></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-300">
                {loading ? 'Оцінюємо...' : 'Розрахувати вартість'}
              </button>
            </form>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center">
             <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">Результат оцінки</h2>
            {loading && <Loader />}
            {error && <div className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">{error}</div>}
            {result && !loading && (
              <div className="w-full text-center animate-fade-in">
                <p className="text-lg text-gray-600 dark:text-gray-300">Орієнтовна ринкова вартість</p>
                <p className="text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-400 my-2">
                  {new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(result.estimated_price_uah)}
                </p>
                <p className="font-medium text-gray-700 dark:text-gray-200 mb-6">{result.price_range_uah} ₴</p>
                <div className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Обґрунтування ціни:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{result.justification}</p>
                </div>
              </div>
            )}
            {!result && !loading && !error && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <p className="mt-4">Заповніть форму, щоб отримати оцінку вашої нерухомості.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
