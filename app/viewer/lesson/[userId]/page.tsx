import { redirect } from 'next/navigation'

/** Dead list-by-user viewer. Students open lessons at /viewer/[id]. */
export default function LegacyUserLessonsPage() {
  redirect('/dashboard/student')
}
