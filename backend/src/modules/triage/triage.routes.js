const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { decrypt } = require('../../utils/encryption');
const MedicalProfile = require('../medical/medical.model');
const { SYSTEM_PROMPT, buildUserMessage } = require('./triage.prompt');
const { callAI } = require('./ai-provider');

// ─── Critical Symptoms (Rule-Based Safety Net) ───────────────────────
const CRITICAL_SYMPTOMS = [
  'chest pain', 'heart attack', 'difficulty breathing', 'can\'t breathe',
  'heavy bleeding', 'severe bleeding', 'seizure', 'convulsion',
  'unconscious', 'unresponsive', 'not breathing', 'choking',
  'stroke', 'anaphylaxis', 'severe allergic', 'overdose',
  'cardiac arrest', 'heart stopped', 'suicidal', 'poisoning',
  'severe burns', 'major trauma', 'heat stroke', 'shock',
  'loss of consciousness',
];

/**
 * Fast rule-based check for critical symptoms.
 * This fires BEFORE the AI call to ensure zero delay for emergencies.
 */
const checkCriticalSymptoms = (symptoms) => {
  const lowerSymptoms = symptoms.toLowerCase();
  return CRITICAL_SYMPTOMS.some((critical) => lowerSymptoms.includes(critical));
};

/**
 * Build a consistent full-format triage response object.
 * Used by rule-based, AI, and fallback paths to ensure the
 * frontend always receives the same shape.
 */
const buildTriageResponse = (overrides = {}) => {
  const defaults = {
    severity: {
      level: 'MODERATE',
      color: 'YELLOW',
      score: 50,
      confidence: 50,
    },
    summary: '',
    possible_conditions: [],
    reasoning: '',
    immediate_actions: [],
    first_aid: [],
    recommendations: {
      activate_sos: false,
      notify_contacts: false,
      start_live_tracking: false,
      show_qr_profile: false,
      show_hospital_finder: true,
      hospital_visit: 'MONITOR',
      call_emergency_services: false,
    },
    follow_up_question: '',
    disclaimer: 'PulseGuard AI provides emergency triage guidance only and is not a substitute for professional medical care.',
  };

  // Deep merge severity and recommendations
  const merged = { ...defaults, ...overrides };
  if (overrides.severity) {
    merged.severity = { ...defaults.severity, ...overrides.severity };
  }
  if (overrides.recommendations) {
    merged.recommendations = { ...defaults.recommendations, ...overrides.recommendations };
  }
  return merged;
};

/**
 * Attempt to parse the AI's response text as JSON.
 * The AI should return pure JSON, but we handle cases where
 * it wraps it in markdown code fences or adds extra text.
 */
const parseAIResponse = (responseText) => {
  if (!responseText) return null;

  // Try direct parse first
  try {
    return JSON.parse(responseText);
  } catch {
    // ignore
  }

  // Try extracting JSON from markdown code fences
  const fenceMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // ignore
    }
  }

  // Try extracting any JSON object
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // ignore
    }
  }

  return null;
};


