const GLOBAL = window.GLOBAL || {}
GLOBAL.requestSymbols = Object.create(null)

GLOBAL.requestCancel = (rSymbol, msg = '') => {
  if (GLOBAL.requestSymbols[rSymbol]) {
    GLOBAL.requestSymbols[rSymbol](msg)
    delete GLOBAL.requestSymbols[rSymbol]
  }
}

export const dva = {
  config: {
    onError(err) {
      err.preventDefault()
      console.error(err.message)
    },
  },
}
