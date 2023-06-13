import { getDiff } from 'json-difference'
import { readFileSync } from 'fs'
import { TraduoraClient } from './traduora-client'

async function main(translationsPath: string, url: string, projectId: string, clientId: string, clientSecret: string) {
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

main(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6])
