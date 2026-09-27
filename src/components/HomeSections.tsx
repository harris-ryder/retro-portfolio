'use client'

import { useState } from 'react'
import { Tabs } from '@/components/Tabs'
import { ProjectList, type Item } from '@/components/ProjectList'

type Section = 'work' | 'playground'

export function HomeSections({ sections }: { sections: Record<Section, Item[]> }) {
  const [section, setSection] = useState<Section>('work')
  // the first list lands instantly; after a switch, rows type themselves in
  const [switched, setSwitched] = useState(false)

  const options = [
    { id: 'work' as const, label: 'Work', count: sections.work.length },
    { id: 'playground' as const, label: 'Playground', count: sections.playground.length },
  ]

  return (
    <section className="flex flex-col gap-6">
      <Tabs
        name="Sections"
        options={options}
        value={section}
        onChange={id => {
          setSection(id)
          setSwitched(true)
        }}
      />
      <ProjectList key={section} items={sections[section]} typeIn={switched} />
    </section>
  )
}
