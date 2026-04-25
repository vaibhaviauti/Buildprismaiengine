import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Volume2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface VerdictBlockProps {
  verdict: string;
  query: string;
  thesis: string;
  antithesis: string;
  synthesis: string;
  biasScore: number;
}

export function VerdictBlock({ verdict, query, thesis, antithesis, synthesis, biasScore }: VerdictBlockProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayText('');
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < verdict.length) {
        setDisplayText(verdict.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [verdict]);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(verdict);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    pdf.setFontSize(20);
    pdf.text('PRISM Analysis Report', margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(new Date().toLocaleString(), margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.text('Query:', margin, yPosition);
    yPosition += 7;
    pdf.setFontSize(10);
    const queryLines = pdf.splitTextToSize(query, maxWidth);
    pdf.text(queryLines, margin, yPosition);
    yPosition += queryLines.length * 5 + 10;

    pdf.setFontSize(12);
    pdf.text(`Bias Score: ${biasScore}/100`, margin, yPosition);
    yPosition += 15;

    const addSection = (title: string, content: string) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFontSize(12);
      pdf.setTextColor(0);
      pdf.text(title, margin, yPosition);
      yPosition += 7;
      pdf.setFontSize(10);
      pdf.setTextColor(50);
      const lines = pdf.splitTextToSize(content, maxWidth);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 10;
    };

    addSection('Thesis (Affirmative Position)', thesis);
    addSection('Antithesis (Counterargument)', antithesis);
    addSection('Synthesis (Integration)', synthesis);
    addSection('Verdict', verdict);

    pdf.save(`PRISM-Analysis-${Date.now()}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Final Verdict</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSpeak}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Read aloud"
          >
            <Volume2 className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="font-mono text-sm text-gray-200 leading-relaxed">
        {displayText}
        {isTyping && <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />}
      </div>
    </motion.div>
  );
}
