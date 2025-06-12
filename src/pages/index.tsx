import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { EditorWindow } from '@/components/EditorWindow';

export default function Home() {
  const user = useUser();
  const router = useRouter();
  const { draftId } = router.query;

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleDraftSelect = (draftId: string | null) => {
    if (draftId) {
      router.push(`/?draftId=${draftId}`);
    } else {
      router.push('/');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return draftId ? (
    <EditorWindow draftId={draftId as string} onBack={handleBack} />
  ) : (
    <HomeScreen onDraftSelect={handleDraftSelect} />
  );
}
