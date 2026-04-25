import { useState, useEffect, useRef } from 'react';
import { supabase } from '/utils/supabase/client';
import { SignIn } from './components/SignIn';
import { RefractionLoader } from './components/RefractionLoader';
import { BiasHeatmap } from './components/BiasHeatmap';
import { SourceCredibility } from './components/SourceCredibility';
import { ResearchHistory } from './components/ResearchHistory';
import { AnalysisCard } from './components/AnalysisCard';
import { VerdictBlock } from './components/VerdictBlock';
import { RatingSystem } from './components/RatingSystem';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Mic, MicOff, Search, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisResult {
  thesis: string;
  antithesis: string;
  synthesis: string;
  verdict: string;
  bias_score: number;
  timestamp: string;
  query: string;
  rating?: number;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [rating, setRating] = useState(0);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [currentBiasPreview, setCurrentBiasPreview] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    checkSession();
    // Check if voice recognition is supported
    const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setVoiceSupported(isSupported);
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      loadHistory();
    }
  }, [user, accessToken]);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (session?.user) {
      setUser(session.user);
      setAccessToken(session.access_token);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5706d5c6/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    await handleSignIn(email, password);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken('');
    setResult(null);
    setHistory([]);
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5706d5c6/history`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.log('Failed to load history:', error);
    }
  };

  const handleAnalyze = async (searchQuery?: string) => {
    const queryToAnalyze = searchQuery || query;
    if (!queryToAnalyze.trim()) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5706d5c6/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ query: queryToAnalyze }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);

      if (user && accessToken) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5706d5c6/save-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ analysis: analysisResult }),
        });

        loadHistory();
      }
    } catch (error) {
      console.log('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const startVoiceInput = () => {
    if (!voiceSupported) {
      alert('Voice input not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setIsListening(false);
      alert('Failed to start voice recognition. Please try again.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleHistorySelect = (item: AnalysisResult) => {
    setQuery(item.query);
    setResult(item);
    setRating(item.rating || 0);
  };

  const handleRate = async (newRating: number) => {
    setRating(newRating);
    if (result) {
      const updatedResult = { ...result, rating: newRating };
      setResult(updatedResult);

      // Save updated rating to history
      if (user && accessToken) {
        try {
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5706d5c6/save-analysis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ analysis: updatedResult }),
          });
        } catch (error) {
          console.log('Failed to save rating:', error);
        }
      }
    }
  };

  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      const emotionalKeywords = [
        'excellent', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'outstanding', 'perfect', 'incredible', 'exceptional', 'magnificent',
        'terrible', 'awful', 'horrible', 'disgusting', 'atrocious', 'pathetic', 'abysmal', 'dreadful', 'deplorable', 'appalling',
        'always', 'never', 'everyone', 'nobody', 'absolutely', 'completely', 'totally', 'obviously', 'clearly', 'definitely'
      ];

      let emotionalCount = 0;
      const words = lowerQuery.split(/\s+/);

      for (const word of words) {
        if (emotionalKeywords.some(kw => word.includes(kw))) {
          emotionalCount++;
        }
      }

      const biasScore = Math.min(100, (emotionalCount / Math.max(words.length, 1)) * 200);
      setCurrentBiasPreview(Math.round(biasScore));
    } else {
      setCurrentBiasPreview(0);
    }
  }, [query]);

  if (loading) {
    return <RefractionLoader />;
  }

  if (!user) {
    return <SignIn onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {analyzing && <RefractionLoader />}

      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/src/imports/prism.jpeg"
                alt="PRISM Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight">PRISM</h1>
                <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">The Spectrum of Truth</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !analyzing && handleAnalyze()}
              placeholder={isListening ? "Listening..." : "Enter research query for dialectical analysis..."}
              className={`w-full bg-white/5 border rounded-xl py-4 pl-12 pr-32 text-white placeholder-gray-500 focus:outline-none backdrop-blur-xl transition-all ${
                isListening ? 'border-red-500/50 animate-pulse' : 'border-white/10 focus:border-purple-500/50'
              }`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            {query && currentBiasPreview > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute left-12 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-medium ${
                  currentBiasPreview < 30
                    ? 'bg-green-500/20 text-green-400'
                    : currentBiasPreview < 60
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {currentBiasPreview < 30 ? 'Neutral' : currentBiasPreview < 60 ? 'Biased' : 'Highly Biased'}
              </motion.div>
            )}

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {voiceSupported && (
                <button
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-300 border border-white/10'
                  }`}
                  title={isListening ? 'Click to stop recording' : 'Click to start voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => handleAnalyze()}
                disabled={!query.trim() || analyzing}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
              >
                Analyze
              </button>
            </div>
          </div>

          {isListening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-red-400 mt-2"
            >
              🎤 Microphone active - Speak now...
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <BiasHeatmap score={result?.bias_score || 0} />
            <SourceCredibility />
            <ResearchHistory history={history} onSelect={handleHistorySelect} />
          </div>

          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Current Query</p>
                      <p className="text-sm text-gray-200 font-medium">{result.query}</p>
                    </div>
                    <RatingSystem onRate={handleRate} currentRating={rating} />
                  </div>
                </motion.div>

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mb-4"
                  >
                    <p className="text-xs text-gray-500 tracking-widest uppercase">The Refraction</p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <AnalysisCard
                      title="Thesis"
                      content={result.thesis}
                      type="thesis"
                      delay={0.1}
                    />
                    <AnalysisCard
                      title="Antithesis"
                      content={result.antithesis}
                      type="antithesis"
                      delay={0.3}
                    />
                  </div>
                </div>

                <AnalysisCard
                  title="Synthesis"
                  content={result.synthesis}
                  type="synthesis"
                  delay={0.5}
                />

                <VerdictBlock
                  verdict={result.verdict}
                  query={result.query}
                  thesis={result.thesis}
                  antithesis={result.antithesis}
                  synthesis={result.synthesis}
                  biasScore={result.bias_score}
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-12 text-center"
              >
                <img
                  src="/src/imports/prism.jpeg"
                  alt="PRISM"
                  className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl"
                />
                <h2 className="text-xl font-semibold mb-2">Ready for Analysis</h2>
                <p className="text-gray-400 text-sm">
                  Enter a research query to begin dialectical synthesis
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}