import { redirect } from 'next/navigation';

/** Unauthenticated duplicate of /editor — always send authors to the protected editor. */
export default function BuilderPage() {
  redirect('/editor');
}
