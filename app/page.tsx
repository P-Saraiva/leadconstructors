import Link from 'next/link'
import PromptForm from '@/components/prompt-form'

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <h1 className="text-4xl font-bold">Deliver Qualified Leads with Confidence</h1>
      <p className="max-w-xl text-lg text-slate-300">
        A minimal customer portal to access your leads securely.
      </p>
      <div className="flex gap-3">
        <Link href="/login" className="button-secondary">Login</Link>
        <Link href="/signup" className="button-primary">Create account</Link>
      </div>
      <div className="mt-8 w-full max-w-xl text-left">
        <PromptForm />
      </div>
    </main>
  )
}
