export type AuthorizedLanguage = {
  id: string;
  name: string;
};

export type AuthorizedVariant = {
  id: string;
  name: string;
};

export type LanguageAuthorization = {
  id: string;
  languageId: string;
  variantId: string | null;
  language: AuthorizedLanguage;
  variant: AuthorizedVariant | null;
  createdAt: string;
  updatedAt: string;
};