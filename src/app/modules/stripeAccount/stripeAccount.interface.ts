import { Types } from "mongoose";

export interface IStripeAccounts {
  userId: Types.ObjectId; // Reference to the user who owns the account 67f9eb05ff613f3447507063
  accountId: string; // Stripe account ID
  isCompleted: boolean; // Status indicating if the onboarding is completed
}
