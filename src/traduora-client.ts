import axios from 'axios'
import { Term } from './types'

export interface TraduoraClientConfig {
  url: string
  projectId: string
  clientId: string
  clientSecret: string
  dryRun?: boolean
}

export class TraduoraClient {
  private url: string
  private projectId: string
  private clientId: string
  private clientSecret: string
  private token: string
  private expiresAt: number

  constructor({ url, projectId, clientId, clientSecret }: TraduoraClientConfig) {
    this.url = url
    this.projectId = projectId
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.token = ''
    this.expiresAt = 0
  }

  async login(): Promise<void> {
    const response = await axios.post<{
      access_token: string
      token_type: string
      expires_in: string
    }>(`${this.url}/api/v1/auth/token/`, {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    this.token = response.data.access_token
    this.expiresAt = Date.now() + 82800000 // The token is valid for 24h but the expiresAt is set to + 23h
  }

  async ensureLogin(): Promise<void> {
    if (!this.token || Date.now() > this.expiresAt) {
      await this.login()
    }
  }

  async getTranslations(locale: string): Promise<JSON> {
    await this.ensureLogin()

    try {
      const response = await axios.get(`${this.url}/api/v1/projects/${this.projectId}/exports?locale=${locale}&format=jsonnested`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      return response.data
    } catch (error: any) {
      if (error.response?.data.error.code === 'NotFound') {
        return this.getTranslations('en')
      } else {
        throw error
      }
    }
  }

  async addTerm(term: string): Promise<Term> {
    await this.ensureLogin()

    const response = await axios.post(
      `${this.url}/api/v1/projects/${this.projectId}/terms`,
      {
        value: term,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.data
  }

  async addTranslation(termId: string, locale: string, value: string): Promise<AddTermResponse> {
    await this.ensureLogin()

    const response = await axios.patch(
      `${this.url}/api/v1/projects/${this.projectId}/translations/${locale}`,
      {
        termId,
        value,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.data
  }

  async getTerms(): Promise<Term[]> {
    await this.ensureLogin()

    const response = await axios.get(`${this.url}/api/v1/projects/${this.projectId}/terms`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    return response.data.data
  }
}
