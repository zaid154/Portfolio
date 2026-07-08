// Express 5 makes req.query a read-only getter, so express-mongo-sanitize
// (which reassigns req.query) throws on every request. This sanitizer strips
// MongoDB operator keys ($... and dotted keys) by mutating objects in place,
// without ever reassigning req.query / req.params.
function scrub(value) {
  if (!value || typeof value !== 'object') return
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key]
      continue
    }
    scrub(value[key])
  }
}

export function sanitize(req, _res, next) {
  scrub(req.body)
  scrub(req.params)
  scrub(req.query)
  next()
}
