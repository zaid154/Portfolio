import dns from 'dns'

/**
 * Make DNS resolution resilient before we connect to Atlas.
 *
 * Some machines (notably certain Windows setups) hand Node a DNS resolver of
 * 127.0.0.1 with nothing actually listening. Every lookup then fails with
 * ECONNREFUSED — including the SRV lookup a `mongodb+srv://` URI needs — so the
 * app can't reach MongoDB even though the connection string is correct.
 *
 * Resolution order:
 *   1. If DNS_SERVERS is set (comma-separated), honour it verbatim.
 *   2. Else, if the only configured resolver is loopback (or none), fall back to
 *      public resolvers so `mongodb+srv://` works.
 *   3. Otherwise leave the OS-provided resolvers untouched.
 *
 * Runs at most once per process.
 */
let done = false

export function configureDns() {
  if (done) return
  done = true

  const override = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (override.length) {
    dns.setServers(override)
    console.log(`DNS: using DNS_SERVERS override -> ${override.join(', ')}`)
    return
  }

  const current = dns.getServers()
  const onlyLoopback =
    current.length === 0 ||
    current.every((s) => s === '::1' || s.startsWith('127.'))

  if (onlyLoopback) {
    const fallback = ['8.8.8.8', '1.1.1.1']
    dns.setServers(fallback)
    console.log(
      `DNS: local resolver was ${JSON.stringify(current)} (loopback/none); ` +
        `falling back to ${fallback.join(', ')}`
    )
  }
}
