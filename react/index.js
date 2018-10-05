import React from "react";
import "../dist/style.css";
import PropTypes from "prop-types";
import TypePicker from "../dist/typepicker.esm";

export class ReactTypePicker extends React.Component {
  app = null;
  componentDidMount() {
    this.app = new TypePicker({
      el: "#react-datepicker",
      format: this.props.dateFormat || "YYYY-MM-DD",
      views: this.props.views || 1,
      selection: this.props.selection || 1,
      limit: this.props.limit || 1,
      startDate: this.props.startDate,
      endDate: this.props.endDate
    });

    if (typeof this.props.onSelect === "function") {
      this.app.onSelect(this.props.onSelect.bind(this));
    }
    if (typeof this.props.onRender === "function") {
      this.app.onRender(this.props.onRender.bind(this));
    }
    if (this.props.disables) {
      this.app.disable(this.props.disables);
    }
    if (this.props.dates) {
      this.app.setDates(this.props.dates);
    }
    if (this.props.i18n) {
      this.app.i18n(this.props.i18n);
    }
  }
  render() {
    return <div id={"react-datepicker"} />;
  }
}

ReactTypePicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onRender: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
  dates: PropTypes.array,
  disables: PropTypes.object
};
