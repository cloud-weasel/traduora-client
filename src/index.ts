import { getDiff } from 'json-difference'
import { readFileSync } from 'fs'
import { TraduoraClient, TraduoraClientConfig } from './traduora-client'

export async function addTerms(translationsPath: string, locale: string, config: TraduoraClientConfig) {
  if (config.dryRun) {
    console.log('DRY RUN')
  }

  let translations = JSON.parse(readFileSync(translationsPath, 'utf-8'))

  const Traduora = new TraduoraClient(config)

  await Traduora.login()

  const savedTranslations = await Traduora.getTranslations(locale)

  const { added } = getDiff(savedTranslations, translations, true)

  await Promise.all(
    added.map(([key, value]) =>
      (async () => {
        if (!config.dryRun) {
          const term = await Traduora.addTerm(key)
          await Traduora.addTranslation(term.id, locale, value)
        }
        console.log(`Term ${key} added`)
      })()
    )
  )
}

export async function addTranslations(translationsPath: string, locale: string, config: TraduoraClientConfig) {
  if (config.dryRun) {
    console.log('DRY RUN')
  }

  let translations = JSON.parse(readFileSync(translationsPath, 'utf-8'))

  const Traduora = new TraduoraClient(config)

  await Traduora.login()

  const en = await Traduora.getTranslations(locale)

  const { edited } = getDiff(en, translations, true)

  await Promise.all(
    edited.map(([key, value]) =>
      (async () => {
        if (!config.dryRun) {
          const term = await Traduora.addTerm(key)
          await Traduora.addTranslation(term.id, locale, value)
        }
        console.log(`Term ${key} translated to ${value} for locale ${locale}`)
      })()
    )
  )
}

export { TraduoraClient } from './traduora-client'
