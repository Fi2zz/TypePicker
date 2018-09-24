function setLanguage(pack: any) {
  if (
    isArray(pack.days) &&
    isArray(pack.months) &&
    typeof pack.title === "function"
  ) {
    this.language = {
      week: pack.days,
      months: pack.months,
      title: pack.title
    };
  }
}
