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
import VocabularyForm from './VocabularyForm';

type Course = {
  id: string;
  name: string;
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

  useEffect(() => {
    async function loadAuthorizations() {
      try {
        setLoadingAuthorizations(true);
        setError(null);

        const data = await getMyAuthorizations();

        setAuthorizations(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load your content access.',
        );
      } finally {
        setLoadingAuthorizations(false);
      }
    }

    loadAuthorizations();
  }, []);

  useEffect(() => {
    if (!languageId) {
      return;
    }

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError(null);

        const data = await api<Course[]>(
          `/languages/${languageId}/courses`,
        );

        setCourses(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load courses.',
        );
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, [languageId]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    async function loadLevels() {
      try {
        setLoadingLevels(true);
        setError(null);

        const data = await api<Level[]>(
          `/courses/${courseId}/levels`,
        );

        setLevels(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load levels.',
        );
        setLevels([]);
      } finally {
        setLoadingLevels(false);
      }
    }

    loadLevels();
  }, [courseId]);

  useEffect(() => {
    if (!levelId) {
      return;
    }

    async function loadUnits() {
      try {
        setLoadingUnits(true);
        setError(null);

        const data = await api<Unit[]>(
          `/levels/${levelId}/units`,
        );

        setUnits(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load units.',
        );
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    }

    loadUnits();
  }, [levelId]);

  useEffect(() => {
    if (!unitId) {
      return;
    }

    async function loadLessons() {
      try {
        setLoadingLessons(true);
        setError(null);

        const data = await api<Lesson[]>(
          `/units/${unitId}/lessons`,
        );

        setLessons(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load lessons.',
        );
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    }

    loadLessons();
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

    setError(null);
  }

  function handleLevelChange(nextLevelId: string) {
    setLevelId(nextLevelId);

    setUnitId('');
    setLessonId('');

    setUnits([]);
    setLessons([]);

    setError(null);
  }

  function handleUnitChange(nextUnitId: string) {
    setUnitId(nextUnitId);

    setLessonId('');
    setLessons([]);

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
        <VocabularyForm lessonId={lessonId} />
      )}
    </div>
  );
}