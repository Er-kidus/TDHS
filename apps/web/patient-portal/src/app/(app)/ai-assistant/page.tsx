'use client';

import Link from 'next/link';
import { Brain, MessageSquareHeart, Sparkles, ArrowRight } from 'lucide-react';

import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

const cards = [
  {
    title: 'Summarize a visit',
    description: 'Ask the assistant to condense a telemedicine or care visit into clear next steps.',
    href: '/telemedicine',
  },
  {
    title: 'Find the next action',
    description: 'Get help with prescriptions, appointments, lab results, or insurance tasks.',
    href: '/appointments',
  },
  {
    title: 'Escalate a care issue',
    description: 'Open support, triage notes, or care-team messaging when something needs review.',
    href: '/messages',
  },
] as const;

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-300/80">AI assistant</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Ask for summaries, next steps, and support</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              The assistant works across care, telemedicine, and pharmacy to help you move faster without losing context.
            </p>
          </div>
          <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-sky-400">
            Join a visit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <AIAssistantPanel />
        <div className="space-y-4">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Brain className="h-4 w-4 text-sky-300" /> What it can do</CardTitle>
              <CardDescription className="text-slate-400">Use AI to shorten the work between symptoms, answers, and action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Summarizes visits and preserves bilingual responses when needed.</p>
              <p>Surfaces care reminders, medication tasks, and follow-up suggestions.</p>
              <p>Respects consent before storing learning samples.</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-sky-300" /> Fast actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cards.map((card) => (
                <Link key={card.href} href={card.href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 hover:border-sky-400/40 hover:bg-slate-950">
                  <span>
                    <span className="block font-medium text-white">{card.title}</span>
                    <span className="block text-xs text-slate-400">{card.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-sky-300" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><MessageSquareHeart className="h-4 w-4 text-sky-300" /> Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              If the assistant cannot answer safely, open messages or telemedicine so a clinician can review it directly.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
