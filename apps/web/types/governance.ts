
export type ContributorApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type ContributorApplicationDecision =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED';

export type LanguageOption = {
  id: string;
  name: string;
};

export type LanguageVariant = {
  id: string;
  languageId: string;
  name: string;
  description: string | null;
};

export type ApplicationReview = {
  id: string;
  decision: ContributorApplicationDecision;
  comment: string;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
  };
};

export type ContributorApplication = {
  id: string;
  userId: string;
  languageId: string;
  variantId: string | null;
  expertiseStatement: string;
  evidenceUrls: string[];
  status: ContributorApplicationStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  language: LanguageOption;
  variant: LanguageVariant | null;
  reviews: ApplicationReview[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type LanguageAuthorizationRecord = {
  id: string;
  userId: string;
  languageId: string;
  variantId: string | null;
  applicationId: string | null;
  grantedById: string | null;
  revokedById: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  language: LanguageOption;
  variant: LanguageVariant | null;
  grantedBy: {
    id: string;
    name: string;
  } | null;
  revokedBy: {
    id: string;
    name: string;
  } | null;
};

export type CreateApplicationInput = {
  languageId: string;
  variantId?: string;
  expertiseStatement: string;
  evidenceUrls: string[];
};

export type UpdateApplicationInput = {
  languageId?: string;
  variantId?: string | null;
  expertiseStatement?: string;
  evidenceUrls?: string[];
};
