export const classNames = (...args: unknown[]) => {
  const classes = args.filter(Boolean).join(' ')
  return classes
}
