
'use client';

import { useEffect, useState } from 'react';

import { api } from '../../lib/api';
import { getMyAuthorizations } from '../../lib/authorizations';

import type { LanguageAuthorization } from '../../types/authorization';

import ContentHeader from './ContentHeader';
import CourseSelector from './CourseSelector';
import LanguageSelector from './LanguageSelector';
import LevelSelector from './LevelSelector';
import LessonSelector from './LessonSelector';
import UnitSelector from './UnitSelector';
import { VocabularyForm } from './VocabularyForm';
import { ExerciseForm } from './ExerciseForm';

type Course = {
  id: string;
  name: string;
  variantId: string | null;
};

type Level = {
  id: string;
  code: string;
  name: string;
};

type Unit = {
  id: string;
  name: string;
};

type Lesson = {
  id: string;
  name: string;
};

export default function ContentWorkspace() {
  const [authorizations, setAuthorizations] = useState<
    LanguageAuthorization[]
  >([]);

  const [languageId, setLanguageId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [lessonId, setLessonId] = useState('');

  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loadingAuthorizations, setLoadingAuthorizations] =
    useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load the contributor's active language and variant authorizations.
  useEffect(() => {
    let cancelled = false;

    async function loadAuthorizations() {
      try {
        setLoadingAuthorizations(true);
        setError(null);

        const data = await getMyAuthorizations();

        if (!cancelled) {
          setAuthorizations(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load your content access.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingAuthorizations(false);
        }
      }
    }

    loadAuthorizations();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load courses, then expose only courses within the contributor's scope.
  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      if (!languageId) {
        setCourses([]);
        setLoadingCourses(false);
        return;
      }

      try {
        setLoadingCourses(true);
        setError(null);

        const data = await api<Course[]>(
          `/languages/${languageId}/courses`,
        );

        if (cancelled) {
          return;
        }

        const languageAuthorizations = authorizations.filter(
          (authorization) =>
            authorization.languageId === languageId,
        );

        const hasLanguageWideAccess = languageAuthorizations.some(
          (authorization) => authorization.variantId === null,
        );

        const authorizedVariantIds = new Set(
          languageAuthorizations
            .filter(
              (authorization) => authorization.variantId !== null,
            )
            .map((authorization) => authorization.variantId),
        );

        const accessibleCourses = data.filter((course) => {
          if (hasLanguageWideAccess) {
            return true;
          }

          return (
            course.variantId !== null &&
            authorizedVariantIds.has(course.variantId)
          );
        });

        setCourses(accessibleCourses);
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load courses.',
          );
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [languageId, authorizations]);

  // Load levels for the selected course.
  useEffect(() => {
    let cancelled = false;

    async function loadLevels() {
      if (!courseId) {
        setLevels([]);
        setLoadingLevels(false);
        return;
      }

      try {
        setLoadingLevels(true);
        setError(null);

        const data = await api<Level[]>(
          `/courses/${courseId}/levels`,
        );

        if (!cancelled) {
          setLevels(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load levels.',
          );
          setLevels([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingLevels(false);
        }
      }
    }

    loadLevels();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Load units for the selected level.
  useEffect(() => {
    let cancelled = false;

    async function loadUnits() {
      if (!levelId) {
        setUnits([]);
        setLoadingUnits(false);
        return;
      }

      try {
        setLoadingUnits(true);
        setError(null);

        const data = await api<Unit[]>(
          `/levels/${levelId}/units`,
        );

        if (!cancelled) {
          setUnits(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load units.',
          );
          setUnits([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingUnits(false);
        }
      }
    }

    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [levelId]);

  // Load lessons for the selected unit.
  useEffect(() => {
    let cancelled = false;

    async function loadLessons() {
      if (!unitId) {
        setLessons([]);
        setLoadingLessons(false);
        return;
      }

      try {
        setLoadingLessons(true);
        setError(null);

        const data = await api<Lesson[]>(
          `/units/${unitId}/lessons`,
        );

        if (!cancelled) {
          setLessons(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to load lessons.',
          );
          setLessons([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingLessons(false);
        }
      }
    }

    loadLessons();

    return () => {
      cancelled = true;
    };
  }, [unitId]);

  function handleLanguageChange(nextLanguageId: string) {
    setLanguageId(nextLanguageId);

    setCourseId('');
    setLevelId('');
    setUnitId('');
    setLessonId('');

    setCourses([]);
    setLevels([]);
    setUnits([]);
    setLessons([]);

    setLoadingCourses(false);
    setLoadingLevels(false);
    setLoadingUnits(false);
    setLoadingLessons(false);

    setError(null);
  }

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);

    setLevelId('');
    setUnitId('');
    setLessonId('');

    setLevels([]);
    setUnits([]);
    setLessons([]);

    setLoadingLevels(false);
    setLoadingUnits(false);
    setLoadingLessons(false);

    setError(null);
  }

  function handleLevelChange(nextLevelId: string) {
    setLevelId(nextLevelId);

    setUnitId('');
    setLessonId('');

    setUnits([]);
    setLessons([]);

    setLoadingUnits(false);
    setLoadingLessons(false);

    setError(null);
  }

  function handleUnitChange(nextUnitId: string) {
    setUnitId(nextUnitId);

    setLessonId('');
    setLessons([]);

    setLoadingLessons(false);

    setError(null);
  }

  if (loadingAuthorizations) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Loading your content access...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ContentHeader />

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900">
            Content scope
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Choose the curriculum location where you want to
            create content.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <LanguageSelector
            authorizations={authorizations}
            value={languageId}
            onChange={handleLanguageChange}
          />

          <CourseSelector
            courses={courses}
            value={courseId}
            onChange={handleCourseChange}
            loading={loadingCourses}
          />

          <LevelSelector
            levels={levels}
            value={levelId}
            onChange={handleLevelChange}
            loading={loadingLevels}
          />

          <UnitSelector
            units={units}
            value={unitId}
            onChange={handleUnitChange}
            loading={loadingUnits}
          />

          <LessonSelector
            lessons={lessons}
            value={lessonId}
            onChange={setLessonId}
            loading={loadingLessons}
          />
        </div>
      </section>

      {lessonId && (
        <div className="space-y-6">
          <VocabularyForm lessonId={lessonId} />

          <ExerciseForm lessonId={lessonId} />
        </div>
      )}
    </div>
  );
}
