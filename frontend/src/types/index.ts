export interface Session {
  id: string
  patientRef?: string
  createdAt: string
  expiresAt: string
  status: 'pending' | 'image_received' | 'analyzing' | 'complete' | 'error'
  qrUrl: string
}

export interface WoundAssessment {
  id: string
  sessionId: string
  imageUrl: string
  analyzedAt: string
  woundType: string
  probableCause: string
  estimatedDimensions: WoundDimensions
  woundDepth: 'superficial' | 'partial_thickness' | 'full_thickness' | 'unknown'
  woundStage?: string
  woundBed: string
  exudate: ExudateInfo
  periwoundSkin: string
  infectionSigns: string[]
  diagnosis: string
  differentialDiagnosis: string[]
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  healingPhase: 'inflammatory' | 'proliferative' | 'remodeling' | 'chronic' | 'unknown'
  immediateActions: string[]
  dressingSuggestions: string[]
  referralRecommendations: string[]
  followUpTimeline: string
  additionalWorkup: string[]
  redFlags: string[]
  disclaimer: string
}

export interface WoundDimensions {
  lengthCm: string
  widthCm: string
  depthCm: string
  note: string
}

export interface ExudateInfo {
  amount: 'none' | 'scant' | 'moderate' | 'heavy'
  type: string
}