// ─── POST /api/triage/assess ──────────────────────────────────────────
router.post('/assess', authenticate, asyncHandler(async (req, res) => {
  const {
    symptoms,
    duration,
    painScore,
    additionalNotes,
    vitalSigns,
    location,
    conversationHistory,
  } = req.body;

  if (!symptoms || symptoms.trim().length === 0) {
    throw new ApiError(400, 'Symptoms description is required.');
  }

  // ── Step 1: Rule-based critical check (instant, no AI delay) ──
  const isCritical = checkCriticalSymptoms(symptoms);
  if (isCritical) {
    const criticalResponse = buildTriageResponse({
      severity: {
        level: 'CRITICAL',
        color: 'RED',
        score: 95,
        confidence: 90,
      },
      summary: 'Critical symptoms detected. Immediate emergency action is required. Do not delay seeking help.',
      possible_conditions: ['Potential life-threatening emergency'],
      reasoning: 'One or more critical emergency keywords were detected in your symptom description. This triggers an immediate safety response.',
      immediate_actions: [
        'Call emergency services immediately (112 / 108 / 911)',
        'Do not move unless you are in immediate danger',
        'If someone is with you, ask them to stay and assist',
      ],
      first_aid: [
        'Stay calm and try to remain still',
        'If experiencing chest pain, sit upright and loosen tight clothing',
        'If bleeding heavily, apply firm direct pressure with a clean cloth',
        'If someone is unconscious but breathing, place them in the recovery position',
      ],
      recommendations: {
        activate_sos: true,
        notify_contacts: true,
        start_live_tracking: true,
        show_qr_profile: true,
        show_hospital_finder: true,
        hospital_visit: 'IMMEDIATE',
        call_emergency_services: true,
      },
      follow_up_question: '',
      disclaimer: 'PulseGuard AI provides emergency triage guidance only and is not a substitute for professional medical care.',
    });

    return res.status(200).json({
      success: true,
      source: 'rule_based',
      ...criticalResponse,
    });
  }

  // ── Step 2: Fetch patient context ──
  let medicalProfile = {};
  try {
    const profile = await MedicalProfile.findOne({ userId: req.userId });
    if (profile) {
      medicalProfile = {
        bloodGroup: profile.bloodGroup || '',
        allergies: decrypt(profile.allergies) || [],
        conditions: decrypt(profile.conditions) || [],
        medications: decrypt(profile.medications) || [],
        surgeries: decrypt(profile.surgeries) || [],
      };
    }
  } catch (err) {
    console.error('[Triage] Failed to fetch medical profile:', err.message);
  }

  const patient = {
    name: req.user?.name || '',
    age: req.user?.age || '',
    gender: req.user?.gender || '',
    phone: req.user?.phone || '',
    emergencyContacts: req.user?.emergencyContacts || [],
  };

  // ── Step 3: Build the user message ──
  const userMessage = buildUserMessage({
    patient,
    medicalProfile,
    symptoms,
    duration,
    painScore,
    additionalNotes,
    vitalSigns: vitalSigns || {},
    location: location || {},
    currentTime: new Date().toISOString(),
  });

  // ── Step 4: Call AI via provider abstraction ──
  try {
    const aiResponseText = await callAI(
      SYSTEM_PROMPT,
      userMessage,
      conversationHistory || []
    );

    // ── Step 5: Parse the structured JSON response ──
    const parsed = parseAIResponse(aiResponseText);

    if (parsed) {
      const triageResult = buildTriageResponse(parsed);

      return res.status(200).json({
        success: true,
        source: 'ai',
        ...triageResult,
      });
    }

    // AI returned text but not valid JSON — wrap it as a summary
    const fallbackFromText = buildTriageResponse({
      summary: aiResponseText.substring(0, 500),
      severity: {
        level: 'MODERATE',
        color: 'YELLOW',
        score: 50,
        confidence: 30,
      },
    });

    return res.status(200).json({
      success: true,
      source: 'ai_partial',
      ...fallbackFromText,
    });

  } catch (error) {
    // ── Step 6: Fallback if AI provider fails ──
    console.error(`[Triage] AI provider error:`, error.message);

    const fallbackResponse = buildTriageResponse({
      severity: {
        level: 'MODERATE',
        color: 'YELLOW',
        score: 50,
        confidence: 20,
      },
      summary: 'Unable to complete AI assessment at this time. Based on initial analysis, please monitor your symptoms closely and seek medical attention if they worsen.',
      immediate_actions: [
        'Monitor your symptoms carefully',
        'Contact a healthcare provider if symptoms worsen',
        'Use SOS if you feel the situation is critical',
      ],
      recommendations: {
        show_hospital_finder: true,
        hospital_visit: 'TODAY',
      },
    });

    return res.status(200).json({
      success: true,
      source: 'fallback',
      ...fallbackResponse,
    });
  }
}));

module.exports = router;
