function createToastUiClasses(prefix) {
  return {
    toast: `${prefix}-toast`,
    toastLabel: `${prefix}-toast-label`,
    toastStatus: `${prefix}-toast-status`,
    toastTarget: `${prefix}-toast-target`,
    toastLeading: `${prefix}-toast-leading`,
    toastMark: `${prefix}-toast-mark`,
    toastActions: `${prefix}-toast-actions`,
    toastStack: `${prefix}-toast-stack`,
  };
}

export { createToastUiClasses };
