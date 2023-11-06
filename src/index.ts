import { getDiff } from 'json-difference'
import { readFileSync } from 'fs'
import { TraduoraClient, TraduoraClientConfig } from './traduora-client'

export async function addTerms(translationsPath: string, locale: string, config: TraduoraClientConfig) {
  if (config.dryRun) {
    console.log('DRY RUN')
  }

  let translations = JSON.parse(readFileSync(translationsPath, 'utf-8'))

  const Traduora = new TraduoraClient(config)

  const savedTranslations = await Traduora.getTranslations(locale)

  const { added } = getDiff(savedTranslations, translations)

  for (const [key, value] of added) {
    if (!config.dryRun) {
      const term = await Traduora.addTerm(key)
      await Traduora.addTranslation(term.id, locale, value)
    }
    console.log(`Term ${key} added`)
  }
}

export async function addTranslations(translationsPath: string, locale: string, config: TraduoraClientConfig) {
  if (config.dryRun) {
    console.log('DRY RUN')
  }

  let translations = JSON.parse(readFileSync(translationsPath, 'utf-8'))

  const Traduora = new TraduoraClient(config)

  const en = await Traduora.getTranslations(locale)
  const terms = await Traduora.getTerms()

  const { edited } = getDiff(en, translations)

  for (const [key, _, value] of edited) {
    const term = terms.find(term => term.value === key)
    if (!term) {
      throw new Error(`Term ${key} not found`)
    }

    if (!config.dryRun) {
      await Traduora.addTranslation(term.id, locale, value)
    }
    console.log(`Term ${key} translated to ${value} for locale ${locale}`)
  }
}

export { TraduoraClient } from './traduora-client'
