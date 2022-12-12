

const log = {
  debug: () => {},
  info(...args: any) {console.info(...args)},
  error(...args: any) {console.error(...args)},
}

if (process.env.NODE_ENV !== 'production') {
  log.debug = (...args: any) => { console.log(...args) }
}


export default log
