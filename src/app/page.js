"use client";

import { useState } from "react";
import { X, Shield, Zap, Flame, Send, Sparkles } from "lucide-react";

export default function NoAsAService() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [selectedMode, setSelectedMode] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);

  const modes = [
    {
      id: "normal",
      label: "Normal",
      icon: Shield,
      description: "Polite but firm",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "moderate",
      label: "Moderate",
      icon: Zap,
      description: "Direct and assertive",
      color: "from-orange-500 to-yellow-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: "savage",
      label: "Savage",
      icon: Flame,
      description: "Brutally honest",
      color: "from-red-500 to-pink-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  async function handleGenerate() {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: prompt,
          mode: selectedMode
        }),
      });
      const data = await res.json();
      
      if (data.error) {
        setResponse("Sorry, something went wrong. Please try again.");
      } else {
        setResponse(data.geminiResponse);
      }
    } catch (error) {
      setResponse("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedModeData = modes.find(mode => mode.id === selectedMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-2xl">
              <X className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            No as a Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Need to decline a request but don&apos;t know how? Let AI craft the perfect &quot;no&quot; for any situation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 mb-8 shadow-2xl">
            <div className="mb-6">
              <label className="block text-white text-lg font-semibold mb-3">
                What do you need to say no to?
              </label>
              <div className="relative">
                <textarea
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg"
                  rows={4}
                  placeholder="e.g., My friend wants me to go to their party but I'm exhausted..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-purple-400 opacity-50" />
              </div>
            </div>

            {/* Mode Selection */}
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4">
                Choose your rejection style:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected 
                          ? `${mode.borderColor} ${mode.bgColor} shadow-2xl` 
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full mb-3 bg-gradient-to-r ${mode.color} ${isSelected ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'} transition-opacity duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={`font-bold text-lg mb-2 ${isSelected ? mode.textColor : 'text-white'}`}>
                          {mode.label}
                        </h3>
                        <p className={`text-sm ${isSelected ? mode.textColor + '/80' : 'text-gray-400'}`}>
                          {mode.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 pointer-events-none"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className={`w-full py-4 px-8 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                selectedModeData 
                  ? `bg-gradient-to-r ${selectedModeData.color} text-white shadow-2xl hover:shadow-3xl` 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-3xl'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Crafting your perfect &quot;no&quot;...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Generate Perfect Rejection</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Response Section */}
          {response && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full bg-gradient-to-r ${selectedModeData?.color} mr-4`}>
                  {selectedModeData && <selectedModeData.icon className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Your {selectedModeData?.label} Response
                </h3>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="prose prose-invert max-w-none">
                  {response.split('\n').map((paragraph, index) => {
                    if (paragraph.trim() === '') return null;
                    
                    // Check if it's a numbered point
                    const numberedMatch = paragraph.match(/^(\d+\.\s*)(.*)/);
                    if (numberedMatch) {
                      return (
                        <div key={index} className="mb-4 flex items-start">
                          <span className={`inline-block w-8 h-8 rounded-full text-sm font-bold items-center justify-center mr-3 mt-1 bg-gradient-to-r ${selectedModeData?.color} text-white flex-shrink-0`}>
                            {numberedMatch[1].replace('.', '')}
                          </span>
                          <p className="text-white text-lg leading-relaxed m-0 flex-1">
                            {numberedMatch[2]}
                          </p>
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="text-white text-lg leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    );
                  }).filter(Boolean)}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all duration-300 hover:scale-105"
                >
                  Copy Response
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-400">
            Sometimes the best answer is a well-crafted &quot;no&quot; ✨
          </p>
        </div>
      </div>
    </div>
  );
}