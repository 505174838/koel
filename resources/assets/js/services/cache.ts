const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24 // 1 day

export const Cache = {
  storage: new Map<any, {
    time: number,
    value: any
  }>(),

  normalizeKey: (key: any) => typeof key === 'object' ? JSON.stringify(key) : key,

  has (key: any) {
    return this.hit(this.normalizeKey(key))
  },

  get<T> (key: any) {
    return this.storage.get(this.normalizeKey(key))!.value as T
  },

  set (key: any, value: any) {
    this.storage.set(this.normalizeKey(key), {
      value,
      time: Date.now()
    })
  },

  hit (key: any) {
    return !this.miss(this.normalizeKey(key))
  },

  miss (key: any) {
    key = this.normalizeKey(key)

    if (!this.storage.has(key)) return true
    const { time } = this.storage.get(key)!

    if (time < Date.now() - CACHE_EXPIRATION_TIME) {
      this.storage.delete(key)
      return true
    }

    return false
  },

  invalidate (key: any) {
    this.storage.delete(this.normalizeKey(key))
  },

  async resolve<T> (key: any, fetcher: Closure) {
    key = this.normalizeKey(key)

    this.hit(key) || this.set(key, await fetcher())
    return this.get<T>(key)
  }
}