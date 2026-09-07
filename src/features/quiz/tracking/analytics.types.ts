import type { ConcernId, NarrativeProfileId, OfferId, QuizQuestionId, QuizStageId } from "../domain/quiz.types";

export type QuizAnalyticsEvent =
  | "quiz_opened" | "quiz_started" | "quiz_name_submitted" | "quiz_name_skipped"
  | "quiz_stage_viewed" | "quiz_answer_selected" | "quiz_answer_changed"
  | "quiz_back_clicked" | "quiz_insight_viewed" | "quiz_proof_viewed"
  | "quiz_completed" | "quiz_profile_revealed" | "quiz_offer_recommended"
  | "quiz_reward_teased" | "quiz_reward_unlock_clicked" | "quiz_wheel_started"
  | "quiz_reward_revealed" | "quiz_coupon_copied" | "quiz_timer_started"
  | "quiz_timer_5m" | "quiz_timer_1m" | "quiz_reward_expired"
  | "quiz_offer_changed" | "quiz_checkout_clicked" | "quiz_checkout_returned"
  | "quiz_restarted";

export interface QuizAnalyticsProperties {
  readonly sessionId: string;
  readonly campaignId: string;
  readonly stageId?: QuizStageId;
  readonly questionId?: QuizQuestionId;
  readonly optionId?: string;
  readonly profileId?: NarrativeProfileId;
  readonly concernId?: ConcernId;
  readonly recommendedOfferId?: OfferId;
  readonly selectedOfferId?: OfferId;
  readonly recommended_offer?: OfferId;
  readonly selected_offer?: OfferId;
  readonly recommendation_override?: boolean;
  readonly rewardId?: string;
  readonly secondsRemaining?: number;
  readonly trafficSource?: string;
  readonly utm?: Readonly<Partial<Record<"source" | "medium" | "campaign" | "content" | "term", string>>>;
  readonly experimentVariant: string;
  readonly deviceClass: "mobile" | "desktop";
  readonly nameProvided?: boolean;
}

export interface QuizTrackedEvent {
  readonly event: QuizAnalyticsEvent;
  readonly properties: QuizAnalyticsProperties;
  readonly occurredAt: string;
}
