export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type SceneType = 'cafe' | 'market';
export type MistakeType = 'some_any' | 'much_many' | 'countable_uncountable' | 'none' | 'other';
export type NextAction = 'ask_repeat' | 'give_hint' | 'advance_scene' | 'ask_choice';

export interface TutorMeta {
  scene: SceneType;
  learner_utt: string | null;
  quantifier_used: string | null;
  is_quantifier_correct: boolean | null;
  mistake_type: MistakeType;
  attempts_on_point: number;
  score_delta: number;
  next_action: NextAction;
}

export interface SessionSummary {
  total_turns: number;
  total_errors: number;
  errors_by_type: Record<string, number>;
  final_score: number;
}

export interface SessionState {
  isActive: boolean;
  currentScene: SceneType;
  score: number;
  totalErrors: number;
  mistakes: Record<MistakeType, number>;
  messages: ChatMessage[];
  isLoading: boolean;
  isFinished: boolean;
}