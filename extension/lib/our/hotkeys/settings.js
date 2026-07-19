function readBooleanSetting(data, key) {
  const raw = data[key];
  return raw !== false;
}

export { readBooleanSetting };
