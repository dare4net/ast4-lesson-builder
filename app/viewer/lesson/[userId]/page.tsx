"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lesson {
  lessonId: string;
  title: string;
  description?: string;
  completed: boolean;
  lastOpened: string;
  score?: number;
  totalPossible?: number;
}

export default function UserLessonsPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}/lessons`);
      const data = await res.json();
      setLessons(data);
      setLoading(false);
    }
    fetchLessons();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Lessons</h1>
      {loading ? (
        <div>Loading...</div>
      ) : lessons.length === 0 ? (
        <div className="text-gray-500">No lessons found.</div>
      ) : (
        <ul className="space-y-4">
          {lessons.map(lesson => (
            <li key={lesson.lessonId} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition">
              <div>
                <div className="text-lg font-semibold">{lesson.title}</div>
                {lesson.description && <div className="text-gray-500 text-sm mb-1">{lesson.description}</div>}
                <div className="text-xs text-gray-400">Last opened: {new Date(lesson.lastOpened).toLocaleString()}</div>
                {lesson.completed && <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Completed</span>}
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                {lesson.totalPossible > 0 && (
                  <span className="text-sm text-blue-600 font-medium">Score: {lesson.score ?? 0}/{lesson.totalPossible}</span>
                )}
                <Link href={`/viewer/${lesson.lessonId}?userId=${userId}`} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">View</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
