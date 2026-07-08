export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.parse({
    body: req.body,
    params: req.params,
    query: req.query,
  })

  // req.body is writable, but in Express 5 req.query / req.params are read-only
  // getters — so merge parsed values in place instead of reassigning them.
  if (parsed.body) req.body = parsed.body
  if (parsed.params) Object.assign(req.params, parsed.params)
  if (parsed.query) Object.assign(req.query, parsed.query)
  next()
}
