'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import AppShell from '@/components/AppShell';
import { triageService, medicalService } from '@/services/api';

export default function AITriagePage() {
  const { user, loading } = useProtectedRoute();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [triageResult, setTriageResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatRef = useRef(null);

  // Load medical profile on mount
  useEffect(() => {
    const loadMedicalProfile = async () => {
      try {
        const res = await medicalService.getProfile();
        if (res.data?.medicalProfile) {
          setMedicalProfile(res.data.medicalProfile);
        }
      } catch (err) {
        console.error('Failed to load medical profile:', err);
      }
    };
    if (user) loadMedicalProfile();
  }, [user]);

  useEffect(() => {
    // Initial AI greeting
    setMessages([{
      role: 'ai',
      text: 'Hello. I am your PulseGuard AI Triage assistant. Please describe the symptoms you are experiencing, and I will help assess your situation.',
    }]);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setSending(true);

    // Update conversation history
    const updatedHistory = [...conversationHistory, { role: 'user', text: userMessage }];

    try {
      const res = await triageService.assess({
        symptoms: userMessage,
        conversationHistory: updatedHistory,
      });
      const data = res.data;

      // Extract severity info
      const severityLevel = data.severity?.level || data.severity || 'MODERATE';
      const severityColor = data.severity?.color || mapLevelToColor(severityLevel);

      setTriageResult({
        severity: severityColor,
        level: severityLevel,
        score: data.severity?.score,
        confidence: data.severity?.confidence,
        summary: data.summary || 'Assessment complete.',
        recommendation: data.recommendations?.hospital_visit || 'MONITOR',
        possible_conditions: data.possible_conditions || [],
      });

      // Build AI response message
      const aiText = data.summary || 'Based on your symptoms, I recommend consulting a healthcare professional.';

      // Determine which action buttons to show
      const actions = [];
      const recs = data.recommendations || {};
      if (recs.call_emergency_services) actions.push('call_emergency');
      if (recs.activate_sos) actions.push('activate_sos');
      if (recs.show_hospital_finder) actions.push('find_hospital');
      if (recs.notify_contacts) actions.push('notify_contacts');
      if (recs.show_qr_profile) actions.push('show_qr');

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: aiText,
          actions,
          firstAid: data.first_aid || [],
          immediateActions: data.immediate_actions || [],
          possibleConditions: data.possible_conditions || [],
          disclaimer: data.disclaimer || '',
          followUpQuestion: data.follow_up_question || '',
          hospitalVisit: recs.hospital_visit || '',
        },
      ]);

      // Add follow-up question as separate message if present
      if (data.follow_up_question) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: data.follow_up_question,
            isFollowUp: true,
          },
        ]);
      }

      // Update conversation history with AI response
      setConversationHistory([
        ...updatedHistory,
        { role: 'ai', text: aiText },
      ]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'I apologize, but I encountered an issue analyzing your symptoms. Please try again or contact emergency services if you are in immediate danger.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const mapLevelToColor = (level) => {
    const map = { CRITICAL: 'RED', HIGH: 'ORANGE', MODERATE: 'YELLOW', LOW: 'GREEN' };
    return map[level] || 'YELLOW';
  };

  const getSeverityConfig = (color) => {
    switch (color) {
      case 'RED':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: 'emergency',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          label: '🔴 Critical Emergency',
          pill: 'bg-red-100 text-red-700',
        };
      case 'ORANGE':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: 'warning',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          label: '🟠 High Priority',
          pill: 'bg-orange-100 text-orange-700',
        };
      case 'YELLOW':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: 'info',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-700',
          label: '🟡 Moderate',
          pill: 'bg-yellow-100 text-yellow-700',
        };
      case 'GREEN':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: 'check_circle',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          label: '🟢 Low Risk',
          pill: 'bg-green-100 text-green-700',
        };
      default:
        return {
          bg: 'bg-surface-container-low',
          text: 'text-on-surface',
          border: 'border-outline-variant',
          icon: 'help',
          iconBg: 'bg-surface-container',
          iconColor: 'text-on-surface-variant',
          label: 'Assessment',
          pill: 'bg-surface-container text-on-surface-variant',
        };
    }
  };

  const getHospitalVisitLabel = (visit) => {
    switch (visit) {
      case 'IMMEDIATE': return 'Go to hospital immediately';
      case 'TODAY': return 'Visit a hospital today';
      case 'WITHIN_24_HOURS': return 'See a doctor within 24 hours';
      case 'MONITOR': return 'Monitor and seek help if worsening';
      default: return visit;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f9f9f7]"><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <>
      
      <AppShell>
        {/* Severity Banner */}
        {triageResult && (() => {
          const sev = getSeverityConfig(triageResult.severity);
          return (
            <div className={`${sev.bg} rounded-DEFAULT p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] border ${sev.border}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${sev.iconBg} flex items-center justify-center shadow-inner`}>
                  <span className={`material-symbols-outlined ${sev.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{sev.icon}</span>
                </div>
                <div>
                  <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Triage Assessment</h2>
                  <p className="font-headline-md text-headline-md text-on-surface">{sev.label}</p>
                  {triageResult.score !== undefined && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      Score: {triageResult.score}/100 • Confidence: {triageResult.confidence}%
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`${sev.pill} px-4 py-2 rounded-full font-label-sm text-label-sm`}>
                  {getHospitalVisitLabel(triageResult.recommendation)}
                </div>
                {triageResult.possible_conditions.length > 0 && (
                  <p className="text-xs text-on-surface-variant max-w-[200px] text-right">
                    Possible: {triageResult.possible_conditions.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Chat Messages */}
        <div ref={chatRef} className="flex flex-col gap-stack-md overflow-y-auto max-h-[50vh] pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0 shadow-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {msg.isFollowUp ? 'help' : 'vital_signs'}
                  </span>
                </div>
              )}
              <div className={`rounded-xl p-6 shadow-[0_15px_30px_rgba(0,0,0,0.04)] ${
                msg.role === 'ai'
                  ? 'bg-surface rounded-tl-sm border border-white/50'
                  : 'bg-secondary-container rounded-tr-sm'
              }`}>
                <p className={`font-body-lg text-body-lg ${msg.role === 'ai' ? 'text-on-surface' : 'text-on-secondary-container'}`}>{msg.text}</p>

                {/* Immediate Actions */}
                {msg.immediateActions && msg.immediateActions.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-label-sm text-label-sm text-red-700 mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">priority_high</span>
                      Immediate Actions
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                      {msg.immediateActions.map((action, j) => (
                        <li key={j}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* First Aid Instructions */}
                {msg.firstAid && msg.firstAid.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-label-sm text-label-sm text-blue-700 mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">medical_services</span>
                      First Aid
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                      {msg.firstAid.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hospital Visit Timing */}
                {msg.hospitalVisit && (
                  <div className="mt-3 px-3 py-2 bg-surface-container-low rounded-lg">
                    <p className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {getHospitalVisitLabel(msg.hospitalVisit)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4">
                    {msg.actions.includes('call_emergency') && (
                      <button
                        className="bg-error text-on-error font-label-sm text-label-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                        onClick={() => window.location.href = 'tel:112'}
                      >
                        <span className="material-symbols-outlined text-[18px]">call</span>
                        Call Emergency
                      </button>
                    )}
                    {msg.actions.includes('activate_sos') && (
                      <button
                        className="bg-primary text-on-primary font-label-sm text-label-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                        onClick={() => router.push('/sos')}
                      >
                        <span className="material-symbols-outlined text-[18px]">sos</span>
                        Activate SOS
                      </button>
                    )}
                    {msg.actions.includes('find_hospital') && (
                      <button
                        className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 hover:bg-surface-dim transition-colors"
                        onClick={() => router.push('/hospital-finder')}
                      >
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        Find Hospital
                      </button>
                    )}
                    {msg.actions.includes('notify_contacts') && (
                      <button
                        className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 hover:bg-surface-dim transition-colors"
                        onClick={() => router.push('/emergency-contacts')}
                      >
                        <span className="material-symbols-outlined text-[18px]">contacts</span>
                        Notify Contacts
                      </button>
                    )}
                    {msg.actions.includes('show_qr') && (
                      <button
                        className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 hover:bg-surface-dim transition-colors"
                        onClick={() => router.push('/qr-profile')}
                      >
                        <span className="material-symbols-outlined text-[18px]">qr_code</span>
                        QR Profile
                      </button>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                {msg.disclaimer && (
                  <p className="mt-4 text-xs text-on-surface-variant/60 italic">{msg.disclaimer}</p>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              </div>
              <div className="bg-surface rounded-xl p-6 rounded-tl-sm border border-white/50">
                <p className="font-body-lg text-body-lg text-on-surface-variant animate-pulse">Analyzing symptoms...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-4 w-full">
          <div className="bg-surface-container-low rounded-full p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-outline px-4"
              placeholder="Speak or type your symptoms..."
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container transition-colors shrink-0 disabled:opacity-50"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
}
