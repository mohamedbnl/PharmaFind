import React, { useState, useRef } from 'react';
import { Bot, Send, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { analyzeText, analyzeImage } from '@/services/ai.service';
import { AIResponse } from '@/types/ai';

interface AIAssistantPanelProps {
  onResults: (response: AIResponse) => void;
  onError: (error: Error) => void;
  onClear: () => void;
}

export function AIAssistantPanel({ onResults, onError, onClear }: AIAssistantPanelProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      // Pass dummy location for demo purposes (Tangier coords for PharmaFind sample data)
      const lat = 35.7595;
      const lng = -5.8340;
      const response = await analyzeText(text, lat, lng);
      onResults(response);
    } catch (err: any) {
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!image) return;

    setIsLoading(true);
    try {
      const lat = 35.7595;
      const lng = -5.8340;
      const response = await analyzeImage(image, lat, lng);
      onResults(response);
    } catch (err: any) {
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError(new Error("Le fichier doit être une image."));
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setText(''); // Clear text when image is selected
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
        <Bot className="w-5 h-5" />
        <h2>Assistant IA PharmaFind</h2>
      </div>

      <p className="text-sm text-gray-600">
        Décrivez vos besoins en langage naturel ou téléchargez une ordonnance pour trouver les meilleures pharmacies.
      </p>

      {/* Input Area */}
      <div className="space-y-3">
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Prescription preview" className="max-h-48 rounded-lg border object-contain" />
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 transition"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex: Je cherche du Doliprane 1000mg et de l'Augmentin..."
            className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-500"
            disabled={isLoading}
            dir="auto"
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition px-2 py-1 bg-gray-50 rounded border disabled:opacity-50"
              disabled={isLoading || !!imagePreview}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ordonnance</span>
            </button>
          </div>

          <button
            type="button"
            onClick={imagePreview ? handleImageSubmit : handleTextSubmit}
            disabled={isLoading || (!text.trim() && !imagePreview)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyse...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Chercher</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
