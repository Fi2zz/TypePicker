
  public setData(next: Function) {
    let result = typeof next === "function" ? next() : next;
    let bindData = this.state.selection <= 2;
    if (isPlainObject(result)) {
      const map = {};

      let dates = Object.keys(result).map(item => {
        return this.parse(item, this.state.dateFormat);
      });

      dates = dates.filter(item => !!item).sort((a, b) => a - b);

      let data = dates.map(item => {
        let f = this.format(item, this.state.dateFormat);
        return {
          date: f,
          ...result[f]
        };
      });
      this.setState({ data: simpleListToMap(data, "date"), bindData });
    }
  }