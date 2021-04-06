export const insertQuerySearch = (key: string, value: string | number) => {
  key = encodeURIComponent(key);
  value = encodeURIComponent(value);

  let s = document.location.search;
  const kvp = key + "=" + value;

  const r = new RegExp("(&|\\?)" + key + "=[^&]*");

  s = s.replace(r, "$1" + kvp);

  if (!RegExp.$1) {
    s += (s.length > 0 ? "&" : "?") + kvp;
  }

  window.history.replaceState(null, document.title, s);
};
