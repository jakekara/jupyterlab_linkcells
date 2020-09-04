let last: number | undefined;

export default (): string => {
  const next = Date.now();

  if (last && next <= last) {
    console.error("ID Error. Are we going back in time?");
    return undefined;
  }

  const ret = next.toString(36);
  last = next;
  return '_' + ret;
}
