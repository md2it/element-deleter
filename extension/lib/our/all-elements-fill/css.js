var ALL_ELEMENTS_FILL_CSS = `* { background-color: hsl(150 50% 50% / 0.18) !important; color: #012292 !important; }
*:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * { background-color: hsl(200 66.67% 50% / 0.18) !important; }
* * *:has(> *) { background-color: hsl(200 66.67% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * { background-color: hsl(225 75% 50% / 0.18) !important; }
* * * *:has(> *) { background-color: hsl(225 75% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * { background-color: hsl(250 83.33% 50% / 0.18) !important; }
* * * * *:has(> *) { background-color: hsl(250 83.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * { background-color: hsl(150 50% 50% / 0.18) !important; }
* * * * * *:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* * * * * * *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * { background-color: hsl(200 66.67% 50% / 0.18) !important; }
* * * * * * * *:has(> *) { background-color: hsl(200 66.67% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * { background-color: hsl(225 75% 50% / 0.18) !important; }
* * * * * * * * *:has(> *) { background-color: hsl(225 75% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * { background-color: hsl(250 83.33% 50% / 0.18) !important; }
* * * * * * * * * *:has(> *) { background-color: hsl(250 83.33% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * * { background-color: hsl(150 50% 50% / 0.18) !important; }
* * * * * * * * * * *:has(> *) { background-color: hsl(150 50% 50% / 0.18) !important; background-clip: padding-box !important; }
* * * * * * * * * * * * { background-color: hsl(175 58.33% 50% / 0.18) !important; }
* * * * * * * * * * * *:has(> *) { background-color: hsl(175 58.33% 50% / 0.18) !important; background-clip: padding-box !important; }`;
function buildAllElementsFillCss(_config) {
  return ALL_ELEMENTS_FILL_CSS;
}

export { ALL_ELEMENTS_FILL_CSS, buildAllElementsFillCss };
