import { getDiff } from 'json-difference'
import { readFileSync } from 'fs'
import { TraduoraClient } from './traduora-client'

export async function addTerms(translationsPath: string, url: string, projectId: string, clientId: string, clientSecret: string) {
  let translations = JSON.parse(readFileSync(translationsPath, 'utf-8'))

  const Traduora = new TraduoraClient({ url, projectId, clientId, clientSecret })

  await Traduora.login()

  const en = await Traduora.getTranslations('en')

  const { added } = getDiff(en, translations, true)

  await Promise.all(
    added.map(([key, value]) =>
      (async () => {
        const term = await Traduora.addTerm(key)
        await Traduora.addTranslation(term.id, 'en', value)
        console.log(`Term ${key} added`)
      })()
    )
  )
}
