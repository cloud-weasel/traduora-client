export interface Term {
  id: string
  value: string
  labels: string[]
  date: {
    created: string
    modified: string
  }
}

export interface AddTranslationResponse {
  termId: string
  value: string
  labels: string[]
  date: {
    created: string
    modified: string
  }
}
