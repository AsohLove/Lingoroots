
import { api } from './api';

import type {
  ContributorApplication,
  ContributorApplicationDecision,
  CreateApplicationInput,
  LanguageAuthorizationRecord,
  LanguageOption,
  LanguageVariant,
  UpdateApplicationInput,
} from '../types/governance';

export function getLanguages() {
  return api<LanguageOption[]>('/languages');
}

export function getLanguageVariants(languageId: string) {
  return api<LanguageVariant[]>(
    `/languages/${languageId}/variants`,
  );
}

export function createContributorApplication(
  input: CreateApplicationInput,
) {
  return api<ContributorApplication>('/contributor-applications', {
    method: 'POST',
    body: input,
  });
}

export function getMyContributorApplications() {
  return api<ContributorApplication[]>('/me/contributor-applications');
}

export function updateContributorApplication(
  applicationId: string,
  input: UpdateApplicationInput,
) {
  return api<ContributorApplication>(
    `/contributor-applications/${applicationId}`,
    {
      method: 'PATCH',
      body: input,
    },
  );
}

export function getAdminContributorApplications() {
  return api<ContributorApplication[]>(
    '/admin/contributor-applications',
  );
}

export function reviewContributorApplication(
  applicationId: string,
  decision: ContributorApplicationDecision,
  comment: string,
) {
  return api<ContributorApplication>(
    `/admin/contributor-applications/${applicationId}/review`,
    {
      method: 'POST',
      body: { decision, comment },
    },
  );
}

export function getAdminAuthorizations() {
  return api<LanguageAuthorizationRecord[]>(
    '/admin/authorizations',
  );
}

export function revokeLanguageAuthorization(
  authorizationId: string,
  reason: string,
) {
  return api<LanguageAuthorizationRecord>(
    `/admin/authorizations/${authorizationId}/revoke`,
    {
      method: 'POST',
      body: { reason },
    },
  );
}
