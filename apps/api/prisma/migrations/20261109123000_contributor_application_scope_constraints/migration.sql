CREATE UNIQUE INDEX "ContributorApplication_active_language_unique"
ON "ContributorApplication" ("userId", "languageId")
WHERE "variantId" IS NULL
  AND "status" IN (
    'PENDING',
    'UNDER_REVIEW',
    'CHANGES_REQUESTED'
  );

CREATE UNIQUE INDEX "ContributorApplication_active_variant_unique"
ON "ContributorApplication" ("userId", "languageId", "variantId")
WHERE "variantId" IS NOT NULL
  AND "status" IN (
    'PENDING',
    'UNDER_REVIEW',
    'CHANGES_REQUESTED'
  );


CREATE UNIQUE INDEX "LanguageAuthorization_active_language_unique"
ON "LanguageAuthorization" ("userId", "languageId")
WHERE "variantId" IS NULL AND "revokedAt" IS NULL;

CREATE UNIQUE INDEX "LanguageAuthorization_active_variant_unique"
ON "LanguageAuthorization" ("userId", "languageId", "variantId")
WHERE "variantId" IS NOT NULL AND "revokedAt" IS NULL;
